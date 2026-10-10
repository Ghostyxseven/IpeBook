import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemorySecurityRepository } from '../src/model/repositories/memorySecurityRepository.ts';
import {
  createSupabaseSecurityRepository,
  mapSupabaseSecurityError,
} from '../src/model/repositories/supabaseSecurityRepository.ts';
import { useModerationReportsViewModel } from '../src/viewmodel/useModerationReportsViewModel.ts';
import {
  formatReportDate,
  reportStatusLabel,
  reportTargetLabel,
  securityErrorMessage,
} from '../src/model/services/securityFormat.ts';

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

test('formatação de moderação e mensagens de erro', () => {
  assert.equal(reportStatusLabel('pending'), 'Pendente');
  assert.equal(reportStatusLabel('resolved'), 'Resolvida');

  assert.equal(
    reportTargetLabel({ reportedListingTitle: 'Dom Casmurro' }),
    'Anúncio: Dom Casmurro',
  );
  assert.equal(reportTargetLabel({ reportedUserFirstName: 'Carlos' }), 'Pessoa: Carlos');
  assert.equal(reportTargetLabel({}), 'Item denunciado');

  assert.equal(
    securityErrorMessage('unauthorized'),
    'Você não tem permissão para acessar o painel de moderação.',
  );
  assert.equal(
    securityErrorMessage('not_found'),
    'A denúncia não foi encontrada ou já foi removida.',
  );

  const formatted = formatReportDate('2026-10-09T14:30:00.000Z');
  assert.match(formatted, /09\/10\/2026/);
});

test('memória: permissão e listagem de moderação', async () => {
  const mem = createMemorySecurityRepository(
    'user-1',
    { 'user-1': 'Micael', 'user-2': 'Carlos' },
    { 'listing-1': 'Livro de Cálculo' },
    false,
  );

  assert.equal(await mem.repository.isModerator(), false);

  // Não moderador é recusado
  await assert.rejects(
    () => mem.repository.listModerationReports(),
    (err) => err.code === 'unauthorized',
  );

  // Ativa moderador e cria denúncias
  mem.setModerator(true);
  assert.equal(await mem.repository.isModerator(), true);

  await mem.repository.createReport(
    { userId: null, listingId: 'listing-1' },
    'Conteúdo ofensivo',
    'Capa imprópria',
  );

  await mem.repository.createReport(
    { userId: 'user-2', listingId: null },
    'Perfil falso',
    'Nome suspeito',
  );

  const reports = await mem.repository.listModerationReports();
  assert.equal(reports.length, 2);
  const userReport = reports.find((report) => report.reportedUserId === 'user-2');
  assert.ok(userReport);
  assert.equal(userReport.reporterFirstName, 'Micael');
  assert.equal(userReport.reportedUserFirstName, 'Carlos');
  assert.equal(userReport.status, 'pending');
  const listingReport = reports.find((report) => report.reportedListingId === 'listing-1');
  assert.ok(listingReport);
  assert.equal(listingReport.reportedListingTitle, 'Livro de Cálculo');

  const pending = await mem.repository.listModerationReports('pending');
  assert.equal(pending.length, 2);

  const resolved = await mem.repository.listModerationReports('resolved');
  assert.equal(resolved.length, 0);

  // Resolve a primeira denúncia
  await mem.repository.resolveReport(reports[0].id);

  const resolvedAfter = await mem.repository.listModerationReports('resolved');
  assert.equal(resolvedAfter.length, 1);
  assert.equal(resolvedAfter[0].id, reports[0].id);
  assert.equal(resolvedAfter[0].status, 'resolved');

  // Resolver ID inexistente falha com not_found
  await assert.rejects(
    () => mem.repository.resolveReport('inexistente'),
    (err) => err.code === 'not_found',
  );
});

