import test from 'node:test';
import assert from 'node:assert/strict';
import { NOTIFICATION_KINDS } from '../src/model/entities/Notification.ts';
import { defaultNotificationPreferences } from '../src/model/entities/NotificationPreferences.ts';
import { createMemoryNotificationRepository } from '../src/model/repositories/memoryNotificationRepository.ts';
import {
  NOTIFICATIONS_TABLE,
  PREFERENCES_TABLE,
  createSupabaseNotificationRepository,
  mapSupabaseNotificationError,
} from '../src/model/repositories/supabaseNotificationRepository.ts';
import {
  groupNotifications,
  isUnread,
  notificationGroup,
  notificationSubtitle,
  notificationTimeLabel,
  notificationAccessibilityLabel,
  relativeTime,
  unreadBadgeText,
  unreadCountLabel,
} from '../src/model/services/notificationFormat.ts';
import { notificationErrorMessage } from '../src/model/services/notificationMessages.ts';

const notification = (n, extra = {}) => ({
  id: `n-${String(n).padStart(3, '0')}`,
  kind: 'request_received',
  title: `Aviso ${n}`,
  body: 'Alguém pediu o seu livro.',
  targetListingId: null,
  readAt: null,
  createdAt: new Date(Date.UTC(2026, 9, 1, 12) + n * 60_000).toISOString(),
  ...extra,
});

const row = (n, extra = {}) => ({
  id: `n-${n}`,
  kind: 'deal_completed',
  title: `Aviso ${n}`,
  body: null,
  target_listing_id: null,
  read_at: null,
  created_at: `2026-10-0${n}T10:00:00Z`,
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
      from: (table) => {
        calls.push(['from', table]);
        return builder;
      },
    },
  };
}

// --- Formatação ---

test('data relativa cobre agora, minutos, horas, dias e datas antigas', () => {
  const now = new Date('2026-10-01T12:00:00Z');
  assert.equal(relativeTime('2026-10-01T11:59:40Z', now), 'agora');
  assert.equal(relativeTime('2026-10-01T11:55:00Z', now), 'há 5 min');
  assert.equal(relativeTime('2026-10-01T09:00:00Z', now), 'há 3 h');
  assert.equal(relativeTime('2026-09-30T11:00:00Z', now), 'há 1 dia');
  assert.equal(relativeTime('2026-09-28T12:00:00Z', now), 'há 3 dias');
  assert.equal(relativeTime('2026-09-01T12:00:00Z', now), '1 de set.');
  assert.equal(relativeTime('2025-12-25T12:00:00Z', now), '25 de dez. de 2025');
  assert.equal(relativeTime('2026-10-01T12:05:00Z', now), 'agora', 'relógio adiantado não quebra');
  assert.equal(relativeTime('data inválida', now), '');
});

test('o rótulo acessível diz "Não lida" com palavras, não só com cor', () => {
  const now = new Date('2026-10-01T12:30:00Z');
  const unread = notification(1);
  const read = notification(1, { readAt: '2026-10-01T12:10:00Z' });
  assert.equal(isUnread(unread), true);
  assert.equal(isUnread(read), false);
  assert.match(notificationAccessibilityLabel(unread, now), /^Não lida, Aviso 1, Alguém pediu/);
  assert.doesNotMatch(notificationAccessibilityLabel(read, now), /Não lida/);
  assert.match(
    notificationAccessibilityLabel({ ...read, body: '  ' }, now),
    /^Aviso 1, há 29 min$/,
  );
});

test('contador: rótulo acessível no singular e no plural, e texto limitado a 99+', () => {
  assert.equal(unreadCountLabel(0), 'Avisos');
  assert.equal(unreadCountLabel(1), '1 aviso não lido');
  assert.equal(unreadCountLabel(3), '3 avisos não lidos');
  assert.equal(unreadBadgeText(0), '');
  assert.equal(unreadBadgeText(7), '7');
  assert.equal(unreadBadgeText(100), '99+');
});

test('mensagens de erro em português para cada código', () => {
  for (const code of ['network', 'not_configured', 'unknown']) {
    assert.match(notificationErrorMessage(code), /[a-z]/i);
  }
  assert.match(notificationErrorMessage('network'), /internet/);
});

test('preferências padrão ligam todos os tipos', () => {
  const preferences = defaultNotificationPreferences();
  assert.deepEqual(Object.keys(preferences), [...NOTIFICATION_KINDS]);
  assert.ok(Object.values(preferences).every((value) => value === true));
});

// --- Repositório em memória ---

test('memória: lista do mais novo ao mais antigo, pagina sem repetir e conta não lidas', async () => {
  const memory = createMemoryNotificationRepository(
    [1, 2, 3, 4, 5].map((n) => notification(n, n === 2 ? { readAt: '2026-10-01T13:00:00Z' } : {})),
  );
  const first = await memory.repository.list({ cursor: null, limit: 2 });
  assert.deepEqual(
    first.items.map((item) => item.id),
    ['n-005', 'n-004'],
  );
  assert.deepEqual(first.nextCursor, { createdAt: first.items[1].createdAt, id: 'n-004' });
  const second = await memory.repository.list({ cursor: first.nextCursor, limit: 2 });
  assert.deepEqual(
    second.items.map((item) => item.id),
    ['n-003', 'n-002'],
  );
  const last = await memory.repository.list({ cursor: second.nextCursor, limit: 2 });
  assert.deepEqual(
    last.items.map((item) => item.id),
    ['n-001'],
  );
  assert.equal(last.nextCursor, null);
  assert.equal(await memory.repository.unreadCount(), 4);
});

