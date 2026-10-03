import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryListingsRepository } from '../src/model/repositories/memoryListingsRepository.ts';
import { useEditListingViewModel } from '../src/viewmodel/useEditListingViewModel.ts';
import { useMyListingsViewModel } from '../src/viewmodel/useMyListingsViewModel.ts';
import { usePublishListingViewModel } from '../src/viewmodel/usePublishListingViewModel.ts';

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

const listing = (extra = {}) => ({
  id: 'listing-1',
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
  coverPath: null,
  coverUrl: null,
  status: 'disponivel',
  createdAt: '2026-10-02T12:00:00Z',
  ...extra,
});

async function fillBook(screen) {
  await act(async () => {
    screen.vm.setText('title', 'Dom Casmurro');
    screen.vm.setText('author', 'Machado de Assis');
    screen.vm.setCategory('Literatura brasileira');
  });
}

// ── Publicar ────────────────────────────────────────────────────────────────

test('o formulário abre limpo: nenhum erro antes de tentar avançar', async () => {
  const memory = createMemoryListingsRepository();
  const screen = await renderHook(() => usePublishListingViewModel(memory.repository));
  assert.deepEqual(screen.vm.stepErrors('livro'), {});
  assert.equal(screen.vm.step, 'livro');
  assert.equal(screen.vm.stepCount, 3);
  await screen.unmount();
});

test('tentar avançar com o livro incompleto acende os erros e segura a etapa', async () => {
  const memory = createMemoryListingsRepository();
  const screen = await renderHook(() => usePublishListingViewModel(memory.repository));
  await act(async () => screen.vm.next());
  assert.equal(screen.vm.step, 'livro');
  assert.ok(screen.vm.stepErrors('livro').title);
  assert.ok(screen.vm.stepErrors('livro').author);
  // A categoria é da etapa de detalhes: o erro dela não aparece na primeira.
  assert.equal(screen.vm.stepErrors('livro').category, undefined);
  await screen.unmount();
});

test('venda sem preço não passa da primeira etapa', async () => {
  const memory = createMemoryListingsRepository();
  const screen = await renderHook(() => usePublishListingViewModel(memory.repository));
  await fillBook(screen);
  await act(async () => screen.vm.next());
  assert.equal(screen.vm.step, 'livro');
  assert.ok(screen.vm.stepErrors('livro').priceCents);
  await screen.unmount();
});

test('com título, autor e preço a etapa avança para fotos e depois detalhes', async () => {
  const memory = createMemoryListingsRepository();
  const screen = await renderHook(() => usePublishListingViewModel(memory.repository));
  await fillBook(screen);
  await act(async () => screen.vm.setPriceInput('25'));
  await act(async () => screen.vm.next());
  assert.equal(screen.vm.step, 'fotos');
  await act(async () => screen.vm.next());
  assert.equal(screen.vm.step, 'detalhes');
  assert.equal(screen.vm.isLast, true);
  await act(async () => screen.vm.back());
  assert.equal(screen.vm.step, 'fotos');
  await screen.unmount();
});

test('doação avança sem preço', async () => {
  const memory = createMemoryListingsRepository();
  const screen = await renderHook(() => usePublishListingViewModel(memory.repository));
  await fillBook(screen);
  await act(async () => screen.vm.setModality('donation'));
  await act(async () => screen.vm.next());
  assert.equal(screen.vm.step, 'fotos');
  await screen.unmount();
});

test('publicar sem categoria mostra o erro na etapa de detalhes', async () => {
  const memory = createMemoryListingsRepository();
  const screen = await renderHook(() => usePublishListingViewModel(memory.repository));
  await act(async () => {
    screen.vm.setText('title', 'Dom Casmurro');
    screen.vm.setText('author', 'Machado de Assis');
    screen.vm.setPriceInput('25');
  });
  await act(async () => screen.vm.submit());
  assert.ok(screen.vm.stepErrors('detalhes').category);
  assert.equal(memory.calls.length, 0);
  await screen.unmount();
});

test('o preço digitado em reais vira centavos no rascunho', async () => {
  const memory = createMemoryListingsRepository();
  const screen = await renderHook(() => usePublishListingViewModel(memory.repository));
  await act(async () => screen.vm.setPriceInput('25,90'));
  assert.equal(screen.vm.draft.priceCents, 2590);
  await screen.unmount();
});

test('trocar para doação limpa o preço antes da revisão', async () => {
  const memory = createMemoryListingsRepository();
  const screen = await renderHook(() => usePublishListingViewModel(memory.repository));
  await act(async () => screen.vm.setPriceInput('25,90'));
  await act(async () => screen.vm.setModality('donation'));
  assert.equal(screen.vm.draft.priceCents, null);
  assert.equal(screen.vm.priceInput, '');
  await screen.unmount();
});

test('trocar para doação também limpa as condições da troca', async () => {
  const memory = createMemoryListingsRepository();
  const screen = await renderHook(() => usePublishListingViewModel(memory.repository));
  await act(async () => screen.vm.setModality('trade'));
  await act(async () => screen.vm.setText('tradeTerms', 'Por ficção'));
  await act(async () => screen.vm.setModality('donation'));
  assert.equal(screen.vm.draft.tradeTerms, null);
  await screen.unmount();
});

test('publicar grava o anúncio e devolve o que foi criado', async () => {
  const memory = createMemoryListingsRepository();
  const screen = await renderHook(() => usePublishListingViewModel(memory.repository));
  await fillBook(screen);
  await act(async () => screen.vm.setPriceInput('25'));
  await act(async () => screen.vm.submit());
  assert.equal(screen.vm.error, null);
  assert.equal(screen.vm.published?.title, 'Dom Casmurro');
  assert.equal(memory.all().length, 1);
  await screen.unmount();
});

