import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryCatalogRepository } from '../src/model/repositories/memoryCatalogRepository.ts';
import { useCatalogFeedViewModel } from '../src/viewmodel/useCatalogFeedViewModel.ts';
import { useCatalogSearchViewModel } from '../src/viewmodel/useCatalogSearchViewModel.ts';
import { useListingDetailViewModel } from '../src/viewmodel/useListingDetailViewModel.ts';
import { PAGE_SIZE } from '../src/viewmodel/useCatalogPages.ts';
import { FEED_PREVIEW_SIZE } from '../src/viewmodel/useCatalogFeedViewModel.ts';

const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

async function renderHook(useHook) {
  const holder = { current: null };
  function Probe() {
    holder.current = useHook();
    return null;
  }
  const root = createRoot(document.createElement('div'));
  await act(async () => root.render(React.createElement(Probe)));
  return {
    get vm() {
      return holder.current;
    },
    unmount: () => act(async () => root.unmount()),
  };
}

const wait = (ms) => act(() => new Promise((resolve) => setTimeout(resolve, ms)));

const listing = (n, extra = {}) => ({
  id: `id-${String(n).padStart(3, '0')}`,
  title: `Livro ${n}`,
  author: 'Autora',
  category: 'Outros',
  modality: 'donation',
  priceCents: null,
  tradeTerms: null,
  condition: 'bom',
  neighborhood: null,
  city: null,
  description: null,
  coverUrl: null,
  status: 'disponivel',
  ownerFirstName: 'Ana',
  createdAt: new Date(Date.UTC(2026, 0, 1) + n * 60_000).toISOString(),
  ...extra,
});

test('feed carrega a primeira página, pagina sem repetir e para no fim', async () => {
  const memory = createMemoryCatalogRepository(
    Array.from({ length: PAGE_SIZE + 5 }, (_, n) => listing(n)),
  );
  const hook = await renderHook(() => useCatalogFeedViewModel(memory.repository));
  assert.equal(hook.vm.status, 'ready');
  assert.equal(hook.vm.items.length, PAGE_SIZE);
  assert.equal(hook.vm.items[0].title, `Livro ${PAGE_SIZE + 4}`, 'mais recente primeiro');
  assert.equal(hook.vm.hasMore, true);
  assert.equal(hook.vm.total, PAGE_SIZE + 5);
  assert.equal(hook.vm.preview.length, FEED_PREVIEW_SIZE, 'Início mostra só a prévia');
  assert.equal(hook.vm.hasMoreThanPreview, true);

  await act(async () => {
    void hook.vm.loadMore();
    void hook.vm.loadMore();
  });
  assert.equal(hook.vm.items.length, PAGE_SIZE + 5);
  assert.equal(new Set(hook.vm.items.map((item) => item.id)).size, PAGE_SIZE + 5);
  assert.equal(memory.calls.length, 2, 'toques repetidos não duplicam a requisição');
  assert.equal(hook.vm.hasMore, false);
  await act(async () => hook.vm.loadMore());
  assert.equal(memory.calls.length, 2, 'não busca depois do fim');
  await hook.unmount();
});

test('feed vazio, erro com nova tentativa e atualização que preserva a lista', async () => {
  const memory = createMemoryCatalogRepository();
  memory.fail('network');
  const hook = await renderHook(() => useCatalogFeedViewModel(memory.repository));
  assert.equal(hook.vm.status, 'error');
  assert.match(hook.vm.error, /internet/);

  await act(async () => hook.vm.retry());
  assert.equal(hook.vm.status, 'ready');
  assert.deepEqual(hook.vm.items, []);

  memory.add(listing(1));
  await act(async () => hook.vm.refresh());
  assert.equal(hook.vm.items.length, 1);
  assert.equal(hook.vm.refreshing, false);

  memory.fail('network');
  await act(async () => hook.vm.refresh());
  assert.equal(hook.vm.status, 'ready', 'falha ao atualizar não apaga o que já estava na tela');
  assert.equal(hook.vm.items.length, 1);
  assert.match(hook.vm.error, /internet/);
  await hook.unmount();
});

test('sem configuração o feed mostra o aviso e nenhum livro', async () => {
  const memory = createMemoryCatalogRepository([listing(1)]);
  memory.fail('not_configured');
  const hook = await renderHook(() => useCatalogFeedViewModel(memory.repository));
  assert.equal(hook.vm.status, 'error');
  assert.deepEqual(hook.vm.items, []);
  assert.match(hook.vm.error, /não foi configurado/);
  await hook.unmount();
});

test('Início filtra a prévia pela modalidade dos chips', async () => {
  const memory = createMemoryCatalogRepository([
    listing(1, { modality: 'sale', priceCents: 2000 }),
    listing(2, { modality: 'trade', tradeTerms: 'Por romance' }),
  ]);
  const hook = await renderHook(() =>
    useCatalogFeedViewModel(memory.repository, { userName: 'Micael Cardoso Reis' }),
  );
  assert.equal(hook.vm.greeting, 'Olá, Micael');
  assert.equal(hook.vm.modality, null);
  assert.equal(hook.vm.preview.length, 2);
  assert.equal(hook.vm.hasMoreThanPreview, false);
  await act(async () => hook.vm.toggleModality('trade'));
  assert.deepEqual(
    hook.vm.preview.map((item) => item.modality),
    ['trade'],
  );
  await act(async () => hook.vm.toggleModality('trade'));
  assert.equal(hook.vm.modality, null, 'tocar no chip ativo volta para Todos');
  await act(async () => hook.vm.toggleModality('sale'));
  await act(async () => hook.vm.showAll());
  assert.equal(hook.vm.modality, null);
  assert.equal(hook.vm.preview.length, 2);
  await hook.unmount();
});

