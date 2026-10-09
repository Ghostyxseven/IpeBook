import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryBookRequestRepository } from '../src/model/repositories/memoryBookRequestRepository.ts';
import { createMemoryCatalogRepository } from '../src/model/repositories/memoryCatalogRepository.ts';
import { createMemoryListingsRepository } from '../src/model/repositories/memoryListingsRepository.ts';
import { createSupabaseBookRequestRepository } from '../src/model/repositories/supabaseBookRequestRepository.ts';
import {
  confirmCopy,
  offeredLabel,
  requestScreenCopy,
  rescheduledCopy,
} from '../src/model/services/bookRequestFormat.ts';
import { useBookRequestDetailViewModel } from '../src/viewmodel/useBookRequestDetailViewModel.ts';
import { useCreateBookRequestViewModel } from '../src/viewmodel/useCreateBookRequestViewModel.ts';
import { useRescheduleViewModel } from '../src/viewmodel/useRescheduleViewModel.ts';
import { SessionContext } from '../src/viewmodel/useSession.ts';

const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/** Renderiza o hook dentro da sessão de `userId`, como faz o layout do app. */
async function renderHook(useHook, userId = 'u-lucas') {
  const holder = { current: null };
  const session = { status: 'signedIn', user: { id: userId, name: 'Teste' } };
  function Probe() {
    holder.current = useHook();
    return null;
  }
  const root = createRoot(document.createElement('div'));
  await act(async () =>
    root.render(
      React.createElement(SessionContext.Provider, { value: session }, React.createElement(Probe)),
    ),
  );
  return {
    get vm() {
      return holder.current;
    },
    unmount: () => act(async () => root.unmount()),
  };
}

const listing = (extra = {}) => ({
  id: 'l-dom',
  title: 'Dom Casmurro',
  author: 'Machado de Assis',
  category: 'Literatura',
  modality: 'trade',
  priceCents: null,
  tradeTerms: 'Romances',
  condition: 'bom',
  neighborhood: null,
  city: null,
  description: null,
  coverUrl: null,
  status: 'disponivel',
  ownerId: 'u-ana',
  ownerFirstName: 'Ana',
  createdAt: '2026-10-01T10:00:00Z',
  ...extra,
});

const mine = (extra = {}) => ({
  ...listing({ id: 'l-vidas', title: 'Vidas Secas', ownerId: 'u-lucas', modality: 'trade' }),
  coverPath: null,
  ...extra,
});

const request = (extra = {}) => ({
  id: 'r-1',
  listingId: 'l-dom',
  requesterId: 'u-lucas',
  offeredListingId: 'l-vidas',
  publicLocation: 'Praça da Matriz',
  meetingDate: '2026-10-05',
  meetingTime: '10:00',
  status: 'pending',
  createdAt: '2026-10-02T10:00:00Z',
  updatedAt: '2026-10-02T10:00:00Z',
  ...extra,
});

// ── Model ───────────────────────────────────────────────────────────────────

test('na troca, aceitar, concluir e cancelar movem também o livro oferecido', async () => {
  const listingStatus = { 'l-dom': 'disponivel', 'l-vidas': 'disponivel' };
  const repo = createMemoryBookRequestRepository([request()], { listingStatus });
  await repo.transitionRequest('r-1', 'accepted');
  assert.deepEqual(listingStatus, { 'l-dom': 'reservado', 'l-vidas': 'reservado' });
  await repo.transitionRequest('r-1', 'canceled');
  assert.deepEqual(listingStatus, { 'l-dom': 'disponivel', 'l-vidas': 'disponivel' });

  const done = { 'l-dom': 'disponivel', 'l-vidas': 'disponivel' };
  const other = createMemoryBookRequestRepository([request()], { listingStatus: done });
  await other.transitionRequest('r-1', 'accepted');
  await other.transitionRequest('r-1', 'completed');
  assert.deepEqual(done, { 'l-dom': 'concluido', 'l-vidas': 'concluido' });
});

