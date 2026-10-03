import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MessageError } from '../src/model/entities/MessageError.ts';
import { createMemoryBookRequestRepository } from '../src/model/repositories/memoryBookRequestRepository.ts';
import { createMemoryCatalogRepository } from '../src/model/repositories/memoryCatalogRepository.ts';
import { createMemoryMessageRepository } from '../src/model/repositories/memoryMessageRepository.ts';
import {
  createSupabaseMessageRepository,
  mapSupabaseMessageError,
} from '../src/model/repositories/supabaseMessageRepository.ts';
import {
  MESSAGE_MAX,
  conversationWhen,
  initials,
  isConversationOpen,
  messageErrorMessage,
  messageTime,
  normalizeMessage,
} from '../src/model/services/messageFormat.ts';
import { describeConversations } from '../src/viewmodel/describeConversations.ts';
import { useConversationViewModel } from '../src/viewmodel/useConversationViewModel.ts';

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
  id: 'l-1',
  title: 'Dom Casmurro',
  author: 'Machado de Assis',
  category: 'Literatura',
  modality: 'trade',
  priceCents: null,
  tradeTerms: 'Um romance',
  condition: 'bom',
  neighborhood: null,
  city: null,
  description: null,
  coverUrl: null,
  status: 'reservado',
  ownerId: 'u-ana',
  ownerFirstName: 'Ana',
  createdAt: '2026-10-01T10:00:00Z',
  ...extra,
});

const request = (extra = {}) => ({
  id: 'r-1',
  listingId: 'l-1',
  requesterId: 'u-lucas',
  publicLocation: 'Praça Central',
  meetingDate: '2026-10-04',
  meetingTime: '10:00',
  status: 'pending',
  createdAt: '2026-10-02T10:00:00Z',
  updatedAt: '2026-10-02T10:00:00Z',
  ...extra,
});

const message = (extra = {}) => ({
  id: 'm-1',
  requestId: 'r-1',
  senderId: 'u-lucas',
  body: 'Oi! O Dom Casmurro ainda está disponível?',
  createdAt: '2026-10-03T11:40:00Z',
  ...extra,
});

// ── Model ───────────────────────────────────────────────────────────────────

test('a mensagem é aparada, limitada e vazia não vai para o banco', () => {
  assert.equal(normalizeMessage('   '), null);
  assert.equal(normalizeMessage('  Oi  '), 'Oi');
  assert.equal(normalizeMessage('a'.repeat(MESSAGE_MAX + 5)).length, MESSAGE_MAX);
});

test('a conversa só aceita mensagens com a negociação em andamento', () => {
  assert.equal(isConversationOpen('pending'), true);
  assert.equal(isConversationOpen('accepted'), true);
  assert.equal(isConversationOpen('completed'), false);
  assert.equal(isConversationOpen('canceled'), false);
  assert.equal(isConversationOpen('rejected'), false);
});

test('horários seguem o Figma: 8h40, Ontem, dia da semana e data', () => {
  const at = (d, h, m) => new Date(2026, 9, d, h, m).toISOString();
  const now = new Date(2026, 9, 3, 15, 0);
  assert.equal(messageTime(at(3, 8, 40)), '8h40');
  assert.equal(conversationWhen(at(3, 9, 5), now), '9h05');
  assert.equal(conversationWhen(at(2, 20, 0), now), 'Ontem');
  assert.equal(conversationWhen(new Date(2026, 8, 27, 9).toISOString(), now), 'Dom');
  assert.equal(conversationWhen(new Date(2026, 8, 20, 9).toISOString(), now), '20/09');
  assert.equal(messageTime('não é data'), '');
});

test('iniciais do avatar e textos de erro', () => {
  assert.equal(initials('Ana Paula'), 'AP');
  assert.equal(initials('lucas'), 'L');
  assert.equal(initials(null), '?');
  assert.match(messageErrorMessage('network'), /pendente/);
  assert.match(messageErrorMessage('closed'), /encerrada/);
});

