import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canTransition,
  ensureTransition,
  isOwner,
  canCancel,
  canComplete,
  ensureCanCreate,
  listingStatusOnAccept,
  listingStatusOnComplete,
  listingStatusOnCancel,
  canCounter,
  canAnswerCounter,
  effectiveOfferId,
} from '../src/model/services/bookRequestTransitions.ts';
import { BookRequestError } from '../src/model/entities/BookRequestError.ts';
import { bookRequestErrorMessage } from '../src/model/services/bookRequestMessages.ts';
import {
  requestStatusLabel,
  meetingDateLabel,
  meetingTimeLabel,
  meetingSummary,
  requestListLabel,
  meetingDayLabel,
  meetingHourLabel,
  meetingWhen,
  meetingDayOptions,
  meetingTimeOptions,
  meetingPlaceSuggestions,
  isSuggestedPlace,
  requestScreenCopy,
  confirmCopy,
} from '../src/model/services/bookRequestFormat.ts';
import { createMemoryBookRequestRepository } from '../src/model/repositories/memoryBookRequestRepository.ts';
import {
  createSupabaseBookRequestRepository,
  mapSupabaseBookRequestError,
} from '../src/model/repositories/supabaseBookRequestRepository.ts';

const listing = (extra = {}) => ({
  id: 'l-1',
  title: 'Livro',
  author: 'A',
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
  ownerId: 'owner-ana',
  ownerFirstName: 'Ana',
  createdAt: '2026-10-01T10:00:00Z',
  ...extra,
});

test('transições permitidas por status', () => {
  // pending pode ir para accepted, rejected, canceled
  assert.equal(canTransition('pending', 'accepted'), true);
  assert.equal(canTransition('pending', 'rejected'), true);
  assert.equal(canTransition('pending', 'canceled'), true);
  assert.equal(canTransition('pending', 'completed'), false);
  assert.equal(canTransition('pending', 'pending'), false);

  // accepted pode ir para canceled e completed
  assert.equal(canTransition('accepted', 'canceled'), true);
  assert.equal(canTransition('accepted', 'completed'), true);
  assert.equal(canTransition('accepted', 'accepted'), false);
  assert.equal(canTransition('accepted', 'rejected'), false);

  // terminais
  assert.equal(canTransition('rejected', 'accepted'), false);
  assert.equal(canTransition('canceled', 'completed'), false);
  assert.equal(canTransition('completed', 'canceled'), false);
  assert.equal(canTransition('completed', 'accepted'), false);
});

test('ensureTransition lança invalid_transition para transição proibida', () => {
  assert.throws(() => ensureTransition('pending', 'completed'), {
    code: 'invalid_transition',
  });
  assert.throws(() => ensureTransition('rejected', 'accepted'), {
    code: 'invalid_transition',
  });
  // Quem captura espera a classe do domínio, não um Error qualquer.
  assert.throws(() => ensureTransition('pending', 'completed'), BookRequestError);
  // Transições válidas não lançam
  ensureTransition('pending', 'accepted');
  ensureTransition('accepted', 'completed');
});

test('papéis: isOwner distingue dono de requerente', () => {
  assert.equal(isOwner('owner-ana', { ownerId: 'owner-ana' }), true);
  assert.equal(isOwner('req-beto', { ownerId: 'owner-ana' }), false);
  assert.equal(isOwner('x', { ownerId: null }), false);
  assert.equal(isOwner('x', {}), false);
});

test('cancelar: pending só requerente cancela; accepted ambos podem', () => {
  const ids = { requesterId: 'req-beto', ownerId: 'owner-ana' };
  assert.equal(canCancel('pending', 'req-beto', ids), true);
  assert.equal(canCancel('pending', 'owner-ana', ids), false);
  assert.equal(canCancel('pending', 'terceiro', ids), false);

  assert.equal(canCancel('accepted', 'req-beto', ids), true);
  assert.equal(canCancel('accepted', 'owner-ana', ids), true);
  assert.equal(canCancel('accepted', 'terceiro', ids), false);

  // Terminais nunca cancelam
  assert.equal(canCancel('rejected', 'req-beto', ids), false);
  assert.equal(canCancel('completed', 'owner-ana', ids), false);
});