test('reagendar só muda encontro aceito', async () => {
  const repo = createMemoryBookRequestRepository([request()]);
  const meeting = {
    publicLocation: ' Biblioteca ',
    meetingDate: '2026-10-06',
    meetingTime: '15:00',
  };
  await assert.rejects(repo.reschedule('r-1', meeting), { code: 'invalid_transition' });
  await repo.transitionRequest('r-1', 'accepted');
  const updated = await repo.reschedule('r-1', meeting);
  assert.equal(updated.publicLocation, 'Biblioteca');
  assert.equal(updated.meetingTime, '15:00');
  await assert.rejects(repo.reschedule('r-x', meeting), { code: 'not_found' });
});

test('repositório Supabase envia o livro oferecido, reagenda pela função e busca o nome', async () => {
  const calls = [];
  const row = {
    id: 'r-1',
    listing_id: 'l-dom',
    requester_id: 'u-lucas',
    offered_listing_id: 'l-vidas',
    public_location: 'Biblioteca',
    meeting_date: '2026-10-06',
    meeting_time: '15:00',
    status: 'accepted',
    created_at: '2026-10-02T00:00:00Z',
    updated_at: '2026-10-02T00:00:00Z',
  };
  const single = { maybeSingle: async () => ({ data: row, error: null }) };
  const client = {
    from: () => ({
      insert: (payload) => (calls.push(['insert', payload]), { select: () => single }),
    }),
    rpc(name, args) {
      calls.push([name, args]);
      if (name === 'listing_owner_first_name')
        return Promise.resolve({ data: 'Lucas', error: null });
      return { select: () => single };
    },
  };
  const repo = createSupabaseBookRequestRepository(client);
  const created = await repo.createRequest({
    listingId: 'l-dom',
    publicLocation: 'Praça',
    meetingDate: '2026-10-05',
    meetingTime: '10:00',
    offeredListingId: 'l-vidas',
  });
  assert.equal(created.offeredListingId, 'l-vidas');
  assert.equal(calls[0][1].offered_listing_id, 'l-vidas');

  await repo.reschedule('r-1', {
    publicLocation: 'Biblioteca',
    meetingDate: '2026-10-06',
    meetingTime: '15:00',
  });
  assert.deepEqual(calls[1], [
    'reschedule_book_request',
    { request_id: 'r-1', new_location: 'Biblioteca', new_date: '2026-10-06', new_time: '15:00' },
  ]);
  assert.equal(await repo.personFirstName('u-lucas'), 'Lucas');

  await repo.createRequest({
    listingId: 'l-dom',
    publicLocation: 'Praça',
    meetingDate: '2026-10-05',
    meetingTime: '10:00',
  });
  assert.equal('offered_listing_id' in calls.at(-1)[1], false);
});

test('textos usam o nome de quem pediu e explicam a troca', () => {
  const when = { meetingDate: '2026-10-03', meetingTime: '10:00' };
  const owner = { asOwner: true, modality: 'trade', ownerName: 'Ana', requesterName: 'Lucas' };
  assert.equal(
    requestScreenCopy({ ...when, status: 'pending' }, owner).title,
    'Lucas quer trocar seu livro',
  );
  assert.match(requestScreenCopy({ ...when, status: 'accepted' }, owner).body, /troca com Lucas/);
  assert.equal(
    requestScreenCopy({ ...when, status: 'pending' }, { ...owner, requesterName: null }).title,
    'Alguém quer trocar seu livro',
  );
  assert.match(
    confirmCopy('reject', { asOwner: true, requesterName: 'Lucas', listingTitle: 'Dom Casmurro' })
      .body,
    /^Lucas recebe um aviso/,
  );
  assert.equal(offeredLabel({ asOwner: true }), 'Você recebe em troca');
  assert.equal(offeredLabel({ asOwner: false }), 'Você oferece');
  const copy = rescheduledCopy(
    { publicLocation: 'Praça da Matriz', meetingDate: '2026-10-05', meetingTime: '15:00' },
    'Ana',
  );
  assert.equal(
    copy.body,
    'Seg, 05/10 · 15h · Praça da Matriz. Ana vê o novo horário na negociação.',
  );
});

// ── ViewModels ──────────────────────────────────────────────────────────────

