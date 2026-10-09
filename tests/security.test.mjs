import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { SecurityError } from '../src/model/entities/SecurityError.ts';
import { createMemorySecurityRepository } from '../src/model/repositories/memorySecurityRepository.ts';
import {
  createSupabaseSecurityRepository,
  mapSupabaseSecurityError,
} from '../src/model/repositories/supabaseSecurityRepository.ts';
import {
  blockLabel,
  listingReportReasons,
  personName,
  securityErrorMessage,
  unblockLabel,
  userReportReasons,
} from '../src/model/services/securityFormat.ts';
import { useBlockedPeopleViewModel } from '../src/viewmodel/useBlockedPeopleViewModel.ts';
import { useBlockViewModel } from '../src/viewmodel/useBlockViewModel.ts';
import { useReportViewModel } from '../src/viewmodel/useReportViewModel.ts';

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

// ── Model ───────────────────────────────────────────────────────────────────

test('textos de bloqueio usam o primeiro nome ou caem para "pessoa"', () => {
  assert.equal(blockLabel('Ana'), 'Bloquear Ana');
  assert.equal(blockLabel('  '), 'Bloquear pessoa');
  assert.equal(unblockLabel(null), 'Desbloquear pessoa');
  assert.equal(personName(undefined), 'esta pessoa');
  assert.equal(listingReportReasons.length, 4);
  assert.equal(userReportReasons.at(-1), 'Outro motivo');
  assert.match(securityErrorMessage('network'), /internet/);
});

test('erros do Supabase viram códigos do app', () => {
  assert.equal(mapSupabaseSecurityError({ code: 'PGRST205' }).code, 'not_configured');
  assert.equal(mapSupabaseSecurityError({ code: '23514' }).code, 'invalid');
  assert.equal(mapSupabaseSecurityError({ message: 'Failed to fetch' }).code, 'network');
  assert.equal(mapSupabaseSecurityError(new Error('x')).code, 'unknown');
  const own = new SecurityError('invalid');
  assert.equal(mapSupabaseSecurityError(own), own);
});

/** Cliente falso: grava as chamadas e devolve o que cada tabela mandar. */
function fakeClient({ insert, select, del, names = {} }) {
  const calls = [];
  const chain = (result) => {
    const query = {
      select: () => query,
      single: () => query,
      eq: (column, value) => (calls.push(['eq', column, value]), query),
      order: () => query,
      then: (resolve) => resolve(result),
    };
    return query;
  };
  return {
    calls,
    from: (table) => ({
      insert: (row) => (calls.push(['insert', table, row]), chain(insert)),
      select: () => chain(select),
      delete: () => (calls.push(['delete', table]), chain(del ?? { error: null })),
    }),
    rpc: async (_fn, { owner }) =>
      names[owner] ? { data: names[owner], error: null } : { data: null, error: null },
  };
}

test('bloquear de novo quem já está bloqueado conta como sucesso', async () => {
  const row = { id: 'b1', blocker_id: 'eu', blocked_id: 'u-ana', created_at: '2026-10-03' };
  const client = fakeClient({
    insert: { data: null, error: { code: '23505' } },
    select: { data: row, error: null },
  });
  const block = await createSupabaseSecurityRepository(client).blockUser('u-ana');
  assert.equal(block.blockedId, 'u-ana');
});

test('a lista de bloqueadas traz só o primeiro nome', async () => {
  const client = fakeClient({
    select: {
      data: [
        { id: 'b1', blocker_id: 'eu', blocked_id: 'u-ana', created_at: '2026-10-03' },
        { id: 'b2', blocker_id: 'eu', blocked_id: 'u-sem', created_at: '2026-10-02' },
      ],
      error: null,
    },
    names: { 'u-ana': 'Ana' },
  });
  const people = await createSupabaseSecurityRepository(client).listBlocked();
  assert.deepEqual(
    people.map((p) => p.firstName),
    ['Ana', null],
  );
});