test('concluir: só dono pode concluir e só a partir de accepted', () => {
  const DONO = { ownerId: 'owner-ana' };
  const OUTRO = { ownerId: 'owner-ana' };
  assert.equal(canComplete('accepted', 'owner-ana', DONO), true);
  assert.equal(canComplete('accepted', 'req-beto', OUTRO), false);
  assert.equal(canComplete('accepted', 'terceiro', OUTRO), false);
  assert.equal(canComplete('pending', 'owner-ana', DONO), false);
  assert.equal(canComplete('completed', 'owner-ana', DONO), false);
  assert.equal(canComplete('rejected', 'owner-ana', DONO), false);
});

test('ensureCanCreate: valida disponibilidade, existência e conflito dono', () => {
  // OK
  ensureCanCreate(listing(), 'req-beto');

  assert.throws(() => ensureCanCreate(null, 'req-beto'), { code: 'not_found' });
  assert.throws(() => ensureCanCreate(listing(), null), { code: 'forbidden' });
  assert.throws(() => ensureCanCreate(listing({ status: 'reservado' }), 'req-beto'), {
    code: 'invalid_transition',
  });
  assert.throws(() => ensureCanCreate(listing({ status: 'concluido' }), 'req-beto'), {
    code: 'invalid_transition',
  });
  // Dono não pode solicitar o próprio livro
  assert.throws(() => ensureCanCreate(listing(), 'owner-ana'), { code: 'forbidden' });
});

test('status do anúncio: aceita → reservado; conclui → concluido; cancela accepted → disponivel', () => {
  assert.equal(listingStatusOnAccept(), 'reservado');
  assert.equal(listingStatusOnComplete(), 'concluido');
  assert.equal(listingStatusOnCancel('accepted', 'reservado'), 'disponivel');
  assert.equal(listingStatusOnCancel('pending', 'disponivel'), null);
  assert.equal(listingStatusOnCancel('accepted', 'disponivel'), null);
});

test('mensagens de erro: todos os códigos têm texto em português e não vazios', () => {
  /** @type {import('../src/model/entities/BookRequestError.ts').BookRequestErrorCode[]} */
  const codes = [
    'not_found',
    'invalid_transition',
    'forbidden',
    'already_exists',
    'network',
    'not_configured',
    'unknown',
  ];
  for (const code of codes) {
    const msg = bookRequestErrorMessage(code);
    assert.equal(typeof msg, 'string');
    assert.ok(msg.length > 0, `mensagem vazia para código ${code}`);
    assert.ok(msg !== code, `mensagem expõe o código técnico para ${code}`);
  }
});

test('formatação: status e dados do encontro', () => {
  assert.equal(requestStatusLabel('pending'), 'Aguardando resposta');
  assert.equal(requestStatusLabel('accepted'), 'Encontro combinado');
  assert.equal(requestStatusLabel('rejected'), 'Recusada');
  assert.equal(requestStatusLabel('canceled'), 'Cancelada');
  assert.equal(requestStatusLabel('completed'), 'Concluída');

  // Data válida (AAAA-MM-DD) retorna rótulo formatado em pt-BR
  const dataFormatada = meetingDateLabel('2026-10-30');
  assert.ok(typeof dataFormatada === 'string' && dataFormatada.length > 0);
  // Data inválida retorna null
  assert.equal(meetingDateLabel('invalida'), null);

  assert.equal(meetingTimeLabel('09:30'), '09h30');
  assert.equal(meetingTimeLabel('16:00'), '16h00');

  // ADR 0035: negociação só-conversa ainda não tem data/hora — formata sem quebrar.
  assert.equal(meetingDateLabel(null), null);
  assert.equal(meetingTimeLabel(null), '');
  assert.equal(meetingDayLabel(null), null);
  assert.equal(meetingHourLabel(null), '');
  assert.equal(meetingWhen({ meetingDate: null, meetingTime: null }), '');

  const req = {
    id: 'r',
    listingId: 'l',
    requesterId: 'u',
    publicLocation: 'Praça das Flores',
    meetingDate: '2026-10-30',
    meetingTime: '09:30',
    status: 'pending',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  };
  assert.ok(meetingSummary(req).includes('Praça das Flores'));
  assert.ok(meetingSummary(req).includes('09h30'));

  assert.ok(requestListLabel(req, { asOwner: true }).length > 0);
  assert.ok(requestListLabel(req, { asOwner: false }).length > 0);
});

