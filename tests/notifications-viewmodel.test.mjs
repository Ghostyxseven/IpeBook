import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryNotificationRepository } from '../src/model/repositories/memoryNotificationRepository.ts';
import {
  NOTIFICATIONS_PAGE_SIZE,
  useNotificationsViewModel,
} from '../src/viewmodel/useNotificationsViewModel.ts';
import { useSettingsViewModel } from '../src/viewmodel/useSettingsViewModel.ts';
import { useUnreadCountViewModel } from '../src/viewmodel/useUnreadCountViewModel.ts';

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

const notification = (n, extra = {}) => ({
  id: `n-${String(n).padStart(3, '0')}`,
  kind: 'request_received',
  title: `Aviso ${n}`,
  body: '',
  targetListingId: `listing-${n}`,
  readAt: null,
  createdAt: new Date(Date.UTC(2026, 9, 1) + n * 60_000).toISOString(),
  ...extra,
});

const many = (count) => Array.from({ length: count }, (_, n) => notification(n));

// --- Lista de avisos ---

test('lista: carrega a primeira página, pagina sem repetir e para no fim', async () => {
  const memory = createMemoryNotificationRepository(many(NOTIFICATIONS_PAGE_SIZE + 5));
  const hook = await renderHook(() => useNotificationsViewModel(memory.repository));
  assert.equal(hook.vm.status, 'ready');
  assert.equal(hook.vm.items.length, NOTIFICATIONS_PAGE_SIZE);
  assert.equal(
    hook.vm.items[0].title,
    `Aviso ${NOTIFICATIONS_PAGE_SIZE + 4}`,
    'mais novo primeiro',
  );
  assert.equal(hook.vm.hasMore, true);

  await act(async () => {
    void hook.vm.loadMore();
    void hook.vm.loadMore();
  });
  assert.equal(hook.vm.items.length, NOTIFICATIONS_PAGE_SIZE + 5);
  assert.equal(new Set(hook.vm.items.map((item) => item.id)).size, NOTIFICATIONS_PAGE_SIZE + 5);
  assert.equal(hook.vm.hasMore, false);
  assert.equal(
    memory.calls.filter((call) => call.startsWith('list:')).length,
    2,
    'sem chamada dupla',
  );
  await hook.unmount();
});

test('lista: vazia mostra estado pronto sem avisos', async () => {
  const memory = createMemoryNotificationRepository([]);
  const hook = await renderHook(() => useNotificationsViewModel(memory.repository));
  assert.equal(hook.vm.status, 'ready');
  assert.deepEqual(hook.vm.items, []);
  assert.equal(hook.vm.unreadInList, 0);
  await hook.unmount();
});

test('lista: erro na primeira carga mostra a mensagem e "tentar de novo" recupera', async () => {
  const memory = createMemoryNotificationRepository(many(2));
  memory.fail('network');
  const hook = await renderHook(() => useNotificationsViewModel(memory.repository));
  assert.equal(hook.vm.status, 'error');
  assert.match(hook.vm.error, /internet/);
  await act(async () => hook.vm.retry());
  assert.equal(hook.vm.status, 'ready');
  assert.equal(hook.vm.items.length, 2);
  await hook.unmount();
});

test('lista: atualizar com falha mantém os avisos já carregados', async () => {
  const memory = createMemoryNotificationRepository(many(2));
  const hook = await renderHook(() => useNotificationsViewModel(memory.repository));
  memory.fail('unknown');
  await act(async () => hook.vm.refresh());
  assert.equal(hook.vm.status, 'ready');
  assert.equal(hook.vm.items.length, 2);
  assert.ok(hook.vm.error);
  await hook.unmount();
});

test('lista: falha ao carregar mais guarda o erro e não perde o que já havia', async () => {
  const memory = createMemoryNotificationRepository(many(NOTIFICATIONS_PAGE_SIZE + 1));
  const hook = await renderHook(() => useNotificationsViewModel(memory.repository));
  memory.fail('network');
  await act(async () => hook.vm.loadMore());
  assert.ok(hook.vm.loadMoreError);
  assert.equal(hook.vm.items.length, NOTIFICATIONS_PAGE_SIZE);
  await act(async () => hook.vm.loadMore());
  assert.equal(hook.vm.items.length, NOTIFICATIONS_PAGE_SIZE + 1);
  assert.equal(hook.vm.loadMoreError, undefined);
  await hook.unmount();
});

