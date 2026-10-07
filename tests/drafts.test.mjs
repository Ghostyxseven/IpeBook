import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { DraftError } from '../src/model/entities/Draft.ts';
import {
  createLocalDraftsRepository,
  MAX_DRAFTS,
} from '../src/model/repositories/localDraftsRepository.ts';
import { createMemoryDraftsRepository } from '../src/model/repositories/memoryDraftsRepository.ts';
import {
  draftSupporting,
  draftTitle,
  missingFields,
  missingPhrase,
} from '../src/model/services/draftSummary.ts';
import { closedProposalsLabel, remainingLabel } from '../src/model/services/listingFormat.ts';
import { emptyDraft } from '../src/model/services/listingValidation.ts';
import { useDraftsViewModel } from '../src/viewmodel/useDraftsViewModel.ts';

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

/** Um `Storage` de mentira, para testar o repositório local sem SQLite. */
function fakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
    clear: () => data.clear(),
    key: (index) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
  };
}

const draft = (extra = {}) => ({ ...emptyDraft(), ...extra });
const record = (id, extra = {}, savedAt = '2026-10-07T12:00:00.000Z') => ({
  id,
  draft: draft(extra),
  savedAt,
});

// ── O que falta no rascunho ─────────────────────────────────────────────────

test('um rascunho em branco lista tudo o que falta, na ordem do formulário', () => {
  assert.deepEqual(missingFields(emptyDraft()), [
    'title',
    'author',
    'priceCents',
    'category',
    'neighborhood',
  ]);
});

test('a frase do que falta concorda em número e se cala quando não falta nada', () => {
  assert.equal(
    missingPhrase(draft({ title: 'Dom Casmurro' })),
    'faltam autor, preço, categoria e localização',
  );

  const sóCategoria = draft({
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    priceCents: 2500,
    neighborhood: 'Centro',
  });
  assert.equal(missingPhrase(sóCategoria), 'falta categoria');

  const completo = draft({ ...sóCategoria, category: 'Literatura brasileira' });
  assert.equal(missingPhrase(completo), 'pronto para publicar');
});

test('a doação não cobra preço, e a troca cobra o que aceita em troca', () => {
  const base = { title: 'A hora da estrela', author: 'Clarice Lispector', neighborhood: 'Centro' };
  assert.ok(!missingFields(draft({ ...base, modality: 'donation' })).includes('priceCents'));
  assert.ok(missingFields(draft({ ...base, modality: 'trade' })).includes('tradeTerms'));
});

test('o rascunho sem título ainda se chama alguma coisa na lista', () => {
  assert.equal(draftTitle(record('a')), 'Sem título');
  assert.equal(draftTitle(record('a', { title: '  Vidas Secas ' })), 'Vidas Secas');
});

test('a linha de apoio junta a modalidade e o que falta (quadro 04.11)', () => {
  const r = record('a', { title: 'O Pequeno Príncipe', author: 'Saint-Exupéry', priceCents: 2500 });
  assert.equal(draftSupporting(r), 'Venda · faltam categoria e localização');
});

// ── Repositório local ───────────────────────────────────────────────────────

test('guardar e ler um rascunho do aparelho', async () => {
  const storage = fakeStorage();
  const repository = createLocalDraftsRepository(storage);
  const saved = await repository.save(draft({ title: 'Dom Casmurro' }));
  assert.equal(saved.draft.title, 'Dom Casmurro');
  assert.deepEqual(
    (await repository.list()).map((r) => r.id),
    [saved.id],
  );
});

test('atualizar um rascunho não cria um segundo e o traz para o topo', async () => {
  const repository = createLocalDraftsRepository(fakeStorage());
  const primeiro = await repository.save(draft({ title: 'Primeiro' }));
  const segundo = await repository.save(draft({ title: 'Segundo' }));
  await repository.update(primeiro.id, draft({ title: 'Primeiro, corrigido' }));

  const lista = await repository.list();
  assert.equal(lista.length, 2, 'continuam dois');
  assert.equal(lista[0].id, primeiro.id, 'o mexido vai para o topo');
  assert.equal(lista[0].draft.title, 'Primeiro, corrigido');
  assert.ok(lista.some((r) => r.id === segundo.id));
});

test('atualizar um rascunho que sumiu é not_found, não cria um novo', async () => {
  const repository = createLocalDraftsRepository(fakeStorage());
  await assert.rejects(
    () => repository.update('não-existe', draft()),
    (error) => error instanceof DraftError && error.code === 'not_found',
  );
  assert.deepEqual(await repository.list(), []);
});

test('o teto de rascunhos descarta o mais antigo', async () => {
  const repository = createLocalDraftsRepository(fakeStorage());
  for (let i = 0; i < MAX_DRAFTS + 3; i += 1) {
    await repository.save(draft({ title: `Livro ${i}` }));
  }
  assert.equal((await repository.list()).length, MAX_DRAFTS);
});

test('dado corrompido no armazenamento vira lista vazia, não tela quebrada', async () => {
  const repository = createLocalDraftsRepository(
    fakeStorage({ 'ipebook:rascunhos': '{isso não é json' }),
  );
  assert.deepEqual(await repository.list(), []);
});