test('pedir um livro de troca começa escolhendo o livro oferecido (Figma 03.05)', async () => {
  const catalog = createMemoryCatalogRepository([listing()]).repository;
  const requests = createMemoryBookRequestRepository([], { currentUserId: 'u-lucas' });
  const listings = createMemoryListingsRepository([
    mine(),
    mine({ id: 'l-arquivado', title: 'Arquivado', status: 'arquivado' }),
  ]).repository;
  const hook = await renderHook(() =>
    useCreateBookRequestViewModel(catalog, requests, 'l-dom', listings),
  );
  assert.equal(hook.vm.step, 'offer');
  assert.equal(hook.vm.needsOffer, true);
  assert.deepEqual(
    hook.vm.offerOptions.map((item) => item.id),
    ['l-vidas'],
  );
  assert.equal(hook.vm.offeredListingId, 'l-vidas');

  await act(async () => hook.vm.continueToMeeting());
  assert.equal(hook.vm.step, 'meeting');
  await act(async () => {
    hook.vm.setPublicLocation('Praça da Matriz');
    hook.vm.setMeetingDate('2026-10-05');
    hook.vm.setMeetingTime('10:00');
  });
  await act(async () => hook.vm.submit());
  const [created] = requests.snapshot();
  assert.equal(created.offeredListingId, 'l-vidas');
  assert.equal(hook.vm.submitted, created.id);
  await hook.unmount();
});

test('venda e doação vão direto para o encontro, sem livro oferecido', async () => {
  const catalog = createMemoryCatalogRepository([
    listing({ modality: 'sale', priceCents: 2000 }),
  ]).repository;
  const requests = createMemoryBookRequestRepository([]);
  const listings = createMemoryListingsRepository([mine()]).repository;
  const hook = await renderHook(() =>
    useCreateBookRequestViewModel(catalog, requests, 'l-dom', listings),
  );
  assert.equal(hook.vm.step, 'meeting');
  assert.equal(hook.vm.needsOffer, false);
  await hook.unmount();
});

test('sem livro disponível para oferecer, não dá para seguir', async () => {
  const catalog = createMemoryCatalogRepository([listing()]).repository;
  const requests = createMemoryBookRequestRepository([]);
  const listings = createMemoryListingsRepository([]).repository;
  const hook = await renderHook(() =>
    useCreateBookRequestViewModel(catalog, requests, 'l-dom', listings),
  );
  assert.equal(hook.vm.offerOptions.length, 0);
  await act(async () => hook.vm.continueToMeeting());
  assert.equal(hook.vm.step, 'offer');
  await hook.unmount();
});

test('detalhe mostra o livro oferecido e o nome de quem pediu para quem anunciou', async () => {
  const catalog = createMemoryCatalogRepository([
    listing(),
    listing({ id: 'l-vidas', title: 'Vidas Secas', ownerId: 'u-lucas' }),
  ]).repository;
  const requests = createMemoryBookRequestRepository([request()], {
    names: { 'u-lucas': 'Lucas' },
  });
  const hook = await renderHook(
    () => useBookRequestDetailViewModel(catalog, requests, 'r-1'),
    'u-ana',
  );
  assert.equal(hook.vm.status, 'ready');
  assert.equal(hook.vm.offeredListing.title, 'Vidas Secas');
  assert.equal(hook.vm.requesterName, 'Lucas');
  assert.deepEqual(hook.vm.other, { id: 'u-lucas', name: 'Lucas' });
  await hook.unmount();
});

test('reagendar: começa com o local, exige mudança e mostra o retorno (06.13 e 06.14)', async () => {
  const catalog = createMemoryCatalogRepository([listing()]).repository;
  const requests = createMemoryBookRequestRepository([request({ status: 'accepted' })], {
    names: { 'u-lucas': 'Lucas' },
  });
  const hook = await renderHook(() => useRescheduleViewModel(requests, catalog, 'r-1', 'u-ana'));
  assert.equal(hook.vm.status, 'ready');
  assert.equal(hook.vm.otherName, 'Lucas');
  assert.equal(hook.vm.publicLocation, 'Praça da Matriz');
  assert.equal(hook.vm.canSubmit, false);
  await act(async () => {
    hook.vm.setMeetingDate('2026-10-06');
    hook.vm.setMeetingTime('15:00');
  });
  assert.equal(hook.vm.canSubmit, true);
  await act(async () => hook.vm.submit());
  assert.equal(hook.vm.done.meetingTime, '15:00');
  assert.equal((await requests.getRequestById('r-1')).meetingDate, '2026-10-06');
  await hook.unmount();
});