test('marcar como lido é imediato na tela, confirmado no servidor e devolve o destino', async () => {
  const memory = createMemoryNotificationRepository(many(3));
  const hook = await renderHook(() => useNotificationsViewModel(memory.repository));
  assert.equal(hook.vm.unreadInList, 3);
  let target;
  await act(async () => {
    target = await hook.vm.markRead('n-001');
  });
  assert.equal(target, 'listing-1');
  assert.equal(hook.vm.unreadInList, 2);
  assert.ok(hook.vm.items.find((item) => item.id === 'n-001').readAt);
  assert.equal(await memory.repository.unreadCount(), 2, 'servidor confirmou');
  assert.equal(memory.calls.filter((call) => call.startsWith('markRead')).length, 1);

  await act(async () => {
    await hook.vm.markRead('n-001');
  });
  assert.equal(
    memory.calls.filter((call) => call.startsWith('markRead')).length,
    1,
    'aviso já lido não chama o servidor de novo',
  );
  await hook.unmount();
});

test('marcar como lido volta ao estado anterior quando o servidor falha', async () => {
  const memory = createMemoryNotificationRepository(many(2));
  const hook = await renderHook(() => useNotificationsViewModel(memory.repository));
  memory.fail('network');
  let target;
  await act(async () => {
    target = await hook.vm.markRead('n-001');
  });
  assert.equal(target, 'listing-1', 'ainda deixa abrir o anúncio');
  assert.equal(hook.vm.items.find((item) => item.id === 'n-001').readAt, null);
  assert.equal(hook.vm.unreadInList, 2);
  assert.match(hook.vm.actionError, /internet/);
  await hook.unmount();
});

test('marcar todas como lidas funciona e reverte só o que ela marcou se falhar', async () => {
  const memory = createMemoryNotificationRepository([
    notification(1),
    notification(2, { readAt: '2026-10-01T10:00:00Z' }),
    notification(3),
  ]);
  const hook = await renderHook(() => useNotificationsViewModel(memory.repository));
  memory.fail('unknown');
  await act(async () => hook.vm.markAllRead());
  assert.equal(hook.vm.unreadInList, 2, 'voltou ao estado anterior');
  assert.equal(
    hook.vm.items.find((item) => item.id === 'n-002').readAt,
    '2026-10-01T10:00:00Z',
    'o aviso que já estava lido continua com a data original',
  );
  assert.ok(hook.vm.actionError);

  await act(async () => hook.vm.markAllRead());
  assert.equal(hook.vm.unreadInList, 0);
  assert.equal(hook.vm.actionError, undefined);
  assert.equal(await memory.repository.unreadCount(), 0);
  await hook.unmount();
});

test('marcar todas ignora toque duplo enquanto a primeira chamada não termina', async () => {
  const memory = createMemoryNotificationRepository(many(2));
  const hook = await renderHook(() => useNotificationsViewModel(memory.repository));
  let release;
  memory.hold(new Promise((resolve) => (release = resolve)));
  await act(async () => {
    void hook.vm.markAllRead();
    void hook.vm.markAllRead();
  });
  assert.equal(hook.vm.markingAll, true);
  release();
  memory.hold(null);
  await act(async () => {});
  assert.equal(hook.vm.markingAll, false);
  assert.equal(memory.calls.filter((call) => call === 'markAllRead').length, 1);
  await hook.unmount();
});

// --- Contador ---

test('contador: mostra as não lidas, atualiza ao voltar ao primeiro plano e mantém o valor se falhar', async () => {
  const memory = createMemoryNotificationRepository(many(3));
  let foreground = () => {};
  let unsubscribed = 0;
  const onForeground = (callback) => {
    foreground = callback;
    return () => {
      unsubscribed += 1;
    };
  };
  const hook = await renderHook(() => useUnreadCountViewModel(memory.repository, { onForeground }));
  assert.equal(hook.vm.count, 3);
  assert.equal(hook.vm.badgeText, '3');
  assert.equal(hook.vm.accessibilityLabel, '3 avisos não lidos');

  await memory.repository.markAllRead();
  await act(async () => foreground());
  assert.equal(hook.vm.count, 0);
  assert.equal(hook.vm.badgeText, '');
  assert.equal(hook.vm.accessibilityLabel, 'Avisos');

  memory.add(notification(9));
  await act(async () => hook.vm.refresh());
  assert.equal(hook.vm.count, 1);
  memory.fail('network');
  await act(async () => hook.vm.refresh());
  assert.equal(hook.vm.count, 1, 'falha mantém o último valor');

  await hook.unmount();
  assert.equal(unsubscribed, 1);
});

