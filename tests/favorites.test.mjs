import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { FavoriteError, toFavoriteError } from '../src/model/entities/FavoriteError.ts';
import { favoriteErrorMessage } from '../src/model/services/favoriteMessages.ts';
import { createMemoryFavoritesRepository } from '../src/model/repositories/memoryFavoritesRepository.ts';
import {
  createSupabaseFavoritesRepository,
  mapSupabaseFavoriteError,
} from '../src/model/repositories/supabaseFavoritesRepository.ts';
import { useFavoritesViewModel } from '../src/viewmodel/useFavoritesViewModel.ts';

// ── Model ────────────────────────────────────────────────────────────────────

test('toFavoriteError preserva o código e cai para "unknown" em causas estranhas', () => {
  const original = new FavoriteError('network');
  assert.equal(toFavoriteError(original), original);
  assert.equal(toFavoriteError(new Error('boom')).code, 'unknown');
  assert.equal(toFavoriteError('boom').code, 'unknown');
});

test('mensagens de favoritos em português, uma por código', () => {
  assert.equal(
    favoriteErrorMessage('network'),
    'Não conseguimos salvar o favorito. Confira sua internet e tente de novo.',
  );
  assert.match(favoriteErrorMessage('not_configured'), /ainda não foram configurados/);
  assert.match(favoriteErrorMessage('unknown'), /Algo deu errado/);
});

// ── Repositório em memória ───────────────────────────────────────────────────

test('memória: favoritar, listar e desfavoritar', async () => {
  const repo = createMemoryFavoritesRepository({ favorites: ['l1'] });
  assert.deepEqual(await repo.listFavoriteIds(), ['l1']);
  await repo.add('l2');
  assert.deepEqual((await repo.listFavoriteIds()).sort(), ['l1', 'l2']);
  await repo.remove('l1');
  assert.deepEqual(await repo.listFavoriteIds(), ['l2']);
});

test('memória: falha configurada rejeita as três operações', async () => {
  const repo = createMemoryFavoritesRepository({ failWith: new FavoriteError('network') });
  await assert.rejects(repo.listFavoriteIds(), { code: 'network' });
  await assert.rejects(repo.add('l1'), { code: 'network' });
  await assert.rejects(repo.remove('l1'), { code: 'network' });
});

// ── Repositório do Supabase ──────────────────────────────────────────────────

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
      from: (table) => {
        calls.push(['from', table]);
        return builder;
      },
    },
  };
}

test('sem cliente configurado, favoritos informa e não simula dados', async () => {
  const repository = createSupabaseFavoritesRepository(null);
  await assert.rejects(repository.listFavoriteIds(), { code: 'not_configured' });
  await assert.rejects(repository.add('l1'), { code: 'not_configured' });
  await assert.rejects(repository.remove('l1'), { code: 'not_configured' });
});

test('listFavoriteIds lê só a coluna listing_id da tabela favorites', async () => {
  const fake = fakeClient({ data: [{ listing_id: 'l1' }, { listing_id: 'l2' }], error: null });
  const repository = createSupabaseFavoritesRepository(fake.client);
  const ids = await repository.listFavoriteIds();
  assert.deepEqual(ids, ['l1', 'l2']);
  assert.deepEqual(fake.calls[0], ['from', 'favorites']);
  assert.deepEqual(fake.calls[1], ['select', 'listing_id']);
});

test('add faz upsert pela chave (user_id, listing_id): favoritar duas vezes não falha', async () => {
  const fake = fakeClient({ data: null, error: null });
  const repository = createSupabaseFavoritesRepository(fake.client);
  await repository.add('l1');
  assert.deepEqual(fake.calls[1], [
    'upsert',
    { listing_id: 'l1' },
    { onConflict: 'user_id,listing_id' },
  ]);
});

test('remove apaga pelo listing_id', async () => {
  const fake = fakeClient({ data: null, error: null });
  const repository = createSupabaseFavoritesRepository(fake.client);
  await repository.remove('l1');
  assert.deepEqual(fake.calls[1], ['delete']);
  assert.deepEqual(fake.calls[2], ['eq', 'listing_id', 'l1']);
});

test('erros do Supabase viram códigos do domínio', () => {
  assert.equal(mapSupabaseFavoriteError({ code: 'PGRST205' }).code, 'not_configured');
  assert.equal(mapSupabaseFavoriteError({ code: '42P01' }).code, 'not_configured');
  assert.equal(mapSupabaseFavoriteError({ message: 'network error' }).code, 'network');
  assert.equal(mapSupabaseFavoriteError({ code: '23505' }).code, 'unknown');
});

// ── ViewModel ────────────────────────────────────────────────────────────────

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

test('carrega os favoritos existentes e marca isFavorite corretamente', async () => {
  const repository = createMemoryFavoritesRepository({ favorites: ['l1'] });
  const screen = await renderHook(() => useFavoritesViewModel(repository));
  assert.equal(screen.vm.status, 'ready');
  assert.equal(screen.vm.isFavorite('l1'), true);
  assert.equal(screen.vm.isFavorite('l2'), false);
  await screen.unmount();
});

test('toggle muda a tela na hora (otimista), sem esperar o servidor', async () => {
  let resolveAdd;
  const repository = createMemoryFavoritesRepository({ favorites: [] });
  const slowAdd = repository.add.bind(repository);
  repository.add = (id) => new Promise((resolve) => (resolveAdd = () => resolve(slowAdd(id))));

  const screen = await renderHook(() => useFavoritesViewModel(repository));
  assert.equal(screen.vm.status, 'ready');

  act(() => screen.vm.toggle('l1'));
  // Marca na hora, antes do servidor responder.
  assert.equal(screen.vm.isFavorite('l1'), true);

  await act(async () => resolveAdd());
  assert.equal(screen.vm.isFavorite('l1'), true);
  await screen.unmount();
});

test('falha ao favoritar desfaz a marcação otimista e mostra o motivo', async () => {
  const repository = createMemoryFavoritesRepository({ favorites: [] });
  repository.add = () => Promise.reject(new FavoriteError('network'));

  const screen = await renderHook(() => useFavoritesViewModel(repository));
  await act(async () => screen.vm.toggle('l1'));
  // A promessa de `add` já rejeitou dentro do próprio `act`, então o estado
  // já reflete o desfazimento quando o teste confere.
  assert.equal(screen.vm.isFavorite('l1'), false);
  assert.match(screen.vm.error ?? '', /Não conseguimos salvar o favorito/);
  await screen.unmount();
});

test('falha ao desfavoritar também desfaz e mostra o motivo', async () => {
  const repository = createMemoryFavoritesRepository({ favorites: ['l1'] });
  repository.remove = () => Promise.reject(new FavoriteError('network'));

  const screen = await renderHook(() => useFavoritesViewModel(repository));
  assert.equal(screen.vm.isFavorite('l1'), true);
  await act(async () => screen.vm.toggle('l1'));
  assert.equal(screen.vm.isFavorite('l1'), true, 'volta a ficar favoritado depois da falha');
  await screen.unmount();
});

test('erro ao carregar a lista não trava a tela: cai para status de erro, sem favorito nenhum', async () => {
  const repository = createMemoryFavoritesRepository({ failWith: new FavoriteError('unknown') });
  const screen = await renderHook(() => useFavoritesViewModel(repository));
  assert.equal(screen.vm.status, 'error');
  assert.equal(screen.vm.isFavorite('l1'), false);
  await screen.unmount();
});