test('memória: marcar como lido, marcar todos e preferências', async () => {
  const memory = createMemoryNotificationRepository([notification(1), notification(2)]);
  await memory.repository.markRead('n-001');
  assert.equal(await memory.repository.unreadCount(), 1);
  await memory.repository.markAllRead();
  assert.equal(await memory.repository.unreadCount(), 0);
  await memory.repository.setPreference('deal_completed', false);
  const preferences = await memory.repository.getPreferences();
  assert.equal(preferences.deal_completed, false);
  assert.equal(preferences.request_received, true);
});

test('memória: fail simula erro uma vez só', async () => {
  const memory = createMemoryNotificationRepository([notification(1)]);
  memory.fail('network');
  await assert.rejects(memory.repository.unreadCount(), { code: 'network' });
  assert.equal(await memory.repository.unreadCount(), 1);
});

// --- Repositório do Supabase ---

test('sem cliente configurado, os avisos informam e não simulam dados', async () => {
  const repository = createSupabaseNotificationRepository(null);
  await assert.rejects(repository.list({ cursor: null, limit: 20 }), { code: 'not_configured' });
  await assert.rejects(repository.unreadCount(), { code: 'not_configured' });
  await assert.rejects(repository.markRead('x'), { code: 'not_configured' });
  await assert.rejects(repository.markAllRead(), { code: 'not_configured' });
  await assert.rejects(repository.getPreferences(), { code: 'not_configured' });
  await assert.rejects(repository.setPreference('deal_completed', false), {
    code: 'not_configured',
  });
});

test('supabase: lista ordena do mais novo, pede um a mais e devolve o cursor', async () => {
  const fake = fakeClient({ data: [row(3), row(2), row(1)], error: null });
  const repository = createSupabaseNotificationRepository(fake.client);
  const page = await repository.list({ cursor: null, limit: 2 });
  assert.deepEqual(fake.calls[0], ['from', NOTIFICATIONS_TABLE]);
  assert.deepEqual(fake.calls.at(-1), ['limit', 3]);
  assert.deepEqual(
    fake.calls.filter(([method]) => method === 'order'),
    [
      ['order', 'created_at', { ascending: false }],
      ['order', 'id', { ascending: false }],
    ],
  );
  assert.deepEqual(
    page.items.map((item) => item.id),
    ['n-3', 'n-2'],
  );
  assert.equal(page.items[0].body, '', 'corpo vazio vira texto vazio');
  assert.deepEqual(page.nextCursor, { createdAt: '2026-10-02T10:00:00Z', id: 'n-2' });
});

test('supabase: o cursor continua depois do último aviso, com aspas escapadas', async () => {
  const fake = fakeClient({ data: [row(1)], error: null });
  const repository = createSupabaseNotificationRepository(fake.client);
  const page = await repository.list({
    cursor: { createdAt: '2026-10-02T10:00:00Z', id: 'n-2' },
    limit: 5,
  });
  assert.deepEqual(
    fake.calls.find(([method]) => method === 'or'),
    [
      'or',
      'created_at.lt."2026-10-02T10:00:00Z",and(created_at.eq."2026-10-02T10:00:00Z",id.lt."n-2")',
    ],
  );
  assert.equal(page.nextCursor, null);
});

test('supabase: conta só as não lidas e marca pela coluna read_at', async () => {
  const count = fakeClient({ count: 4, error: null });
  assert.equal(await createSupabaseNotificationRepository(count.client).unreadCount(), 4);
  assert.deepEqual(
    count.calls.find(([method]) => method === 'is'),
    ['is', 'read_at', null],
  );

  const one = fakeClient({ error: null });
  await createSupabaseNotificationRepository(one.client).markRead('n-9');
  const update = one.calls.find(([method]) => method === 'update');
  assert.deepEqual(Object.keys(update[1]), ['read_at']);
  assert.deepEqual(
    one.calls.find(([method]) => method === 'eq'),
    ['eq', 'id', 'n-9'],
  );

  const all = fakeClient({ error: null });
  await createSupabaseNotificationRepository(all.client).markAllRead();
  assert.deepEqual(
    all.calls.find(([method]) => method === 'is'),
    ['is', 'read_at', null],
  );
  assert.equal(
    all.calls.some(([method]) => method === 'eq'),
    false,
    'a RLS limita aos avisos da pessoa',
  );
});