test('supabase: mapeamento de erros e RPCs de moderação', async () => {
  assert.equal(mapSupabaseSecurityError({ code: '42501' }).code, 'unauthorized');
  assert.equal(mapSupabaseSecurityError({ code: 'P0002' }).code, 'not_found');

  let listCalledWith = null;
  let resolveCalledWith = null;

  const fakeClient = {
    auth: {
      getUser: async () => ({ data: { user: { id: 'mod-1' } }, error: null }),
    },
    rpc: async (fn, params) => {
      if (fn === 'is_moderator') return { data: true, error: null };
      if (fn === 'admin_list_reports') {
        listCalledWith = params;
        return {
          data: [
            {
              id: 'rep-1',
              reporter_id: 'u-1',
              reporter_first_name: 'Ana',
              reported_user_id: null,
              reported_user_first_name: null,
              reported_listing_id: 'l-1',
              reported_listing_title: 'O Cortiço',
              reason: 'Preço abusivo',
              details: 'Tentando cobrar a mais',
              status: 'pending',
              created_at: '2026-10-09T10:00:00Z',
            },
          ],
          error: null,
        };
      }
      if (fn === 'admin_resolve_report') {
        resolveCalledWith = params;
        return { data: null, error: null };
      }
      return { data: null, error: null };
    },
    from: () => ({}),
  };

  const repo = createSupabaseSecurityRepository(fakeClient);

  assert.equal(await repo.isModerator(), true);

  const list = await repo.listModerationReports('pending');
  assert.equal(list.length, 1);
  assert.equal(list[0].reportedListingTitle, 'O Cortiço');
  assert.deepEqual(listCalledWith, { p_status: 'pending' });

  await repo.resolveReport('rep-1');
  assert.deepEqual(resolveCalledWith, { p_report_id: 'rep-1' });
});

test('viewmodel: carrega, filtra, resolve e trata erros', async () => {
  const mem = createMemorySecurityRepository(
    'u-1',
    { 'u-1': 'Micael' },
    { 'l-1': 'Livro de Teste' },
    true,
  );

  const rep1 = await mem.repository.createReport(
    { userId: null, listingId: 'l-1' },
    'Golpe',
    'Cobrando frete indevido',
  );

  const screen = await renderHook(() => useModerationReportsViewModel(mem.repository));

  assert.equal(screen.vm.status, 'ready');
  assert.equal(screen.vm.counts.total, 1);
  assert.equal(screen.vm.counts.pending, 1);
  assert.equal(screen.vm.counts.resolved, 0);
  assert.equal(screen.vm.reports.length, 1);

  // Filtrar por resolvidas
  act(() => {
    screen.vm.setFilter('resolved');
  });
  assert.equal(screen.vm.reports.length, 0);
  assert.equal(screen.vm.empty, true);

  // Filtrar por pendentes
  act(() => {
    screen.vm.setFilter('pending');
  });
  assert.equal(screen.vm.reports.length, 1);

  // Abrir diálogo de confirmação
  act(() => {
    screen.vm.askResolve(screen.vm.reports[0]);
  });
  assert.equal(screen.vm.confirming?.id, rep1.id);

  // Confirmar resolução
  await act(async () => {
    await screen.vm.confirmResolve();
  });

  assert.equal(screen.vm.confirming, null);
  assert.equal(screen.vm.counts.resolved, 1);
  assert.equal(screen.vm.counts.pending, 0);
  assert.equal(screen.vm.reports.length, 0); // pois o filtro ainda é 'pending'

  // Mudar para todas
  act(() => {
    screen.vm.setFilter('all');
  });
  assert.equal(screen.vm.reports.length, 1);
  assert.equal(screen.vm.reports[0].status, 'resolved');

  await screen.unmount();
});

test('viewmodel: usuário não autorizado assume status unauthorized', async () => {
  const mem = createMemorySecurityRepository('u-1', {}, {}, false);

  const screen = await renderHook(() => useModerationReportsViewModel(mem.repository));

  assert.equal(screen.vm.status, 'unauthorized');
  assert.equal(screen.vm.loadError, 'Você não tem permissão para acessar o painel de moderação.');

  await screen.unmount();
});