test('reagendar uma proposta ainda pendente avisa que não dá', async () => {
  const catalog = createMemoryCatalogRepository([listing()]).repository;
  const requests = createMemoryBookRequestRepository([request()]);
  const hook = await renderHook(() => useRescheduleViewModel(requests, catalog, 'r-1', 'u-lucas'));
  assert.equal(hook.vm.status, 'closed');
  assert.equal(hook.vm.otherName, 'Ana');
  await hook.unmount();
});

// ── Contraproposta (Figma 06.19 e 06.20, ADR 0030) ──────────────────────────

const cortico = () =>
  listing({ id: 'l-cortico', title: 'O Cortiço', ownerId: 'u-lucas', modality: 'trade' });

test('o dono pede outro livro da estante de quem propôs e quem propôs aceita', async () => {
  const listingStatus = { 'l-dom': 'disponivel' };
  const repo = createMemoryBookRequestRepository([request()], {
    listingStatus,
    shelf: [cortico()],
  });

  const estante = await repo.shelfOfRequester('r-1');
  assert.deepEqual(
    estante.map((item) => item.id),
    ['l-cortico'],
    'a estante traz só trocas disponíveis, sem o anúncio pedido',
  );

  const comContra = await repo.counterOffer('r-1', 'l-cortico');
  assert.equal(comContra.counterListingId, 'l-cortico');
  assert.equal(comContra.status, 'pending', 'contrapor não fecha nem recusa a negociação');
  assert.equal(comContra.offeredListingId, 'l-vidas', 'a proposta original continua visível');

  const aceita = await repo.answerCounterOffer('r-1', true);
  assert.equal(aceita.status, 'accepted');
  assert.equal(aceita.offeredListingId, 'l-cortico', 'o contraproposto vira o livro da troca');
  assert.equal(aceita.counterListingId, null);
  assert.equal(listingStatus['l-dom'], 'reservado', 'aceitar reserva o anúncio, como aceitar');
});

test('recusar a contraproposta encerra a negociação', async () => {
  const repo = createMemoryBookRequestRepository([request()], {
    listingStatus: { 'l-dom': 'disponivel' },
    shelf: [cortico()],
  });
  await repo.counterOffer('r-1', 'l-cortico');
  const recusada = await repo.answerCounterOffer('r-1', false);
  assert.equal(recusada.status, 'rejected');
  assert.equal(recusada.counterListingId, null);
});

test('a contraproposta recusa livro inválido e não se repete', async () => {
  const repo = createMemoryBookRequestRepository([request()], {
    listingStatus: { 'l-dom': 'disponivel' },
    shelf: [cortico(), listing({ id: 'l-fora', ownerId: 'u-lucas', status: 'reservado' })],
  });

  // O livro que já foi oferecido não serve: a contraproposta existe para pedir outro.
  await assert.rejects(() => repo.counterOffer('r-1', 'l-vidas'), { code: 'invalid_transition' });
  // Nem o próprio anúncio pedido.
  await assert.rejects(() => repo.counterOffer('r-1', 'l-dom'), { code: 'invalid_transition' });
  // Nem um anúncio que não está disponível.
  await assert.rejects(() => repo.counterOffer('r-1', 'l-fora'), { code: 'invalid_transition' });

  await repo.counterOffer('r-1', 'l-cortico');
  // Uma por vez: a bola está com quem propôs.
  await assert.rejects(() => repo.counterOffer('r-1', 'l-cortico'), {
    code: 'invalid_transition',
  });
});

test('sem contraproposta de pé, não há o que responder', async () => {
  const repo = createMemoryBookRequestRepository([request()], {
    listingStatus: { 'l-dom': 'disponivel' },
    shelf: [cortico()],
  });
  await assert.rejects(() => repo.answerCounterOffer('r-1', true), {
    code: 'invalid_transition',
  });
});