test('repositório em memória: cria, lista, atualiza status', async () => {
  const repo = createMemoryBookRequestRepository([], {
    listingOwner: { 'l-1': 'owner-ana' },
  });

  const created = await repo.createRequest({
    listingId: 'l-1',
    publicLocation: 'Praça',
    meetingDate: '2026-11-01',
    meetingTime: '10:00',
  });
  assert.equal(created.listingId, 'l-1');
  assert.equal(created.status, 'pending');
  assert.equal(typeof created.id, 'string');
  assert.ok(created.createdAt.length > 0);

  const byId = await repo.getRequestById(created.id);
  assert.equal(byId.id, created.id);

  // NotFound
  await assert.rejects(repo.getRequestById('id-inexistente'), { code: 'not_found' });

  const reqList = await repo.getRequestsByRequester(created.requesterId);
  assert.equal(reqList.length, 1);
  assert.equal(reqList[0].id, created.id);

  // getRequestsByOwner retorna a solicitacao p/ dono correto
  const ownerList = await repo.getRequestsByOwner('owner-ana');
  assert.equal(ownerList.length, 1);
  const ownerListOther = await repo.getRequestsByOwner('owner-outro');
  assert.equal(ownerListOther.length, 0);

  // pending → accepted
  const accepted = await repo.transitionRequest(created.id, 'accepted');
  assert.equal(accepted.status, 'accepted');
  const fetched = await repo.getRequestById(created.id);
  assert.equal(fetched.status, 'accepted');
});

test('repositório em memória: createRequest sempre cria como pending', async () => {
  const repo = createMemoryBookRequestRepository([]);
  const r = await repo.createRequest({
    listingId: 'l-x',
    publicLocation: 'Local',
    meetingDate: '2026-12-12',
    meetingTime: '14:00',
  });
  assert.equal(r.status, 'pending');
});

test('ADR 0035: "Conversar" cria sem encontro, e o encontro só entra depois por proposeMeeting', async () => {
  const listingStatus = { 'l-1': 'disponivel' };
  const repo = createMemoryBookRequestRepository([], { listingStatus });
  const started = await repo.createRequest({
    listingId: 'l-1',
    publicLocation: null,
    meetingDate: null,
    meetingTime: null,
  });
  assert.equal(started.status, 'pending');
  assert.equal(started.publicLocation, null);

  // Sem encontro ainda, aceitar não devia fazer sentido nenhum — mesmo padrão do
  // `transition_book_request` no banco, mas aqui o repositório em memória não impõe
  // essa regra (fica só na ViewModel/tela); o que importa é propor funcionar.
  const proposed = await repo.proposeMeeting(started.id, {
    publicLocation: 'Praça da Matriz',
    meetingDate: '2026-12-12',
    meetingTime: '14:00',
  });
  assert.equal(proposed.publicLocation, 'Praça da Matriz');
  assert.equal(proposed.meetingDate, '2026-12-12');
  assert.equal(proposed.status, 'pending');

  const accepted = await repo.transitionRequest(started.id, 'accepted');
  assert.equal(accepted.status, 'accepted');
});

test('ADR 0035: proposeMeeting recusa quando já tem encontro ou não está pending', async () => {
  const repo = createMemoryBookRequestRepository([]);
  const withMeeting = await repo.createRequest({
    listingId: 'l-1',
    publicLocation: 'Praça',
    meetingDate: '2026-12-12',
    meetingTime: '10:00',
  });
  await assert.rejects(
    repo.proposeMeeting(withMeeting.id, {
      publicLocation: 'Outra praça',
      meetingDate: '2026-12-13',
      meetingTime: '11:00',
    }),
    { code: 'invalid_transition' },
  );

  const conversation = await repo.createRequest({
    listingId: 'l-2',
    publicLocation: null,
    meetingDate: null,
    meetingTime: null,
  });
  await repo.transitionRequest(conversation.id, 'canceled');
  await assert.rejects(
    repo.proposeMeeting(conversation.id, {
      publicLocation: 'Praça',
      meetingDate: '2026-12-12',
      meetingTime: '10:00',
    }),
    { code: 'invalid_transition' },
  );
});