test('supabase: preferências completam o que falta com "ligado" e gravam um tipo por vez', async () => {
  const stored = fakeClient({ data: { deal_completed: false }, error: null });
  const preferences = await createSupabaseNotificationRepository(stored.client).getPreferences();
  assert.deepEqual(stored.calls[0], ['from', PREFERENCES_TABLE]);
  assert.equal(preferences.deal_completed, false);
  assert.equal(preferences.request_received, true);

  const empty = fakeClient({ data: null, error: null });
  assert.deepEqual(
    await createSupabaseNotificationRepository(empty.client).getPreferences(),
    defaultNotificationPreferences(),
  );

  const save = fakeClient({ error: null });
  await createSupabaseNotificationRepository(save.client).setPreference('listing_reserved', false);
  assert.deepEqual(
    save.calls.find(([method]) => method === 'upsert'),
    ['upsert', { listing_reserved: false }, { onConflict: 'user_id' }],
  );
});

test('supabase: erros do servidor viram códigos independentes do provedor', async () => {
  assert.equal(mapSupabaseNotificationError({ code: 'PGRST205' }).code, 'not_configured');
  assert.equal(mapSupabaseNotificationError({ code: '42P01' }).code, 'not_configured');
  assert.equal(
    mapSupabaseNotificationError({ message: 'TypeError: Network request' }).code,
    'network',
  );
  assert.equal(mapSupabaseNotificationError({ code: '500' }).code, 'unknown');
  const failing = fakeClient({ data: null, error: { code: 'PGRST205' } });
  await assert.rejects(
    createSupabaseNotificationRepository(failing.client).list({ cursor: null, limit: 5 }),
    {
      code: 'not_configured',
    },
  );
});

// --- Agrupamento e hora curta (Figma 35) ---

// Datas no fuso do aparelho, como o aplicativo calcula "hoje".
const local = (month, day, hour = 12, minute = 0) => new Date(2026, month - 1, day, hour, minute);
const NOW = local(10, 2, 12, 0); // sexta-feira, 02/10/2026 12:00

test('grupos: hoje, esta semana e anteriores, pelo dia no fuso do aparelho', () => {
  assert.equal(notificationGroup(local(10, 2, 0, 5).toISOString(), NOW), 'today');
  assert.equal(notificationGroup(local(10, 1, 23, 59).toISOString(), NOW), 'week');
  assert.equal(notificationGroup(local(9, 26, 8).toISOString(), NOW), 'week', '6 dias atrás');
  assert.equal(notificationGroup(local(9, 25, 8).toISOString(), NOW), 'earlier', '7 dias atrás');
  assert.equal(notificationGroup(local(10, 3, 8).toISOString(), NOW), 'today', 'relógio adiantado');
  assert.equal(notificationGroup('data inválida', NOW), 'earlier');
});

test('hora curta: "agora", minutos e "10h" hoje; dia da semana depois; data nos antigos', () => {
  assert.equal(notificationTimeLabel(new Date(2026, 9, 2, 11, 59, 40).toISOString(), NOW), 'agora');
  assert.equal(notificationTimeLabel(local(10, 2, 11, 25).toISOString(), NOW), '35 min');
  assert.equal(notificationTimeLabel(local(10, 2, 2, 0).toISOString(), NOW), '10h');
  assert.equal(notificationTimeLabel(local(9, 28, 9).toISOString(), NOW), 'Seg');
  assert.equal(notificationTimeLabel(local(9, 27, 9).toISOString(), NOW), 'Dom');
  assert.equal(notificationTimeLabel(local(9, 26, 9).toISOString(), NOW), 'Sáb');
  assert.equal(notificationTimeLabel(local(9, 1, 9).toISOString(), NOW), '1 set.');
  assert.equal(notificationTimeLabel(new Date(2025, 11, 25, 9).toISOString(), NOW), '25 dez. 2025');
  assert.equal(notificationTimeLabel('data inválida', NOW), '');
});

test('subtítulo junta o texto e a hora com ponto médio; sem texto, só a hora', () => {
  const at = local(10, 2, 2, 0).toISOString();
  assert.equal(
    notificationSubtitle({ body: 'Vidas Secas por Dom Casmurro', createdAt: at }, NOW),
    'Vidas Secas por Dom Casmurro · 10h',
  );
  assert.equal(notificationSubtitle({ body: '  ', createdAt: at }, NOW), '10h');
});

test('seções: mantêm a ordem, juntam avisos do mesmo grupo e não criam grupos vazios', () => {
  const at = (month, day, hour) => local(month, day, hour).toISOString();
  const items = [
    notification(1, { id: 'a', createdAt: at(10, 2, 9) }),
    notification(2, { id: 'b', createdAt: at(10, 2, 3) }),
    notification(3, { id: 'c', createdAt: at(9, 28, 9) }),
    notification(4, { id: 'd', createdAt: at(8, 1, 9) }),
  ];
  const sections = groupNotifications(items, NOW);
  assert.deepEqual(
    sections.map((section) => [section.title, section.data.map((item) => item.id)]),
    [
      ['Hoje', ['a', 'b']],
      ['Esta semana', ['c']],
      ['Anteriores', ['d']],
    ],
  );
  assert.deepEqual(groupNotifications([], NOW), []);
  assert.deepEqual(
    groupNotifications([items[2]], NOW).map((section) => section.key),
    ['week'],
    'sem avisos de hoje, não há seção "Hoje"',
  );
});