test('erros do Supabase viram códigos da conversa', () => {
  assert.equal(mapSupabaseMessageError({ code: 'PGRST205' }).code, 'not_configured');
  assert.equal(mapSupabaseMessageError({ code: '42501' }).code, 'closed');
  assert.equal(mapSupabaseMessageError({ code: '23514' }).code, 'invalid');
  assert.equal(mapSupabaseMessageError({ message: 'Failed to fetch' }).code, 'network');
  assert.equal(mapSupabaseMessageError(new MessageError('closed')).code, 'closed');
});

// ── Repositórios ────────────────────────────────────────────────────────────

function fakeClient(rows, { insertError = null } = {}) {
  const calls = [];
  const query = (table) => {
    const state = { table, filters: [] };
    const chain = {
      select: () => chain,
      eq: (column, value) => (state.filters.push([column, value]), chain),
      in: (column, values) => (state.filters.push([column, values]), chain),
      order: (column, { ascending }) => ((state.ascending = ascending), chain),
      limit: () => chain,
      insert: (payload) => ((state.insert = payload), chain),
      single: async () => {
        calls.push(state);
        if (insertError) return { data: null, error: insertError };
        return {
          data: {
            id: 'm-new',
            request_id: state.insert.request_id,
            sender_id: 'u-lucas',
            body: state.insert.body,
            created_at: '2026-10-03T12:00:00Z',
          },
          error: null,
        };
      },
      then: (resolve) => {
        calls.push(state);
        const matches = (row) =>
          state.filters.every(([column, value]) =>
            Array.isArray(value) ? value.includes(row[column]) : row[column] === value,
          );
        const sorted = rows
          .filter(matches)
          .sort((a, b) =>
            state.ascending
              ? a.created_at.localeCompare(b.created_at)
              : b.created_at.localeCompare(a.created_at),
          );
        resolve({ data: sorted, error: null });
      },
    };
    return chain;
  };
  return {
    calls,
    client: {
      from: query,
      rpc: async (name, args) => ({ data: args.owner === 'u-ana' ? 'Ana' : null, error: null }),
    },
  };
}

const rows = [
  {
    id: 'a',
    request_id: 'r-1',
    sender_id: 'u-lucas',
    body: 'Oi',
    created_at: '2026-10-03T08:40:00Z',
  },
  {
    id: 'b',
    request_id: 'r-1',
    sender_id: 'u-ana',
    body: 'Está sim',
    created_at: '2026-10-03T08:52:00Z',
  },
  {
    id: 'c',
    request_id: 'r-2',
    sender_id: 'u-ana',
    body: 'Combinado',
    created_at: '2026-10-02T09:00:00Z',
  },
];

test('repositório do Supabase lê, envia e acha a última mensagem de cada negociação', async () => {
  const { client, calls } = fakeClient(rows);
  const repository = createSupabaseMessageRepository(client);
  const listed = await repository.listByRequest('r-1');
  assert.equal(listed[0].body, 'Oi');
  assert.deepEqual(calls[0].filters, [['request_id', 'r-1']]);

  const sent = await repository.send('r-1', 'Tenho Vidas Secas');
  assert.deepEqual(calls[1].insert, { request_id: 'r-1', body: 'Tenho Vidas Secas' });
  assert.equal(sent.requestId, 'r-1');

  const latest = await repository.latestByRequest(['r-1', 'r-2']);
  assert.equal(latest['r-1'].body, 'Está sim');
  assert.equal(latest['r-2'].body, 'Combinado');
  assert.deepEqual(await repository.latestByRequest([]), {});
  assert.equal(await repository.firstName('u-ana'), 'Ana');
});

test('envio recusado pela RLS vira "closed"; sem cliente, "not_configured"', async () => {
  const { client } = fakeClient(rows, { insertError: { code: '42501' } });
  await assert.rejects(createSupabaseMessageRepository(client).send('r-1', 'Oi'), {
    code: 'closed',
  });
  await assert.rejects(createSupabaseMessageRepository(null).listByRequest('r-1'), {
    code: 'not_configured',
  });
});

// ── ViewModels ──────────────────────────────────────────────────────────────

function setup({ status = 'pending', userId = 'u-lucas', initial = [message()] } = {}) {
  const requests = createMemoryBookRequestRepository([request({ status })]);
  const catalog = createMemoryCatalogRepository([listing()]).repository;
  const messages = createMemoryMessageRepository(userId, initial, { 'u-lucas': 'Lucas' });
  return { requests, catalog, messages };
}