test('repositório em memória: aceitar reserva o anúncio e recusa os outros pedidos', async () => {
  const listingStatus = { 'l-1': 'disponivel' };
  const repo = createMemoryBookRequestRepository([], { listingStatus });
  const data = {
    listingId: 'l-1',
    publicLocation: 'Praça',
    meetingDate: '2026-12-12',
    meetingTime: '10:00',
  };
  const first = await repo.createRequest(data);
  const second = await repo.createRequest(data);

  await repo.transitionRequest(first.id, 'accepted');
  assert.equal(listingStatus['l-1'], 'reservado');
  assert.equal((await repo.getRequestById(second.id)).status, 'rejected');

  await repo.transitionRequest(first.id, 'completed');
  assert.equal(listingStatus['l-1'], 'concluido');
});

test('repositório em memória: cancelar um pedido aceito devolve o anúncio ao catálogo', async () => {
  const listingStatus = { 'l-1': 'disponivel' };
  const repo = createMemoryBookRequestRepository([], { listingStatus });
  const r = await repo.createRequest({
    listingId: 'l-1',
    publicLocation: 'Praça',
    meetingDate: '2026-12-12',
    meetingTime: '10:00',
  });
  await repo.transitionRequest(r.id, 'accepted');
  await repo.transitionRequest(r.id, 'canceled');
  assert.equal(listingStatus['l-1'], 'disponivel');
});

test('repositório em memória: transição inválida é recusada', async () => {
  const repo = createMemoryBookRequestRepository([]);
  const r = await repo.createRequest({
    listingId: 'l-1',
    publicLocation: 'Praça',
    meetingDate: '2026-12-12',
    meetingTime: '10:00',
  });
  await assert.rejects(repo.transitionRequest(r.id, 'completed'), { code: 'invalid_transition' });
});

test('repositório Supabase: chama a função de transição e traduz os erros do banco', async () => {
  const calls = [];
  const row = {
    id: 'r-1',
    listing_id: 'l-1',
    requester_id: 'u-1',
    public_location: 'Praça',
    meeting_date: '2026-12-12',
    meeting_time: '10:00',
    status: 'accepted',
    created_at: '2026-10-02T00:00:00Z',
    updated_at: '2026-10-02T00:00:00Z',
  };
  const client = {
    from() {
      throw new Error('o app não deve atualizar a tabela diretamente');
    },
    rpc(name, args) {
      calls.push([name, args]);
      return { select: () => ({ maybeSingle: async () => ({ data: row, error: null }) }) };
    },
  };
  const repo = createSupabaseBookRequestRepository(client);
  const updated = await repo.transitionRequest('r-1', 'accepted');
  assert.equal(updated.status, 'accepted');
  assert.deepEqual(calls, [
    ['transition_book_request', { request_id: 'r-1', next_status: 'accepted' }],
  ]);

  assert.equal(mapSupabaseBookRequestError({ code: '42501' }).code, 'forbidden');
  assert.equal(mapSupabaseBookRequestError({ code: 'P0002' }).code, 'not_found');
  assert.equal(
    mapSupabaseBookRequestError({ code: 'P0001', message: 'invalid_transition' }).code,
    'invalid_transition',
  );
});

test('dia e horário curtos do Figma 06.04', () => {
  assert.equal(meetingDayLabel('2026-10-03'), 'Sáb, 03/10');
  assert.equal(meetingDayLabel('2026-02-30'), null);
  assert.equal(meetingDayLabel('x'), null);
  assert.equal(meetingHourLabel('10:00'), '10h');
  assert.equal(meetingHourLabel('09:30'), '9h30');
  assert.equal(
    meetingWhen({ meetingDate: '2026-10-03', meetingTime: '10:00' }),
    'Sáb, 03/10 · 10h',
  );
});

test('chips de dia começam amanhã e de horário ficam no horário comercial', () => {
  const days = meetingDayOptions(new Date(2026, 9, 2, 22), 3);
  assert.deepEqual(days, [
    { value: '2026-10-03', label: 'Sáb, 03/10' },
    { value: '2026-10-04', label: 'Dom, 04/10' },
    { value: '2026-10-05', label: 'Seg, 05/10' },
  ]);
  const lastOfMonth = meetingDayOptions(new Date(2026, 9, 31), 1);
  assert.equal(lastOfMonth[0].value, '2026-11-01');
  assert.ok(meetingTimeOptions.every((time) => /^\d{2}:00$/.test(time)));
});

