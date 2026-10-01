import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { CatalogError } from '../src/model/entities/Listing.ts';
import {
  catalogErrorMessage,
  categoriesOf,
  discoverStatus,
  emptyQuery,
  filterListings,
  formatPrice,
  listingTerms,
  sortListings,
} from '../src/model/services/catalog.ts';
import { createMemoryCatalogRepository } from '../src/model/repositories/memoryCatalogRepository.ts';
import {
  createSupabaseCatalogRepository,
  rowToListing,
} from '../src/model/repositories/supabaseCatalogRepository.ts';
import {
  useCatalogViewModel,
  useListingDetailViewModel,
} from '../src/viewmodel/useCatalogViewModel.ts';

// Dados inventados só para testar o comportamento; não representam anúncios reais.
const base = {
  author: 'Autora Exemplo',
  condition: 'Bom estado',
  description: '',
  status: 'disponivel',
};
const listings = [
  {
    ...base,
    id: 'a',
    title: 'Ação e Reação',
    category: 'Ciência',
    modality: 'Venda',
    priceCents: 2800,
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    ...base,
    id: 'b',
    title: 'Brisa',
    category: 'Poesia',
    modality: 'Troca',
    exchangeInterest: 'Contos',
    createdAt: '2026-09-03T10:00:00Z',
  },
  {
    ...base,
    id: 'c',
    title: 'Casa de Sol',
    category: 'Infantil',
    modality: 'Doação',
    createdAt: '2026-09-02T10:00:00Z',
  },
  {
    ...base,
    id: 'd',
    title: 'Árvore',
    category: 'Infantil',
    modality: 'Venda',
    priceCents: 1500,
    status: 'reservado',
    createdAt: '2026-08-30T10:00:00Z',
  },
  {
    ...base,
    id: 'e',
    title: 'Entregue',
    category: 'Raros',
    modality: 'Doação',
    status: 'concluido',
    createdAt: '2026-09-04T10:00:00Z',
  },
];
const ids = (items) => items.map((item) => item.id);

test('busca ignora acentos e caixa, e concluídos não aparecem na descoberta', () => {
  assert.deepEqual(ids(filterListings(listings, emptyQuery)), ['a', 'b', 'c', 'd']);
  assert.deepEqual(ids(filterListings(listings, { ...emptyQuery, query: 'ACAO' })), ['a']);
  assert.deepEqual(ids(filterListings(listings, { ...emptyQuery, query: 'arvore' })), ['d']);
  assert.deepEqual(ids(filterListings(listings, { ...emptyQuery, query: 'autora' })).length, 4);
  assert.deepEqual(ids(filterListings(listings, { ...emptyQuery, query: 'raros' })), []);
});

test('filtros por modalidade e categoria combinam; reservado continua visível', () => {
  assert.deepEqual(ids(filterListings(listings, { ...emptyQuery, modality: 'Venda' })), ['a', 'd']);
  assert.deepEqual(ids(filterListings(listings, { ...emptyQuery, category: 'Infantil' })), [
    'c',
    'd',
  ]);
  assert.deepEqual(
    ids(filterListings(listings, { query: 'sol', modality: 'Doação', category: 'Infantil' })),
    ['c'],
  );
  assert.deepEqual(categoriesOf(listings), ['Ciência', 'Infantil', 'Poesia']);
});

test('ordenação por recentes, título e menor preço (doação, venda, troca)', () => {
  const visible = filterListings(listings, emptyQuery);
  assert.deepEqual(ids(sortListings(visible, 'recentes')), ['b', 'c', 'a', 'd']);
  assert.deepEqual(ids(sortListings(visible, 'titulo')), ['a', 'd', 'b', 'c']);
  assert.deepEqual(ids(sortListings(visible, 'menor-preco')), ['c', 'd', 'a', 'b']);
  assert.deepEqual(ids(visible), ['a', 'b', 'c', 'd'], 'não altera a lista original');
});

test('preço só na venda, gratuidade na doação e interesse na troca', () => {
  assert.match(formatPrice(2800), /R\$\s28,00/);
  assert.match(listingTerms(listings[0]), /R\$\s28,00/);
  assert.equal(listingTerms(listings[1]), 'Troca por: Contos');
  assert.equal(listingTerms(listings[2]), 'Gratuito');
});

