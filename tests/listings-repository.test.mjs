import test from 'node:test';
import assert from 'node:assert/strict';
import { ListingError } from '../src/model/entities/ListingError.ts';
import {
  COVERS_BUCKET,
  LISTINGS_TABLE,
  createSupabaseListingsRepository,
  mapSupabaseListingError,
} from '../src/model/repositories/supabaseListingsRepository.ts';

const USER = 'user-1';

const row = (extra = {}) => ({
  id: 'listing-1',
  title: 'Dom Casmurro',
  author: 'Machado de Assis',
  category: 'Literatura brasileira',
  modality: 'sale',
  price_cents: 2500,
  trade_terms: null,
  condition: 'bom',
  neighborhood: 'Centro',
  city: 'Piripiri',
  description: null,
  cover_path: null,
  status: 'disponivel',
  created_at: '2026-10-02T12:00:00Z',
  ...extra,
});

const draft = (extra = {}) => ({
  title: 'Dom Casmurro',
  author: 'Machado de Assis',
  category: 'Literatura brasileira',
  modality: 'sale',
  priceCents: 2500,
  tradeTerms: null,
  condition: 'bom',
  neighborhood: 'Centro',
  city: 'Piripiri',
  description: null,
  ...extra,
});

/**
 * Cliente falso: registra a cadeia de chamadas e devolve, em ordem, os
 * resultados configurados. Cada `maybeSingle()` ou `await` consome um.
 */
function fakeClient(results, { userId = USER, storage = {} } = {}) {
  const calls = [];
  const queue = [...results];
  const take = () => (queue.length ? queue.shift() : { data: null, error: null });

  const builder = new Proxy(
    {},
    {
      get(_, method) {
        if (method === 'then') {
          return (resolve, reject) => Promise.resolve(take()).then(resolve, reject);
        }
        if (method === 'maybeSingle') {
          return () => {
            calls.push(['maybeSingle']);
            return Promise.resolve(take());
          };
        }
        return (...args) => {
          calls.push([method, ...args]);
          return builder;
        };
      },
    },
  );

  const uploaded = [];
  const removed = [];
  return {
    calls,
    uploaded,
    removed,
    client: {
      auth: {
        getUser: async () => ({ data: { user: userId ? { id: userId } : null }, error: null }),
      },
      from: (table) => {
        calls.push(['from', table]);
        return builder;
      },
      storage: {
        from: (bucket) => ({
          upload: async (path, bytes, options) => {
            uploaded.push({ bucket, path, options });
            return storage.uploadError ? { error: storage.uploadError } : { error: null };
          },
          remove: async (paths) => {
            removed.push({ bucket, paths });
            return { error: null };
          },
          getPublicUrl: (path) => ({ data: { publicUrl: `https://cdn/${bucket}/${path}` } }),
        }),
      },
    },
  };
}

// ── Mapeamento de erros ─────────────────────────────────────────────────────

test('cada erro do Postgres vira o código que a tela sabe explicar', () => {
  assert.equal(mapSupabaseListingError({ code: 'PGRST205' }).code, 'not_configured');
  assert.equal(mapSupabaseListingError({ code: '42P01' }).code, 'not_configured');
  assert.equal(mapSupabaseListingError({ code: 'PGRST116' }).code, 'not_found');
  assert.equal(mapSupabaseListingError({ code: '22P02' }).code, 'not_found');
  assert.equal(mapSupabaseListingError({ code: '23514' }).code, 'invalid');
  assert.equal(mapSupabaseListingError({ code: '23502' }).code, 'invalid');
  assert.equal(mapSupabaseListingError({ code: '42501' }).code, 'not_allowed');
  assert.equal(mapSupabaseListingError({ message: 'network request failed' }).code, 'network');
  assert.equal(mapSupabaseListingError({}).code, 'unknown');
});

test('sem as variáveis do Supabase o repositório diz que não foi configurado', async () => {
  const repository = createSupabaseListingsRepository(null);
  await assert.rejects(
    () => repository.listMine(),
    (error) => error instanceof ListingError && error.code === 'not_configured',
  );
});

// ── Consulta ────────────────────────────────────────────────────────────────

test('a estante filtra pelo dono e vem dos mais recentes', async () => {
  const fake = fakeClient([{ data: [row()], error: null }]);
  const listings = await createSupabaseListingsRepository(fake.client).listMine();

  assert.deepEqual(fake.calls[0], ['from', LISTINGS_TABLE]);
  // O filtro por dono é NOSSO: a RLS libera todo anúncio disponível de qualquer pessoa.
  assert.ok(
    fake.calls.some(
      ([method, ...args]) => method === 'eq' && args[0] === 'owner_id' && args[1] === USER,
    ),
  );
  assert.ok(
    fake.calls.some(
      ([m, field, opts]) => m === 'order' && field === 'created_at' && opts.ascending === false,
    ),
  );
  assert.equal(listings[0].id, 'listing-1');
  assert.equal(listings[0].priceCents, 2500);
});

test('a capa vira URL pública e a ausência dela não inventa imagem', async () => {
  const withCover = fakeClient([{ data: [row({ cover_path: 'user-1/abc.jpg' })], error: null }]);
  const [listing] = await createSupabaseListingsRepository(withCover.client).listMine();
  assert.equal(listing.coverUrl, `https://cdn/${COVERS_BUCKET}/user-1/abc.jpg`);
  assert.equal(listing.coverPath, 'user-1/abc.jpg');

  const without = fakeClient([{ data: [row()], error: null }]);
  const [plain] = await createSupabaseListingsRepository(without.client).listMine();
  assert.equal(plain.coverUrl, null);
});