test('busca espera a digitação, procura título, autor e categoria e combina modalidades', async () => {
  const memory = createMemoryCatalogRepository([
    listing(1, { title: 'Dom Casmurro', modality: 'sale', priceCents: 2000 }),
    listing(2, { title: 'Memórias Póstumas', category: 'Literatura brasileira' }),
    listing(3, { title: 'Turma da Mônica', category: 'Quadrinhos', modality: 'trade' }),
  ]);
  const hook = await renderHook(() =>
    useCatalogSearchViewModel(memory.repository, { debounceMs: 20 }),
  );
  assert.equal(hook.vm.items.length, 3);
  assert.equal(hook.vm.searching, false);
  assert.equal(hook.vm.title, 'Encontre sua próxima história.');
  assert.equal(hook.vm.summary, '3 livros · Mais recentes');

  await act(async () => hook.vm.setQuery('d'));
  await wait(40);
  assert.equal(memory.calls.length, 1, 'uma letra não dispara busca');

  await act(async () => hook.vm.setQuery('do'));
  await act(async () => hook.vm.setQuery('dom'));
  await wait(40);
  assert.equal(memory.calls.length, 2, 'só a última digitação vira consulta');
  assert.deepEqual(
    hook.vm.items.map((item) => item.title),
    ['Dom Casmurro'],
  );
  assert.equal(hook.vm.searching, true);

  await act(async () => hook.vm.setQuery('quadrinhos'));
  await wait(40);
  assert.deepEqual(
    hook.vm.items.map((item) => item.title),
    ['Turma da Mônica'],
    'a busca também encontra pela categoria',
  );

  await act(async () => hook.vm.setQuery(''));
  await wait(40);
  await act(async () => hook.vm.toggleModality('trade'));
  assert.equal(hook.vm.activeFilterCount, 1);
  assert.equal(hook.vm.title, 'Livros para troca.');
  assert.equal(hook.vm.summary, '1 livro · Troca');

  await act(async () => hook.vm.toggleModality('trade'));
  await act(async () => hook.vm.toggleModality('donation'));
  await act(async () => hook.vm.setQuery('dom'));
  await wait(40);
  assert.deepEqual(hook.vm.items, [], 'nenhuma doação chamada Dom');
  assert.equal(hook.vm.title, 'Ainda não encontramos.');

  await act(async () => hook.vm.clear());
  assert.equal(hook.vm.activeFilterCount, 0);
  assert.equal(hook.vm.query, '');
  assert.equal(hook.vm.items.length, 3);
  await hook.unmount();
});

test('busca abre com a modalidade do atalho e descarta respostas antigas', async () => {
  const memory = createMemoryCatalogRepository([
    listing(1, { modality: 'donation' }),
    listing(2, { modality: 'sale', priceCents: 1000 }),
  ]);
  let release;
  memory.hold(new Promise((resolve) => (release = resolve)));
  const hook = await renderHook(() =>
    useCatalogSearchViewModel(memory.repository, { initialModality: 'donation', debounceMs: 0 }),
  );
  assert.equal(hook.vm.status, 'loading');
  assert.deepEqual(hook.vm.modalities, ['donation']);
  memory.hold(null);
  await act(async () => hook.vm.showOnly('sale'));
  assert.deepEqual(
    hook.vm.items.map((item) => item.modality),
    ['sale'],
  );
  await act(async () => release());
  assert.deepEqual(
    hook.vm.items.map((item) => item.modality),
    ['sale'],
    'resposta atrasada da modalidade anterior é ignorada',
  );

  const calls = memory.calls.length;
  await act(async () => hook.vm.showOnly('sale'));
  assert.equal(memory.calls.length, calls, 'repetir o mesmo atalho não refaz a consulta');
  await act(async () => hook.vm.showOnly(null));
  assert.deepEqual(hook.vm.modalities, []);
  await hook.unmount();
});

test('detalhe carrega, informa anúncio inexistente e permite tentar de novo', async () => {
  const memory = createMemoryCatalogRepository([listing(1)]);
  const found = await renderHook(() => useListingDetailViewModel(memory.repository, 'id-001'));
  assert.equal(found.vm.status, 'ready');
  assert.equal(found.vm.listing.title, 'Livro 1');
  assert.deepEqual(found.vm.details.headline, { value: 'Gratuito', label: 'DOAÇÃO' });
  assert.equal(found.vm.details.owner, 'Ana');

  const missing = await renderHook(() => useListingDetailViewModel(memory.repository, 'nada'));
  assert.equal(missing.vm.status, 'notFound');
  assert.equal(missing.vm.details, null);
  assert.match(missing.vm.error, /não está mais disponível/);

  memory.fail('network');
  const offline = await renderHook(() => useListingDetailViewModel(memory.repository, 'id-001'));
  assert.equal(offline.vm.status, 'error');
  await act(async () => offline.vm.retry());
  assert.equal(offline.vm.status, 'ready');
  await Promise.all([found.unmount(), missing.unmount(), offline.unmount()]);
});