test('textos de cada situação da negociação (Figma 06.03 a 06.18)', () => {
  const when = { meetingDate: '2026-10-03', meetingTime: '10:00' };
  const owner = { asOwner: true, modality: 'trade', ownerName: 'Ana' };
  const requester = { asOwner: false, modality: 'sale', ownerName: 'Ana' };
  assert.equal(
    requestScreenCopy({ ...when, status: 'pending' }, owner).title,
    'Alguém quer trocar seu livro',
  );
  assert.equal(
    requestScreenCopy({ ...when, status: 'pending' }, requester).body,
    'Aguardando a resposta de Ana.',
  );
  assert.equal(
    requestScreenCopy({ ...when, status: 'accepted' }, requester).body,
    'Sáb, 03/10 · 10h · compra com Ana.',
  );
  assert.equal(
    requestScreenCopy({ ...when, status: 'accepted' }, owner).body,
    'Sáb, 03/10 · 10h · troca com quem pediu.',
  );
  assert.match(
    requestScreenCopy({ ...when, status: 'pending' }, { ...requester, ownerName: null }).body,
    /quem anunciou/,
  );
  for (const status of ['completed', 'canceled', 'rejected']) {
    const copy = requestScreenCopy({ ...when, status }, owner);
    assert.ok(copy.title.length > 0 && copy.body.length > 0, status);
  }
  assert.match(
    requestScreenCopy({ ...when, status: 'rejected' }, owner).body,
    /continua disponível/,
  );
});

test('confirmações antes de recusar, cancelar e concluir', () => {
  const base = { asOwner: true, ownerName: 'Ana', listingTitle: 'Dom Casmurro' };
  assert.equal(confirmCopy('reject', base).title, 'Recusar esta proposta?');
  assert.match(confirmCopy('reject', base).body, /Dom Casmurro continua disponível/);
  assert.match(confirmCopy('cancel', { ...base, asOwner: false }).body, /^Ana /);
  assert.equal(confirmCopy('complete', base).confirm, 'Concluir negociação');
});

test('o "Onde" sugere lugares públicos e reconhece o local escrito (Figma 06.04)', () => {
  assert.ok(meetingPlaceSuggestions.length >= 2, 'o quadro mostra ao menos dois atalhos');
  assert.ok(isSuggestedPlace(meetingPlaceSuggestions[0]));
  assert.ok(isSuggestedPlace(` ${meetingPlaceSuggestions[0]} `), 'espaços não mudam a escolha');
  assert.equal(isSuggestedPlace('Escola do bairro'), false);
  assert.equal(isSuggestedPlace(''), false);
});

test('contraproposta: só o dono, só na troca e só uma por vez (Figma 06.19)', () => {
  const troca = { ownerId: 'dono', modality: 'trade', counterListingId: null };
  assert.equal(canCounter('pending', 'dono', troca), true);
  assert.equal(canCounter('pending', 'quem-pediu', troca), false, 'quem pede não contrapropõe');
  assert.equal(
    canCounter('pending', 'dono', { ...troca, modality: 'sale' }),
    false,
    'venda não tem livro do outro lado',
  );
  assert.equal(canCounter('pending', 'dono', { ...troca, modality: 'donation' }), false);
  assert.equal(
    canCounter('pending', 'dono', { ...troca, counterListingId: 'l9' }),
    false,
    'a bola está com quem pediu até ele responder',
  );
  // Fora de `pending` a negociação já seguiu: não dá para contrapropor.
  for (const status of ['accepted', 'rejected', 'canceled', 'completed']) {
    assert.equal(canCounter(status, 'dono', troca), false);
  }
});

test('quem responde a contraproposta é quem pediu, e só enquanto ela existe', () => {
  const comContra = { requesterId: 'quem-pediu', counterListingId: 'l9' };
  assert.equal(canAnswerCounter('pending', 'quem-pediu', comContra), true);
  assert.equal(canAnswerCounter('pending', 'dono', comContra), false);
  assert.equal(
    canAnswerCounter('pending', 'quem-pediu', {
      requesterId: 'quem-pediu',
      counterListingId: null,
    }),
    false,
    'sem contraproposta não há o que responder',
  );
  assert.equal(canAnswerCounter('accepted', 'quem-pediu', comContra), false);
});

test('o livro que vale na troca é o contraproposto, quando há um', () => {
  assert.equal(effectiveOfferId({ offeredListingId: 'a', counterListingId: 'b' }), 'b');
  assert.equal(effectiveOfferId({ offeredListingId: 'a', counterListingId: null }), 'a');
  assert.equal(effectiveOfferId({ offeredListingId: null, counterListingId: null }), null);
});