test('aceitar contraproposta reserva ambos e recusa pedidos concorrentes', async () => {
  const listingStatus = {
    'l-dom': 'disponivel',
    'l-cortico': 'disponivel',
    'l-vidas': 'disponivel',
  };
  const repo = createMemoryBookRequestRepository(
    [
      request({ counterListingId: 'l-cortico' }),
      request({ id: 'r-2', requesterId: 'outra-pessoa' }),
    ],
    { listingStatus, shelf: [cortico()] },
  );
  await repo.answerCounterOffer('r-1', true);
  assert.equal(listingStatus['l-cortico'], 'reservado');
  assert.equal(listingStatus['l-vidas'], 'disponivel');
  assert.equal((await repo.getRequestById('r-2')).status, 'rejected');
  await repo.transitionRequest('r-1', 'canceled');
  assert.equal(listingStatus['l-cortico'], 'disponivel');
});

test('a proposta original não pode ser aceita enquanto aguarda contraproposta', async () => {
  const repo = createMemoryBookRequestRepository([request({ counterListingId: 'l-cortico' })]);
  await assert.rejects(repo.transitionRequest('r-1', 'accepted'), { code: 'invalid_transition' });
});

test('estante exclui livro original, terceiros e modalidades diferentes', async () => {
  const shelf = [
    cortico(),
    mine(),
    listing({ id: 'terceiro' }),
    mine({ id: 'venda', modality: 'sale' }),
  ];
  const repo = createMemoryBookRequestRepository([request()], { shelf });
  assert.deepEqual(
    (await repo.shelfOfRequester('r-1')).map((item) => item.id),
    ['l-cortico'],
  );
  for (const id of ['l-vidas', 'terceiro', 'venda']) {
    await assert.rejects(repo.counterOffer('r-1', id), { code: 'invalid_transition' });
  }
});

test('não aceita contraproposta cujo livro ficou indisponível', async () => {
  const repo = createMemoryBookRequestRepository([request({ counterListingId: 'l-cortico' })], {
    listingStatus: { 'l-dom': 'disponivel', 'l-cortico': 'reservado' },
    shelf: [cortico()],
  });
  await assert.rejects(repo.answerCounterOffer('r-1', true), { code: 'invalid_transition' });
  assert.equal((await repo.getRequestById('r-1')).status, 'pending');
});

test('detalhe identifica contraproposta e bloqueia aceite original do dono', async () => {
  const catalog = createMemoryCatalogRepository([listing(), mine(), cortico()]).repository;
  const repo = createMemoryBookRequestRepository([request({ counterListingId: 'l-cortico' })]);
  const hook = await renderHook(() => useBookRequestDetailViewModel(catalog, repo, 'r-1'), 'u-ana');
  try {
    assert.equal(hook.vm.counterListing?.title, 'O Cortiço');
    assert.equal(hook.vm.offeredListing.title, 'Vidas Secas');
    assert.equal(hook.vm.capabilities.canAccept, false);
    assert.equal(hook.vm.capabilities.canReject, false);
  } finally {
    await hook.unmount();
  }
});

test('ViewModel envia contraproposta, apresenta livro escolhido e erro dentro da folha', async () => {
  const catalog = createMemoryCatalogRepository([listing(), mine(), cortico()]).repository;
  const repo = createMemoryBookRequestRepository([request()], { shelf: [cortico()] });
  const hook = await renderHook(() => useBookRequestDetailViewModel(catalog, repo, 'r-1'), 'u-ana');
  try {
    await act(async () => hook.vm.openCounter());
    assert.equal(hook.vm.shelfStatus, 'ready');
    await act(async () => hook.vm.counterOffer('inexistente'));
    assert.ok(hook.vm.counterError);
    assert.equal(hook.vm.shelfStatus, 'ready');
    await act(async () => hook.vm.counterOffer('l-cortico'));
    assert.equal(hook.vm.counterError, null);
    assert.equal(hook.vm.shelfStatus, 'idle');
    assert.equal(hook.vm.counterListing.id, 'l-cortico');
    assert.equal(hook.vm.capabilities.canAccept, false);
  } finally {
    await hook.unmount();
  }
});