test('conversa carrega o livro, o nome de quem está do outro lado e as mensagens', async () => {
  const { requests, catalog, messages } = setup();
  const hook = await renderHook(() =>
    useConversationViewModel(messages.repository, requests, catalog, 'r-1', 'u-lucas'),
  );
  assert.equal(hook.vm.status, 'ready');
  assert.equal(hook.vm.listing.title, 'Dom Casmurro');
  assert.equal(hook.vm.otherName, 'Ana');
  assert.equal(hook.vm.open, true);
  assert.equal(hook.vm.messages.length, 1);
  assert.equal(hook.vm.isMine(hook.vm.messages[0]), true);
  await hook.unmount();
});

test('quem anunciou vê o nome de quem pediu', async () => {
  const { requests, catalog, messages } = setup({ userId: 'u-ana' });
  const hook = await renderHook(() =>
    useConversationViewModel(messages.repository, requests, catalog, 'r-1', 'u-ana'),
  );
  assert.equal(hook.vm.otherName, 'Lucas');
  assert.equal(hook.vm.isMine(hook.vm.messages[0]), false);
  await hook.unmount();
});

test('enviar limpa o campo; falha mantém o texto e mostra o aviso', async () => {
  const { requests, catalog, messages } = setup();
  const hook = await renderHook(() =>
    useConversationViewModel(messages.repository, requests, catalog, 'r-1', 'u-lucas'),
  );
  assert.equal(hook.vm.canSend, false);
  await act(async () => hook.vm.setDraft('  Tenho Vidas Secas  '));
  assert.equal(hook.vm.canSend, true);
  await act(async () => hook.vm.send());
  assert.equal(hook.vm.draft, '');
  assert.equal(hook.vm.messages.at(-1).body, 'Tenho Vidas Secas');

  messages.fail('network');
  await act(async () => hook.vm.setDraft('Pode ser sábado?'));
  await act(async () => hook.vm.send());
  assert.equal(hook.vm.draft, 'Pode ser sábado?');
  assert.match(hook.vm.sendError, /pendente/);
  await act(async () => hook.vm.setDraft('Pode ser sábado na praça?'));
  assert.equal(hook.vm.sendError, null);
  await hook.unmount();
});

test('negociação encerrada deixa a conversa só para leitura', async () => {
  const { requests, catalog, messages } = setup({ status: 'completed' });
  const hook = await renderHook(() =>
    useConversationViewModel(messages.repository, requests, catalog, 'r-1', 'u-lucas'),
  );
  assert.equal(hook.vm.open, false);
  messages.close('r-1');
  await act(async () => hook.vm.setDraft('Oi'));
  await act(async () => hook.vm.send());
  assert.match(hook.vm.sendError, /encerrada/);
  await hook.unmount();
});

test('negociação que não existe mostra "não encontrada"', async () => {
  const { requests, catalog, messages } = setup();
  const hook = await renderHook(() =>
    useConversationViewModel(messages.repository, requests, catalog, 'r-404', 'u-lucas'),
  );
  assert.equal(hook.vm.status, 'notFound');
  await hook.unmount();
});

test('lista de Conversas ganha nome e última mensagem, e sobrevive a falhas', async () => {
  const messages = createMemoryMessageRepository('u-ana', [message()], { 'u-lucas': 'Lucas' });
  const entries = [
    { request: request(), listing: listing(), asOwner: true },
    { request: request({ id: 'r-2', requesterId: 'u-ana' }), listing: listing(), asOwner: false },
  ];
  await describeConversations(messages.repository, entries, 'u-ana');
  assert.equal(entries[0].otherName, 'Lucas');
  assert.equal(entries[0].lastMessage.body, message().body);
  assert.equal(entries[1].otherName, 'Ana');
  assert.equal(entries[1].lastMessage, null);

  messages.fail('network');
  const failing = [{ request: request(), listing: listing(), asOwner: true }];
  await describeConversations(messages.repository, failing, 'u-ana');
  assert.equal(failing[0].lastMessage, null);
  assert.equal(failing[0].otherName, 'Lucas');
});