test('contador: uma resposta atrasada não sobrescreve a mais recente', async () => {
  const memory = createMemoryNotificationRepository(many(2));
  const hook = await renderHook(() => useUnreadCountViewModel(memory.repository));
  let release;
  memory.hold(new Promise((resolve) => (release = resolve)));
  await act(async () => {
    void hook.vm.refresh();
  });
  memory.hold(null);
  memory.add(notification(8), notification(9));
  await act(async () => hook.vm.refresh());
  assert.equal(hook.vm.count, 4);
  release();
  await act(async () => {});
  assert.equal(hook.vm.count, 4);
  await hook.unmount();
});

// --- Configurações ---

const session = (extra = {}) => ({
  user: { name: 'Ana Souza', email: 'ana@example.com' },
  signingOut: false,
  error: null,
  signOut: async () => {},
  ...extra,
});

test('configurações: carrega preferências, versão, nome e links legais', async () => {
  const memory = createMemoryNotificationRepository([]);
  await memory.repository.setPreference('deal_completed', false);
  const hook = await renderHook(() =>
    useSettingsViewModel(memory.repository, session(), {
      appVersion: '1.0.0',
      siteUrl: 'https://ipebook.example/',
    }),
  );
  assert.equal(hook.vm.status, 'ready');
  assert.equal(hook.vm.preferences.deal_completed, false);
  assert.equal(hook.vm.preferences.request_received, true);
  assert.equal(hook.vm.appVersion, '1.0.0');
  assert.equal(hook.vm.accountName, 'Ana');
  assert.equal(hook.vm.accountEmail, 'ana@example.com');
  assert.deepEqual(
    hook.vm.legalLinks.map((link) => link.url),
    ['https://ipebook.example/privacidade', 'https://ipebook.example/termos'],
  );
  await hook.unmount();
});

test('configurações: sem endereço do site, não há links legais para abrir', async () => {
  const memory = createMemoryNotificationRepository([]);
  const hook = await renderHook(() =>
    useSettingsViewModel(memory.repository, session(), { appVersion: '1.0.0', siteUrl: '  ' }),
  );
  assert.deepEqual(hook.vm.legalLinks, []);
  await hook.unmount();
});

test('configurações: desligar um tipo vale na hora e é gravado no servidor', async () => {
  const memory = createMemoryNotificationRepository([]);
  const hook = await renderHook(() =>
    useSettingsViewModel(memory.repository, session(), { appVersion: '1.0.0' }),
  );
  await act(async () => hook.vm.setPreference('request_received', false));
  assert.equal(hook.vm.preferences.request_received, false);
  assert.equal(memory.preferences().request_received, false);
  assert.equal(hook.vm.saveError, undefined);
  await hook.unmount();
});

test('configurações: se o servidor falhar, a chave volta e a mensagem aparece', async () => {
  const memory = createMemoryNotificationRepository([]);
  const hook = await renderHook(() =>
    useSettingsViewModel(memory.repository, session(), { appVersion: '1.0.0' }),
  );
  memory.fail('network');
  await act(async () => hook.vm.setPreference('request_received', false));
  assert.equal(hook.vm.preferences.request_received, true);
  assert.match(hook.vm.saveError, /internet/);
  await act(async () => hook.vm.setPreference('request_received', false));
  assert.equal(hook.vm.saveError, undefined, 'a próxima tentativa limpa o erro');
  await hook.unmount();
});

test('configurações: erro ao carregar oferece tentar de novo; desligar não afeta os outros tipos', async () => {
  const memory = createMemoryNotificationRepository([]);
  memory.fail('not_configured');
  const hook = await renderHook(() =>
    useSettingsViewModel(memory.repository, session(), { appVersion: '1.0.0' }),
  );
  assert.equal(hook.vm.status, 'error');
  assert.match(hook.vm.error, /configurados/);
  await act(async () => hook.vm.retry());
  assert.equal(hook.vm.status, 'ready');
  await act(async () => hook.vm.setPreference('deal_completed', false));
  const others = hook.vm.kinds.filter((kind) => kind !== 'deal_completed');
  assert.ok(others.every((kind) => hook.vm.preferences[kind] === true));
  await hook.unmount();
});

test('configurações: Sair e o estado de saída vêm da sessão', async () => {
  const memory = createMemoryNotificationRepository([]);
  let signedOut = 0;
  const hook = await renderHook(() =>
    useSettingsViewModel(
      memory.repository,
      session({ signingOut: true, error: 'Falha ao sair', signOut: () => (signedOut += 1) }),
      { appVersion: '1.0.0' },
    ),
  );
  assert.equal(hook.vm.signingOut, true);
  assert.equal(hook.vm.signOutError, 'Falha ao sair');
  hook.vm.signOut();
  assert.equal(signedOut, 1);
  await hook.unmount();
});