test('desbloquear apaga pelo id de quem foi bloqueado', async () => {
  const client = fakeClient({});
  await createSupabaseSecurityRepository(client).unblockUser('u-ana');
  assert.deepEqual(client.calls, [
    ['delete', 'user_blocks'],
    ['eq', 'blocked_id', 'u-ana'],
  ]);
});

test('sem Supabase configurado, a falha é clara', async () => {
  await assert.rejects(createSupabaseSecurityRepository(null).listBlocked(), {
    code: 'not_configured',
  });
});

// ── Denunciar ───────────────────────────────────────────────────────────────

test('denúncia de anúncio usa os motivos do anúncio e exige um motivo', async () => {
  const memory = createMemorySecurityRepository('eu');
  const screen = await renderHook(() =>
    useReportViewModel(memory.repository, { userId: 'u-ana', listingId: 'l1' }),
  );
  assert.equal(screen.vm.kind, 'listing');
  assert.equal(screen.vm.reasons[0], 'O livro não corresponde à descrição');
  await act(async () => screen.vm.submit());
  assert.match(screen.vm.error, /motivo/);
  assert.equal(memory.reports().length, 0);
  await screen.unmount();
});

test('enviar a denúncia grava motivo e detalhes aparados e mostra a confirmação', async () => {
  const memory = createMemorySecurityRepository('eu');
  const screen = await renderHook(() =>
    useReportViewModel(memory.repository, { userId: 'u-ana', listingId: 'l1' }),
  );
  await act(async () => {
    screen.vm.setReason('Golpe ou cobrança indevida');
    screen.vm.setDetails('  Pediu pagamento antes  ');
  });
  await act(async () => screen.vm.submit());
  assert.equal(screen.vm.sent, true);
  assert.equal(memory.reports()[0].details, 'Pediu pagamento antes');
  await screen.unmount();
});

test('falha de rede na denúncia vira mensagem em português', async () => {
  const memory = createMemorySecurityRepository('eu');
  memory.fail('network');
  const screen = await renderHook(() =>
    useReportViewModel(memory.repository, { userId: 'u-ana', listingId: null }),
  );
  assert.equal(screen.vm.kind, 'user');
  await act(async () => screen.vm.setReason('Perfil falso'));
  await act(async () => screen.vm.submit());
  assert.equal(screen.vm.sent, false);
  assert.match(screen.vm.error, /internet/);
  await screen.unmount();
});

// ── Bloquear e desbloquear ──────────────────────────────────────────────────

test('bloquear marca como bloqueado', async () => {
  const memory = createMemorySecurityRepository('eu');
  const screen = await renderHook(() => useBlockViewModel(memory.repository, 'u-ana'));
  await act(async () => screen.vm.submit());
  assert.equal(screen.vm.blocked, true);
  assert.equal(memory.blocks().length, 1);
  await screen.unmount();
});

test('pessoas bloqueadas: lista, pede confirmação e desbloqueia', async () => {
  const memory = createMemorySecurityRepository('eu', { 'u-ana': 'Ana Paula' });
  await memory.repository.blockUser('u-ana');
  const screen = await renderHook(() => useBlockedPeopleViewModel(memory.repository));
  await act(async () => {});
  assert.equal(screen.vm.status, 'ready');
  assert.equal(screen.vm.people[0].firstName, 'Ana Paula');
  await act(async () => screen.vm.askUnblock(screen.vm.people[0]));
  assert.equal(screen.vm.confirming.blockedId, 'u-ana');
  await act(async () => screen.vm.confirmUnblock());
  assert.equal(screen.vm.confirming, null);
  assert.equal(screen.vm.empty, true);
  assert.equal(memory.blocks().length, 0);
  await screen.unmount();
});

test('erro ao carregar bloqueadas ocupa a tela e permite tentar de novo', async () => {
  const memory = createMemorySecurityRepository('eu');
  memory.fail('network');
  const screen = await renderHook(() => useBlockedPeopleViewModel(memory.repository));
  await act(async () => {});
  assert.equal(screen.vm.status, 'error');
  memory.fail(null);
  await act(async () => screen.vm.retry());
  await act(async () => {});
  assert.equal(screen.vm.status, 'ready');
  await screen.unmount();
});
