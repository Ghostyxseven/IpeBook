import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthError } from '../src/model/entities/AuthError.ts';
import { createSupabaseAccountRepository } from '../src/model/repositories/supabaseAccountRepository.ts';
import { documents } from '../src/model/services/institutional.ts';
import { afterSignOut } from '../src/viewmodel/afterSignOut.ts';
import { useDeleteAccountViewModel } from '../src/viewmodel/useDeleteAccountViewModel.ts';

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

function fakeClient({ files = [], rpcError = null } = {}) {
  const calls = [];
  const ok = (data = null) => Promise.resolve({ data, error: null });
  return {
    calls,
    client: {
      auth: {
        getSession: () => ok({ session: { user: { id: 'u1' } } }),
        signOut: (options) => (calls.push(['signOut', options]), ok()),
      },
      storage: {
        from: (bucket) => ({
          list: (folder) => (calls.push(['list', bucket, folder]), ok(files)),
          remove: (paths) => (calls.push(['remove', bucket, paths]), ok()),
        }),
      },
      rpc: (name) => (calls.push(['rpc', name]), Promise.resolve({ data: null, error: rpcError })),
    },
  };
}

test('Supabase: excluir conta apaga as capas, chama a função e encerra a sessão (#47)', async () => {
  const { client, calls } = fakeClient({ files: [{ name: 'a.jpg' }, { name: 'b.png' }] });
  await createSupabaseAccountRepository(client).deleteAccount();
  assert.deepEqual(calls, [
    ['list', 'listing-covers', 'u1'],
    ['remove', 'listing-covers', ['u1/a.jpg', 'u1/b.png']],
    ['rpc', 'delete_own_account'],
    ['signOut', { scope: 'local' }],
  ]);

  const semCapas = fakeClient();
  await createSupabaseAccountRepository(semCapas.client).deleteAccount();
  assert.ok(!semCapas.calls.some((call) => call[0] === 'remove'), 'sem capas, nada a remover');
});

test('Supabase: sem a função no banco ou sem cliente, a exclusão avisa e não sai da conta', async () => {
  const semFuncao = fakeClient({ rpcError: { code: 'PGRST202', message: 'not found' } });
  await assert.rejects(createSupabaseAccountRepository(semFuncao.client).deleteAccount(), {
    code: 'not_configured',
  });
  assert.ok(!semFuncao.calls.some((call) => call[0] === 'signOut'));
  await assert.rejects(createSupabaseAccountRepository(null).deleteAccount(), {
    code: 'not_configured',
  });
});

test('excluir conta: confirma, marca Conta excluída e desfaz a marca se falhar', async () => {
  let result = Promise.reject(new AuthError('network'));
  result.catch(() => {});
  const repository = { deleteAccount: () => result };
  const hook = await renderHook(() => useDeleteAccountViewModel(repository));
  assert.equal(hook.vm.confirming, false);
  await act(async () => hook.vm.askToDelete());
  assert.equal(hook.vm.confirming, true);

  await act(async () => hook.vm.confirm());
  assert.match(hook.vm.error, /internet/);
  assert.equal(afterSignOut.accountDeleted(), false, 'falhou: continua na conta');

  result = Promise.resolve();
  await act(async () => hook.vm.confirm());
  assert.equal(hook.vm.error, undefined);
  assert.equal(afterSignOut.accountDeleted(), true, 'o layout abre Conta excluída (07.17)');
  afterSignOut.clear();

  await act(async () => hook.vm.cancel());
  assert.equal(hook.vm.confirming, false);
  await hook.unmount();

  const vindoDeConfiguracoes = await renderHook(() =>
    useDeleteAccountViewModel(repository, { confirmOnOpen: true }),
  );
  assert.equal(vindoDeConfiguracoes.vm.confirming, true);
  await vindoDeConfiguracoes.unmount();
});

test('a Política de Privacidade descreve a exclusão pelo app', () => {
  const text = JSON.stringify(documents);
  assert.doesNotMatch(text, /Excluir a conta pelo aplicativo ainda não é possível/);
  assert.match(text, /Privacidade e dados/);
});