// ── Gravação ────────────────────────────────────────────────────────────────

test('publicar manda os três campos da modalidade juntos', async () => {
  const fake = fakeClient([{ data: row(), error: null }]);
  await createSupabaseListingsRepository(fake.client).create(draft(), null);

  const insert = fake.calls.find(([method]) => method === 'insert')?.[1];
  assert.equal(insert.modality, 'sale');
  assert.equal(insert.price_cents, 2500);
  assert.equal(insert.trade_terms, null);
  assert.equal(insert.owner_id, USER);
});

test('trocar venda por doação zera o preço na mesma gravação', async () => {
  const fake = fakeClient([
    { data: row(), error: null },
    { data: row({ modality: 'donation', price_cents: null }), error: null },
  ]);
  await createSupabaseListingsRepository(fake.client).update(
    'listing-1',
    draft({ modality: 'donation', priceCents: 2500 }),
    { kind: 'keep' },
  );

  const update = fake.calls.find(([method]) => method === 'update')?.[1];
  assert.equal(update.modality, 'donation');
  // Sem isto, a constraint listings_price_only_on_sale recusaria a linha.
  assert.equal(update.price_cents, null);
  assert.equal(update.trade_terms, null);
});

test('a foto sobe com nome único dentro da pasta da pessoa', async () => {
  const fake = fakeClient([{ data: row({ cover_path: 'x' }), error: null }]);
  await createSupabaseListingsRepository(fake.client).create(draft(), {
    filename: 'capa.jpeg',
    mimeType: 'image/jpeg',
    bytes: new ArrayBuffer(4),
  });

  const [sent] = fake.uploaded;
  assert.equal(sent.bucket, COVERS_BUCKET);
  assert.ok(sent.path.startsWith(`${USER}/`), sent.path);
  assert.ok(sent.path.endsWith('.jpeg'));
  // Nunca upsert: o bucket não tem política de update (ADR 0008).
  assert.equal(sent.options?.upsert, undefined);
});

test('se a linha não entrar, a foto recém-enviada não fica órfã', async () => {
  const fake = fakeClient([{ data: null, error: { code: '23514' } }]);
  await assert.rejects(
    () =>
      createSupabaseListingsRepository(fake.client).create(draft(), {
        filename: 'capa.jpg',
        mimeType: 'image/jpeg',
        bytes: new ArrayBuffer(4),
      }),
    (error) => error instanceof ListingError && error.code === 'invalid',
  );
  assert.equal(fake.removed.length, 1);
});

test('trocar a capa só remove a antiga depois que a linha já aponta para a nova', async () => {
  const fake = fakeClient([
    { data: row({ cover_path: 'user-1/antiga.jpg' }), error: null },
    { data: row({ cover_path: 'user-1/nova.jpg' }), error: null },
  ]);
  await createSupabaseListingsRepository(fake.client).update('listing-1', draft(), {
    kind: 'replace',
    file: { filename: 'nova.jpg', mimeType: 'image/jpeg', bytes: new ArrayBuffer(4) },
  });

  assert.equal(fake.uploaded.length, 1);
  assert.deepEqual(fake.removed.at(-1).paths, ['user-1/antiga.jpg']);
});

test('excluir apaga a foto antes da linha — o bucket é público', async () => {
  const fake = fakeClient([
    { data: row({ cover_path: 'user-1/capa.jpg' }), error: null },
    { data: null, error: null },
  ]);
  await createSupabaseListingsRepository(fake.client).remove('listing-1');

  assert.deepEqual(fake.removed[0].paths, ['user-1/capa.jpg']);
  assert.ok(fake.calls.some(([method]) => method === 'delete'));
});

test('anúncio reservado recusa editar, arquivar e excluir', async () => {
  for (const act of [
    (repository) => repository.update('listing-1', draft(), { kind: 'keep' }),
    (repository) => repository.archive('listing-1'),
    (repository) => repository.remove('listing-1'),
  ]) {
    const fake = fakeClient([{ data: row({ status: 'reservado' }), error: null }]);
    await assert.rejects(
      () => act(createSupabaseListingsRepository(fake.client)),
      (error) => error instanceof ListingError && error.code === 'not_allowed',
    );
  }
});

test('republicar só vale para anúncio arquivado', async () => {
  const arquivado = fakeClient([
    { data: row({ status: 'arquivado' }), error: null },
    { data: row({ status: 'disponivel' }), error: null },
  ]);
  assert.equal(
    (await createSupabaseListingsRepository(arquivado.client).republish('listing-1')).status,
    'disponivel',
  );

  const disponivel = fakeClient([{ data: row(), error: null }]);
  await assert.rejects(
    () => createSupabaseListingsRepository(disponivel.client).republish('listing-1'),
    (error) => error instanceof ListingError && error.code === 'not_allowed',
  );
});

test('sem sessão, nada é gravado', async () => {
  const fake = fakeClient([], { userId: null });
  await assert.rejects(
    () => createSupabaseListingsRepository(fake.client).listMine(),
    (error) => error instanceof ListingError && error.code === 'not_allowed',
  );
});
