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