test('fechar folha durante carregamento não reabre quando a resposta chega', async () => {
  const catalog = createMemoryCatalogRepository([listing(), mine()]).repository;
  const repo = createMemoryBookRequestRepository([request()]);
  let resolve;
  repo.shelfOfRequester = () =>
    new Promise((done) => {
      resolve = done;
    });
  const hook = await renderHook(() => useBookRequestDetailViewModel(catalog, repo, 'r-1'), 'u-ana');
  try {
    let loading;
    await act(async () => {
      loading = hook.vm.openCounter();
    });
    await act(async () => hook.vm.closeCounter());
    await act(async () => {
      resolve([cortico()]);
      await loading;
    });
    assert.equal(hook.vm.shelfStatus, 'idle');
  } finally {
    await hook.unmount();
  }
});

test('quem pediu aceita contraproposta e o detalhe passa a mostrar o novo livro', async () => {
  const catalog = createMemoryCatalogRepository([listing(), mine(), cortico()]).repository;
  const repo = createMemoryBookRequestRepository([request({ counterListingId: 'l-cortico' })], {
    shelf: [cortico()],
  });
  const hook = await renderHook(() => useBookRequestDetailViewModel(catalog, repo, 'r-1'));
  try {
    assert.equal(hook.vm.capabilities.canAnswerCounter, true);
    await act(async () => hook.vm.answerCounter(true));
    assert.equal(hook.vm.request.status, 'accepted');
    assert.equal(hook.vm.offeredListing.id, 'l-cortico');
    assert.equal(hook.vm.counterListing, null);
    assert.equal(hook.vm.lastAction, 'accepted');
  } finally {
    await hook.unmount();
  }
});

test('memória confere os participantes nas ações da contraproposta', async () => {
  const options = {
    currentUserId: 'terceiro',
    listingOwner: { 'l-dom': 'u-ana' },
    shelf: [cortico()],
  };
  const repo = createMemoryBookRequestRepository([request()], options);
  assert.deepEqual(await repo.shelfOfRequester('r-1'), []);
  await assert.rejects(repo.counterOffer('r-1', 'l-cortico'), { code: 'forbidden' });
  const pending = createMemoryBookRequestRepository(
    [request({ counterListingId: 'l-cortico' })],
    options,
  );
  await assert.rejects(pending.answerCounterOffer('r-1', true), { code: 'forbidden' });
});

test('RPCs de contraproposta enviam parâmetros, traduzem erros e carregam capa', async () => {
  const calls = [];
  let error = null;
  const row = {
    id: 'r-1',
    listing_id: 'l-dom',
    requester_id: 'u-lucas',
    offered_listing_id: 'l-vidas',
    counter_listing_id: 'l-cortico',
    status: 'pending',
  };
  const client = {
    rpc(name, args) {
      calls.push([name, args]);
      if (name === 'shelf_of_requester')
        return Promise.resolve({
          data: [{ ...cortico(), owner_id: 'u-lucas', cover_path: 'capa.jpg' }],
          error,
        });
      return { select: () => ({ maybeSingle: async () => ({ data: row, error }) }) };
    },
    storage: {
      from: () => ({
        getPublicUrl: (path) => ({ data: { publicUrl: `https://example.test/${path}` } }),
      }),
    },
  };
  const repo = createSupabaseBookRequestRepository(client);
  assert.equal((await repo.counterOffer('r-1', 'l-cortico')).counterListingId, 'l-cortico');
  assert.deepEqual(calls.at(-1), [
    'counter_offer',
    { p_request_id: 'r-1', p_listing_id: 'l-cortico' },
  ]);
  await repo.answerCounterOffer('r-1', false);
  assert.deepEqual(calls.at(-1), [
    'answer_counter_offer',
    { p_request_id: 'r-1', p_accept: false },
  ]);
  assert.equal((await repo.shelfOfRequester('r-1'))[0].coverUrl, 'https://example.test/capa.jpg');
  error = { code: '42501' };
  await assert.rejects(repo.counterOffer('r-1', 'l-cortico'), { code: 'forbidden' });
  error = { code: 'P0001', message: 'invalid_transition' };
  await assert.rejects(repo.answerCounterOffer('r-1', true), { code: 'invalid_transition' });
  error = { message: 'network error' };
  await assert.rejects(repo.shelfOfRequester('r-1'), { code: 'network' });
});