test('publicar com campo faltando não chama o servidor', async () => {
  const memory = createMemoryListingsRepository();
  const screen = await renderHook(() => usePublishListingViewModel(memory.repository));
  await act(async () => screen.vm.submit());
  assert.ok(screen.vm.error);
  assert.equal(memory.calls.length, 0);
  await screen.unmount();
});

test('erro do servidor vira mensagem, sem derrubar o formulário', async () => {
  const memory = createMemoryListingsRepository();
  memory.fail('network');
  const screen = await renderHook(() => usePublishListingViewModel(memory.repository));
  await fillBook(screen);
  await act(async () => screen.vm.setPriceInput('25'));
  await act(async () => screen.vm.submit());
  assert.match(screen.vm.error, /internet/i);
  assert.equal(screen.vm.published, null);
  await screen.unmount();
});

// ── Editar ──────────────────────────────────────────────────────────────────

test('editar abre com o anúncio já preenchido', async () => {
  const memory = createMemoryListingsRepository([listing()]);
  const screen = await renderHook(() => useEditListingViewModel(memory.repository, 'listing-1'));
  assert.equal(screen.vm.status, 'ready');
  assert.equal(screen.vm.draft.title, 'Dom Casmurro');
  assert.equal(screen.vm.priceInput, '25,00');
  assert.equal(screen.vm.locked, false);
  await screen.unmount();
});

test('anúncio reservado abre travado e diz por quê', async () => {
  const memory = createMemoryListingsRepository([listing({ status: 'reservado' })]);
  const screen = await renderHook(() => useEditListingViewModel(memory.repository, 'listing-1'));
  assert.equal(screen.vm.locked, true);
  assert.match(screen.vm.lockedReason, /negocia/i);
  await screen.unmount();
});

test('anúncio inexistente mostra erro com opção de tentar de novo', async () => {
  const memory = createMemoryListingsRepository();
  const screen = await renderHook(() => useEditListingViewModel(memory.repository, 'sumiu'));
  assert.equal(screen.vm.status, 'error');
  assert.ok(screen.vm.loadError);
  await screen.unmount();
});

test('salvar grava a alteração e marca como salvo', async () => {
  const memory = createMemoryListingsRepository([listing()]);
  const screen = await renderHook(() => useEditListingViewModel(memory.repository, 'listing-1'));
  await act(async () => screen.vm.setText('title', 'Memórias Póstumas'));
  await act(async () => screen.vm.save());
  assert.equal(screen.vm.saved, true);
  assert.equal(memory.all()[0].title, 'Memórias Póstumas');
  await screen.unmount();
});

test('sem mexer na foto, a capa é mantida', async () => {
  const memory = createMemoryListingsRepository([listing({ coverPath: 'user/capa.jpg' })]);
  const screen = await renderHook(() => useEditListingViewModel(memory.repository, 'listing-1'));
  await act(async () => screen.vm.save());
  assert.equal(memory.all()[0].coverPath, 'user/capa.jpg');
  assert.equal(memory.covers.has('user/capa.jpg'), true);
  await screen.unmount();
});

test('remover a foto na edição apaga o arquivo', async () => {
  const memory = createMemoryListingsRepository([listing({ coverPath: 'user/capa.jpg' })]);
  const screen = await renderHook(() => useEditListingViewModel(memory.repository, 'listing-1'));
  await act(async () => screen.vm.clearCover());
  await act(async () => screen.vm.save());
  assert.equal(memory.all()[0].coverPath, null);
  assert.equal(memory.covers.size, 0);
  await screen.unmount();
});

// ── Minha estante ───────────────────────────────────────────────────────────

test('a estante carrega os próprios anúncios', async () => {
  const memory = createMemoryListingsRepository([listing()]);
  const screen = await renderHook(() => useMyListingsViewModel(memory.repository));
  assert.equal(screen.vm.status, 'ready');
  assert.equal(screen.vm.listings.length, 1);
  assert.equal(screen.vm.empty, false);
  await screen.unmount();
});

test('estante vazia é um estado, não um erro', async () => {
  const memory = createMemoryListingsRepository();
  const screen = await renderHook(() => useMyListingsViewModel(memory.repository));
  assert.equal(screen.vm.empty, true);
  assert.equal(screen.vm.error, null);
  await screen.unmount();
});

test('arquivar troca a situação no próprio card, sem recarregar tudo', async () => {
  const memory = createMemoryListingsRepository([listing()]);
  const screen = await renderHook(() => useMyListingsViewModel(memory.repository));
  await act(async () => screen.vm.archive('listing-1'));
  assert.equal(screen.vm.listings[0].status, 'arquivado');
  assert.equal(screen.vm.pendingId, null);
  await screen.unmount();
});

test('excluir tira o anúncio da lista', async () => {
  const memory = createMemoryListingsRepository([listing()]);
  const screen = await renderHook(() => useMyListingsViewModel(memory.repository));
  await act(async () => screen.vm.remove('listing-1'));
  assert.equal(screen.vm.listings.length, 0);
  await screen.unmount();
});

test('ação recusada mostra o motivo e recarrega a lista', async () => {
  const memory = createMemoryListingsRepository([listing({ status: 'reservado' })]);
  const screen = await renderHook(() => useMyListingsViewModel(memory.repository));
  await act(async () => screen.vm.remove('listing-1'));
  assert.ok(screen.vm.error);
  // Continua lá: quem recusou foi o repositório, e a lista foi relida.
  assert.equal(screen.vm.listings.length, 1);
  await screen.unmount();
});