test('armazenamento que recusa gravar vira erro de rascunho, não erro solto', async () => {
  const storage = fakeStorage();
  storage.setItem = () => {
    throw new Error('QuotaExceededError');
  };
  const repository = createLocalDraftsRepository(storage);
  await assert.rejects(
    () => repository.save(draft({ title: 'Dom Casmurro' })),
    (error) => error instanceof DraftError && error.code === 'storage',
  );
});

test('sem armazenamento nenhum, salvar falha com clareza', async () => {
  const repository = createLocalDraftsRepository(null);
  await assert.rejects(
    () => repository.save(draft()),
    (error) => error.code === 'storage',
  );
});

// ── ViewModel ───────────────────────────────────────────────────────────────

test('a lista chega ordenada, do mais recente para o mais antigo', async () => {
  const repository = createMemoryDraftsRepository([
    record('velho', { title: 'Velho' }, '2026-10-01T12:00:00.000Z'),
    record('novo', { title: 'Novo' }, '2026-10-07T12:00:00.000Z'),
  ]);
  const screen = await renderHook(() => useDraftsViewModel(repository));
  assert.equal(screen.vm.status, 'ready');
  assert.deepEqual(
    screen.vm.drafts.map((r) => r.id),
    ['novo', 'velho'],
  );
  await screen.unmount();
});

test('descartar apaga e recarrega a lista', async () => {
  const repository = createMemoryDraftsRepository([record('a'), record('b')]);
  const screen = await renderHook(() => useDraftsViewModel(repository));
  await act(async () => screen.vm.discard('a'));
  assert.deepEqual(
    screen.vm.drafts.map((r) => r.id),
    ['b'],
  );
  assert.equal(screen.vm.actionError, null);
  await screen.unmount();
});

test('falha ao carregar mostra erro em português com "tentar de novo"', async () => {
  const repository = createMemoryDraftsRepository([], { failWith: new DraftError('storage') });
  const screen = await renderHook(() => useDraftsViewModel(repository));
  assert.equal(screen.vm.status, 'error');
  assert.match(screen.vm.error, /guardar o rascunho/);
  await screen.unmount();
});

test('sem rascunho nenhum, a tela fica pronta e vazia — não em erro', async () => {
  // O repositório fica FORA do hook: criado dentro, seria novo a cada render,
  // o efeito que carrega dependeria de algo sempre diferente e renderizaria sem fim.
  const repository = createMemoryDraftsRepository([]);
  const screen = await renderHook(() => useDraftsViewModel(repository));
  assert.equal(screen.vm.status, 'ready');
  assert.deepEqual(screen.vm.drafts, []);
  await screen.unmount();
});

// ── Avisos da estante (spec 033) ────────────────────────────────────────────

test('a contagem do que restou concorda em número (quadro 05.07)', () => {
  assert.equal(remainingLabel(2), '2 anúncios restantes na sua estante.');
  assert.equal(remainingLabel(1), '1 anúncio restante na sua estante.');
  assert.equal(remainingLabel(0), 'Nenhum anúncio ativo na sua estante.');
});

test('a contagem de propostas recusadas concorda em número (quadro 05.08)', () => {
  assert.equal(closedProposalsLabel(1), 'Uma proposta ficou registrada como recusada.');
  assert.equal(closedProposalsLabel(3), '3 propostas ficaram registradas como recusadas.');
});

// ── 04.19 · Falha ao enviar fotos ───────────────────────────────────────────

test('publicar sem rede COM foto mostra o quadro 04.19; sem foto, só a mensagem', async () => {
  const { createMemoryListingsRepository } =
    await import('../src/model/repositories/memoryListingsRepository.ts');
  const { usePublishListingViewModel } =
    await import('../src/viewmodel/usePublishListingViewModel.ts');
  const { ListingError } = await import('../src/model/entities/ListingError.ts');

  const semRede = {
    ...createMemoryListingsRepository([]),
    async create() {
      throw new ListingError('network');
    },
  };
  const drafts = createMemoryDraftsRepository([]);

  const comFoto = await renderHook(() => usePublishListingViewModel(semRede, drafts));
  await act(async () => {
    comFoto.vm.setText('title', 'Dom Casmurro');
    comFoto.vm.setText('author', 'Machado de Assis');
    comFoto.vm.setCategory('Literatura brasileira');
    comFoto.vm.setPriceInput('25,00');
  });
  await act(async () =>
    comFoto.vm.pickCover({
      file: { filename: 'capa.jpg', mimeType: 'image/jpeg', bytes: new ArrayBuffer(8) },
      previewUri: 'file://capa.jpg',
    }),
  );
  await act(async () => comFoto.vm.submit());
  assert.equal(comFoto.vm.uploadFailed, true, 'com foto, o quadro 04.19');
  assert.equal(comFoto.vm.error, null, 'e sem mensagem duplicada no rodapé');
  await comFoto.unmount();

  const semFoto = await renderHook(() => usePublishListingViewModel(semRede, drafts));
  await act(async () => {
    semFoto.vm.setText('title', 'Dom Casmurro');
    semFoto.vm.setText('author', 'Machado de Assis');
    semFoto.vm.setCategory('Literatura brasileira');
    semFoto.vm.setPriceInput('25,00');
  });
  await act(async () => semFoto.vm.submit());
  assert.equal(semFoto.vm.uploadFailed, false, 'sem foto, não é falha de envio de foto');
  assert.match(semFoto.vm.error, /internet/);
  await semFoto.unmount();
});
