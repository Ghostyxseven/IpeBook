import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyFilters } from '../src/model/entities/Listing.ts';
import {
  CATALOG_VIEW,
  createSupabaseCatalogRepository,
  mapSupabaseCatalogError,
} from '../src/model/repositories/supabaseCatalogRepository.ts';

const row = (id, createdAt, extra = {}) => ({
  id,
  title: `Livro ${id}`,
  author: 'Autora',
  category: 'Outros',
  modality: 'donation',
  price_cents: null,
  trade_terms: null,
  condition: 'bom',
  neighborhood: 'Centro',
  city: 'Picos',
  description: null,
  cover_path: null,
  status: 'disponivel',
  owner_first_name: 'Ana',
  created_at: createdAt,
  ...extra,
});

/** Cliente falso que registra a cadeia de chamadas e devolve o resultado configurado. */
function fakeClient(result) {
  const calls = [];
  const builder = new Proxy(
    {},
    {
      get(_, method) {
        if (method === 'then') {
          return (resolve, reject) => Promise.resolve(result).then(resolve, reject);
        }
        if (method === 'maybeSingle') {
          return () => {
            calls.push(['maybeSingle']);
            return Promise.resolve(result);
          };
        }
        return (...args) => {
          calls.push([method, ...args]);
          return builder;
        };
      },
    },
  );
  return {
    calls,
    client: {
      rpc: (fn, args) => {
        calls.push(['rpc', fn, args]);
        return Promise.resolve({ data: 'Ana', error: null });
      },
      from: (table) => {
        calls.push(['from', table]);
        return builder;
      },
      storage: {
        from: (bucket) => ({
          getPublicUrl: (path) => ({ data: { publicUrl: `https://cdn/${bucket}/${path}` } }),
        }),
      },
    },
  };
}

test('sem cliente configurado, o catálogo informa e não simula dados', async () => {
  const repository = createSupabaseCatalogRepository(null);
  await assert.rejects(repository.list({ filters: emptyFilters, cursor: null, limit: 20 }), {
    code: 'not_configured',
  });
  await assert.rejects(repository.getById('x'), { code: 'not_configured' });
});

test('lista lê a view, aplica filtros e pede um item a mais para paginar', async () => {
  const rows = [
    row('c', '2026-09-30T10:00:00Z', { cover_path: 'u1/c.jpg' }),
    row('b', '2026-09-29T10:00:00Z'),
    row('a', '2026-09-28T10:00:00Z'),
  ];
  const fake = fakeClient({ data: rows, error: null, count: 7 });
  const repository = createSupabaseCatalogRepository(fake.client);
  const page = await repository.list({
    filters: { query: ' dom, (casmurro) ', modalities: ['sale', 'trade'], category: 'Outros' },
    cursor: null,
    limit: 2,
  });
  assert.deepEqual(fake.calls[0], ['from', CATALOG_VIEW]);
  assert.deepEqual(fake.calls[1].at(-1), { count: 'exact' }, 'conta o total na primeira página');
  assert.equal(page.total, 7);
  assert.deepEqual(
    fake.calls.find(([method]) => method === 'or'),
    [
      'or',
      'title.ilike."%dom, (casmurro)%",author.ilike."%dom, (casmurro)%",category.ilike."%dom, (casmurro)%"',
    ],
  );
  assert.deepEqual(
    fake.calls.find(([method]) => method === 'in'),
    ['in', 'modality', ['sale', 'trade']],
  );
  assert.deepEqual(
    fake.calls.find(([method]) => method === 'eq'),
    ['eq', 'category', 'Outros'],
  );
  assert.deepEqual(fake.calls.at(-1), ['limit', 3]);
  assert.deepEqual(
    page.items.map((item) => item.id),
    ['c', 'b'],
  );
  assert.equal(page.items[0].coverUrl, 'https://cdn/listing-covers/u1/c.jpg');
  assert.equal(page.items[1].coverUrl, null);
  assert.deepEqual(page.nextCursor, { createdAt: '2026-09-29T10:00:00Z', id: 'b' });
});

test('busca curta não filtra e cursor continua depois do último item', async () => {
  const fake = fakeClient({ data: [row('a', '2026-09-28T10:00:00Z')], error: null, count: 9 });
  const repository = createSupabaseCatalogRepository(fake.client);
  const page = await repository.list({
    filters: { ...emptyFilters, query: 'a' },
    cursor: { createdAt: '2026-09-29T10:00:00Z', id: 'b' },
    limit: 2,
  });
  const ors = fake.calls.filter(([method]) => method === 'or');
  assert.deepEqual(ors, [
    [
      'or',
      'created_at.lt."2026-09-29T10:00:00Z",and(created_at.eq."2026-09-29T10:00:00Z",id.lt."b")',
    ],
  ]);
  assert.equal(page.nextCursor, null);
  assert.equal(fake.calls[1].at(-1), undefined, 'não reconta nas páginas seguintes');
  assert.equal(page.total, null);
});

test('detalhe distingue anúncio inexistente de falha de rede', async () => {
  const missing = createSupabaseCatalogRepository(fakeClient({ data: null, error: null }).client);
  await assert.rejects(missing.getById('x'), { code: 'not_found' });
  const found = createSupabaseCatalogRepository(
    fakeClient({ data: row('a', '2026-09-28T10:00:00Z', { owner_id: 'u-ana' }), error: null })
      .client,
  );
  assert.equal((await found.getById('a')).ownerFirstName, 'Ana');
  const offline = createSupabaseCatalogRepository(
    fakeClient({ data: null, error: { message: 'TypeError: Network request failed', code: '' } })
      .client,
  );
  await assert.rejects(offline.getById('a'), { code: 'network' });
});

test('erros do PostgREST viram códigos do domínio', () => {
  assert.equal(
    mapSupabaseCatalogError({ code: '22P02', message: 'invalid uuid' }).code,
    'not_found',
  );
  assert.equal(mapSupabaseCatalogError({ message: 'Failed to fetch' }).code, 'network');
  assert.equal(
    mapSupabaseCatalogError({ code: 'PGRST205', message: 'Could not find the table' }).code,
    'not_configured',
    'migração ainda não aplicada',
  );
  assert.equal(mapSupabaseCatalogError({ code: '42501', message: 'denied' }).code, 'unknown');
});

test('detalhe lê só colunas que existem na tabela e busca o nome do dono pela função', async () => {
  const fake = fakeClient({
    data: row('a', '2026-09-28T10:00:00Z', { owner_id: 'u-ana', owner_first_name: undefined }),
    error: null,
  });
  const listing = await createSupabaseCatalogRepository(fake.client).getById('a');
  const select = fake.calls.find(([method]) => method === 'select');
  assert.ok(!select[1].includes('owner_first_name'), 'a tabela listings não tem essa coluna');
  assert.deepEqual(
    fake.calls.find(([method]) => method === 'rpc'),
    ['rpc', 'listing_owner_first_name', { owner: 'u-ana' }],
  );
  assert.equal(listing.ownerFirstName, 'Ana');
  assert.equal(listing.ownerId, 'u-ana');
});