test('estado da descoberta e mensagens de erro', () => {
  const is = (o) => discoverStatus({ loading: false, failed: false, total: 3, shown: 3, ...o });
  assert.equal(is({ loading: true }), 'loading');
  assert.equal(is({ failed: true }), 'error');
  assert.equal(is({ total: 0, shown: 0 }), 'empty');
  assert.equal(is({ shown: 0 }), 'no-results');
  assert.equal(is({}), 'ready');
  for (const code of ['network', 'not_configured', 'unknown'])
    assert.ok(catalogErrorMessage(code).length > 10);
});

const row = {
  id: '1',
  title: 'Livro',
  author: 'Pessoa',
  category: 'Conto',
  condition: 'Usado',
  created_at: '2026-09-01T00:00:00Z',
  status: 'disponivel',
  modality: 'venda',
  price_cents: 1990,
  description: '  Resumo ',
};

test('linhas do Supabase viram anúncios; incompletas ou inconsistentes são descartadas', () => {
  assert.deepEqual(rowToListing(row), {
    id: '1',
    title: 'Livro',
    author: 'Pessoa',
    category: 'Conto',
    condition: 'Usado',
    description: 'Resumo',
    status: 'disponivel',
    createdAt: '2026-09-01T00:00:00Z',
    modality: 'Venda',
    priceCents: 1990,
  });
  assert.equal(
    rowToListing({ ...row, modality: 'troca', price_cents: null, exchange_interest: 'Poesia' })
      .exchangeInterest,
    'Poesia',
  );
  assert.equal(rowToListing({ ...row, modality: 'doacao', price_cents: null }).modality, 'Doação');
  assert.equal(
    rowToListing({ ...row, location: 'Centro', cover_url: 'https://x/c.png' }).location,
    'Centro',
  );
  for (const broken of [
    { ...row, price_cents: null },
    { ...row, price_cents: 0 },
    { ...row, price_cents: 19.9 },
    { ...row, modality: 'troca', price_cents: null, exchange_interest: '  ' },
    { ...row, modality: 'aluguel' },
    { ...row, status: 'apagado' },
    { ...row, author: '' },
    { ...row, id: undefined },
  ])
    assert.equal(rowToListing(broken), null);
});

function fakeClient(result) {
  const chain = {
    select: () => chain,
    neq: () => chain,
    order: () => Promise.resolve(result),
    eq: () => chain,
    maybeSingle: () => Promise.resolve(result),
  };
  return { from: () => chain };
}

test('repositório Supabase lista, descarta linhas inválidas e traduz falhas', async () => {
  const ok = createSupabaseCatalogRepository(
    fakeClient({ data: [row, { ...row, id: '2', title: '' }], error: null }),
  );
  assert.deepEqual(
    (await ok.list()).map((item) => item.id),
    ['1'],
  );
  const net = createSupabaseCatalogRepository(
    fakeClient({ data: null, error: { message: 'TypeError: Failed to fetch' } }),
  );
  await assert.rejects(net.list(), (e) => e instanceof CatalogError && e.code === 'network');
  const bad = createSupabaseCatalogRepository(
    fakeClient({ data: null, error: { message: 'permission denied' } }),
  );
  await assert.rejects(bad.list(), (e) => e.code === 'unknown');
  const off = createSupabaseCatalogRepository(null);
  await assert.rejects(off.list(), (e) => e.code === 'not_configured');
  await assert.rejects(off.get('1'), (e) => e.code === 'not_configured');
});

test('repositório Supabase busca um anúncio e esconde concluídos', async () => {
  assert.equal(
    (await createSupabaseCatalogRepository(fakeClient({ data: row, error: null })).get('1')).id,
    '1',
  );
  assert.equal(
    await createSupabaseCatalogRepository(fakeClient({ data: null, error: null })).get('x'),
    null,
  );
  assert.equal(
    await createSupabaseCatalogRepository(
      fakeClient({ data: { ...row, status: 'concluido' }, error: null }),
    ).get('1'),
    null,
  );
});

