import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryAuthRepository } from '../src/model/repositories/memoryAuthRepository.ts';
import { ProfileError } from '../src/model/entities/Profile.ts';
import { useGoogleRegistrationViewModel } from '../src/viewmodel/useGoogleRegistrationViewModel.ts';
import { useStartViewModel } from '../src/viewmodel/useStartViewModel.ts';

const dom = new JSDOM('<div></div>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const user = {
  id: 'g1',
  name: 'Ana',
  email: 'ana@example.com',
  emailVerified: true,
  needsRegistration: true,
};
async function mount(hook) {
  let vm;
  function Probe() {
    vm = hook();
    return null;
  }
  const root = createRoot(document.createElement('div'));
  await act(async () => root.render(React.createElement(Probe)));
  return {
    get vm() {
      return vm;
    },
    close: () => act(async () => root.unmount()),
  };
}

test('cadastro Google carrega bairro, valida, impede envio duplo e limpa senha ao concluir', async () => {
  let release;
  const memory = createMemoryAuthRepository({
    googleAccount: user,
    beforePasswordUpdate: () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  });
  await memory.repository.signInWithGoogle();
  const hook = await mount(() => useGoogleRegistrationViewModel(memory.repository, profile, user));
  assert.equal(hook.vm.status, 'ready');
  assert.equal(hook.vm.values.neighborhood, 'Centro');
  await act(async () => hook.vm.submit());
  assert.ok(hook.vm.errors.password);
  assert.ok(hook.vm.errors.terms);
  await act(async () => {
    hook.vm.setField('password', 'SenhaFicticia123');
    hook.vm.setField('confirmation', 'SenhaFicticia123');
    hook.vm.toggleTerms();
  });
  let pending;
  await act(async () => {
    pending = hook.vm.submit();
  });
  assert.equal(hook.vm.busy, true);
  await act(async () => hook.vm.submit());
  assert.equal(memory.calls.filter((value) => value === 'completeGoogleRegistration').length, 1);
  await act(async () => {
    release();
    await pending;
  });
  assert.equal(hook.vm.values.password, '');
  assert.equal((await memory.repository.getCurrentUser()).needsRegistration, undefined);
  await hook.close();
});
const profile = {
  getProfile: async () => ({ neighborhood: 'Centro', city: 'Piripiri' }),
  setNeighborhood: async () => {},
};

test('falha de carga oferece nova tentativa; falha de gravação mantém os campos', async () => {
  let offline = true;
  const repo = {
    ...profile,
    getProfile: async () => {
      if (offline) throw new ProfileError('network');
      return profile.getProfile();
    },
    setNeighborhood: async () => {
      throw new ProfileError('network');
    },
  };
  const memory = createMemoryAuthRepository({ googleAccount: user });
  await memory.repository.signInWithGoogle();
  const hook = await mount(() => useGoogleRegistrationViewModel(memory.repository, repo, user));
  assert.equal(hook.vm.status, 'error');
  assert.match(hook.vm.loadError, /internet/);
  offline = false;
  await act(async () => hook.vm.retry());
  await act(async () => {
    hook.vm.setField('password', 'SenhaFicticia123');
    hook.vm.setField('confirmation', 'SenhaFicticia123');
    hook.vm.toggleTerms();
  });
  await act(async () => hook.vm.submit());
  assert.match(hook.vm.errors.form, /internet/);
  assert.equal(hook.vm.values.name, 'Ana');
  assert.equal((await memory.repository.getCurrentUser()).needsRegistration, true);
  await act(async () => hook.vm.signOut());
  assert.equal(await memory.repository.getCurrentUser(), null);
  await hook.close();
});

test('retomar sessão Google pendente abre conclusão mesmo com onboarding visto', async () => {
  const memory = createMemoryAuthRepository({ googleAccount: user });
  await memory.repository.signInWithGoogle();
  const preferences = { hasSeenOnboarding: () => true };
  const hook = await mount(() => useStartViewModel(memory.repository, preferences));
  assert.equal(hook.vm.destination, '/completar-cadastro');
  await act(async () =>
    memory.repository.completeGoogleRegistration('Ana', 'SenhaFicticia123', new Date()),
  );
  assert.equal(hook.vm.destination, '/inicio');
  await hook.close();
});