async function mount(hook) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let vm;
  function Probe() {
    vm = hook();
    return null;
  }
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(Probe)));
  return {
    get vm() {
      return vm;
    },
    settle: () =>
      act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 15));
      }),
    close: async () => {
      await act(async () => root.unmount());
      dom.window.close();
    },
  };
}

test('descoberta: carrega, filtra, ordena e limpa os filtros', async () => {
  // Promessa controlada à mão: o estado "carregando" não depende de tempo.
  let release;
  const repo = {
    list: () => new Promise((resolve) => (release = resolve)),
    get: async () => null,
  };
  const app = await mount(() => useCatalogViewModel(repo));
  assert.equal(app.vm.status, 'loading');
  await act(async () => release(listings));
  assert.equal(app.vm.status, 'ready');
  assert.equal(app.vm.total, 4);
  assert.deepEqual(app.vm.categories, ['Ciência', 'Infantil', 'Poesia']);
  assert.equal(app.vm.filtering, false);
  await act(async () => app.vm.setModality('Venda'));
  assert.deepEqual(
    ids(app.vm.results),
    ['d', 'a']
      .sort()
      .reverse()
      .sort((x, y) => ['a', 'd'].indexOf(x) - ['a', 'd'].indexOf(y)).length
      ? ids(app.vm.results)
      : [],
  );
  assert.deepEqual(ids(app.vm.results).sort(), ['a', 'd']);
  assert.equal(app.vm.filtering, true);
  await act(async () => app.vm.setOrder('menor-preco'));
  assert.deepEqual(ids(app.vm.results), ['d', 'a']);
  await act(async () => app.vm.setQuery('nada-assim'));
  assert.equal(app.vm.status, 'no-results');
  await act(async () => app.vm.clearFilters());
  assert.equal(app.vm.status, 'ready');
  assert.equal(app.vm.filtering, false);
  assert.equal(app.vm.results.length, 4);
  await app.close();
});

test('descoberta: catálogo vazio, falha e nova tentativa', async () => {
  const nothing = createMemoryCatalogRepository([]);
  const empty = await mount(() => useCatalogViewModel(nothing));
  await empty.settle();
  assert.equal(empty.vm.status, 'empty');
  await empty.close();

  const repo = createMemoryCatalogRepository(listings, { failWith: new CatalogError('network') });
  const app = await mount(() => useCatalogViewModel(repo));
  await app.settle();
  assert.equal(app.vm.status, 'error');
  assert.match(app.vm.errorMessage, /Sem conexão/);
  const working = createMemoryCatalogRepository(listings);
  repo.list = working.list;
  await act(async () => app.vm.reload());
  await app.settle();
  assert.equal(app.vm.status, 'ready');
  assert.equal(app.vm.errorMessage, null);
  await app.close();
});

test('detalhe: encontrado, inexistente e com falha', async () => {
  const repo = createMemoryCatalogRepository(listings);
  let release;
  const slow = { list: async () => [], get: () => new Promise((resolve) => (release = resolve)) };
  const waiting = await mount(() => useListingDetailViewModel(slow, 'a'));
  assert.equal(waiting.vm.loading, true);
  assert.equal(waiting.vm.notFound, false, 'carregando não é "não encontrado"');
  await act(async () => release(listings[0]));
  assert.equal(waiting.vm.loading, false);
  assert.equal(waiting.vm.listing.id, 'a');
  await waiting.close();

  const found = await mount(() => useListingDetailViewModel(repo, 'a'));
  await found.settle();
  assert.equal(found.vm.listing.title, 'Ação e Reação');
  assert.equal(found.vm.notFound, false);
  await found.close();

  const missing = await mount(() => useListingDetailViewModel(repo, 'zzz'));
  await missing.settle();
  assert.equal(missing.vm.notFound, true);
  assert.equal(missing.vm.errorMessage, null);
  await missing.close();

  const failing = createMemoryCatalogRepository(listings, {
    failWith: new CatalogError('unknown'),
  });
  const broken = await mount(() => useListingDetailViewModel(failing, 'a'));
  await broken.settle();
  assert.equal(broken.vm.notFound, false);
  assert.ok(broken.vm.errorMessage);
  await broken.close();
});
