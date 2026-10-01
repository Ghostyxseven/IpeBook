import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthError } from '../src/model/entities/AuthError.ts';
import { createMemoryAuthRepository } from '../src/model/repositories/memoryAuthRepository.ts';
import { useLoginViewModel } from '../src/viewmodel/useLoginViewModel.ts';
import { useSignUpViewModel } from '../src/viewmodel/useSignUpViewModel.ts';
import { useVerifyEmailViewModel } from '../src/viewmodel/useVerifyEmailViewModel.ts';
import { usePasswordRecoveryViewModel } from '../src/viewmodel/usePasswordRecoveryViewModel.ts';
import { useOnboardingViewModel } from '../src/viewmodel/useOnboardingViewModel.ts';
import { startRoute, useSession } from '../src/viewmodel/useSession.ts';

const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/** Renderiza um hook e devolve uma função que sempre lê o valor mais recente. */
async function renderHook(useHook) {
  const holder = { current: null };
  function Probe() {
    holder.current = useHook();
    return null;
  }
  const container = document.createElement('div');
  const root = createRoot(container);
  await act(async () => root.render(React.createElement(Probe)));
  return {
    get vm() {
      return holder.current;
    },
    unmount: () => act(async () => root.unmount()),
  };
}

const ana = { id: 'u1', name: 'Ana Leitora', email: 'ana@email.com', emailVerified: true };

test('entrar valida localmente, preserva o que foi digitado e traduz erros', async () => {
  const memory = createMemoryAuthRepository();
  memory.addAccount(ana, 'livros2026');
  const hook = await renderHook(() =>
    useLoginViewModel(memory.repository, { onNeedsVerification: () => {} }),
  );
  await act(async () => hook.vm.submit());
  assert.match(hook.vm.errors.email, /Informe/);
  assert.match(hook.vm.errors.password, /Informe/);
  assert.deepEqual(memory.calls, [], 'não chama o servidor com dados inválidos');

  await act(async () => hook.vm.setEmail(' ANA@email.com '));
  assert.equal(hook.vm.errors.email, undefined, 'limpa o erro ao digitar');
  await act(async () => hook.vm.setPassword('errada'));
  await act(async () => hook.vm.submit());
  assert.match(hook.vm.errors.form, /incorretos/);
  assert.equal(hook.vm.email, ' ANA@email.com ', 'mantém o e-mail digitado');

  const session = await renderHook(() => useSession(memory.repository));
  assert.equal(session.vm.status, 'signedOut');
  await act(async () => hook.vm.setPassword('livros2026'));
  await act(async () => hook.vm.submit());
  assert.equal(hook.vm.errors.form, undefined);
  assert.equal(session.vm.status, 'signedIn');
  assert.equal(session.vm.user.name, 'Ana Leitora');
  await act(async () => session.vm.signOut());
  assert.equal(session.vm.status, 'signedOut');
  await hook.unmount();
  await session.unmount();
});

test('entrar sem e-mail confirmado reenvia o código e abre a verificação', async () => {
  const memory = createMemoryAuthRepository();
  memory.addAccount({ ...ana, emailVerified: false }, 'livros2026');
  let verifying = null;
  const hook = await renderHook(() =>
    useLoginViewModel(memory.repository, { onNeedsVerification: (email) => (verifying = email) }),
  );
  await act(async () => hook.vm.setEmail('ana@email.com'));
  await act(async () => hook.vm.setPassword('livros2026'));
  await act(async () => hook.vm.submit());
  assert.equal(verifying, 'ana@email.com');
  assert.ok(memory.calls.includes('resendSignUpCode'));
  await hook.unmount();
});

test('envio duplo é ignorado enquanto a primeira tentativa está em andamento', async () => {
  let release;
  const memory = createMemoryAuthRepository();
  let signIns = 0;
  const repository = {
    ...memory.repository,
    signIn: () => {
      signIns += 1;
      return new Promise((_, reject) => (release = () => reject(new AuthError('network'))));
    },
  };
  const hook = await renderHook(() =>
    useLoginViewModel(repository, { onNeedsVerification: () => {} }),
  );
  await act(async () => hook.vm.setEmail('ana@email.com'));
  await act(async () => hook.vm.setPassword('x'));
  let first;
  await act(async () => {
    first = hook.vm.submit();
    hook.vm.submit();
  });
  assert.equal(hook.vm.submitting, true);
  assert.equal(signIns, 1);
  await act(async () => {
    release();
    await first;
  });
  assert.equal(hook.vm.submitting, false);
  assert.match(hook.vm.errors.form, /internet/);
  await hook.unmount();
});

test('criar conta valida todos os campos e segue para a verificação', async () => {
  const memory = createMemoryAuthRepository();
  let createdFor = null;
  const hook = await renderHook(() =>
    useSignUpViewModel(memory.repository, { onSignedUp: (email) => (createdFor = email) }),
  );
  await act(async () => hook.vm.setField('password', 'curta'));
  await act(async () => hook.vm.setField('confirmation', 'outra'));
  await act(async () => hook.vm.submit());
  assert.match(hook.vm.errors.name, /Informe/);
  assert.match(hook.vm.errors.email, /Informe/);
  assert.match(hook.vm.errors.password, /8 caracteres/);
  assert.match(hook.vm.errors.confirmation, /não são iguais/);
  assert.equal(createdFor, null);

  for (const [field, value] of [
    ['name', ' Ana Leitora '],
    ['email', 'Ana@Email.com'],
    ['password', 'livros2026'],
    ['confirmation', 'livros2026'],
  ])
    await act(async () => hook.vm.setField(field, value));
  await act(async () => hook.vm.submit());
  assert.equal(createdFor, 'ana@email.com');
  await hook.unmount();
});

test('verificar e-mail confirma com o código, trata código errado e controla o reenvio', async () => {
  const memory = createMemoryAuthRepository({ code: '123456' });
  await memory.repository.signUp('Ana', 'ana@email.com', 'livros2026');
  const hook = await renderHook(() => useVerifyEmailViewModel(memory.repository, 'ana@email.com'));
  assert.equal(hook.vm.resendSeconds, 60, 'o código acabou de ser enviado');
  await act(async () => hook.vm.resend());
  assert.ok(!memory.calls.includes('resendSignUpCode'), 'não reenvia durante a espera');

  await act(async () => hook.vm.setCode('111111'));
  await act(async () => hook.vm.verify());
  assert.match(hook.vm.error, /inválido ou expirado/);

  const session = await renderHook(() => useSession(memory.repository));
  await act(async () => hook.vm.setCode('123 456'));
  await act(async () => hook.vm.verify());
  assert.equal(hook.vm.error, undefined);
  assert.equal(session.vm.status, 'signedIn');
  await hook.unmount();
  await session.unmount();

  const missing = await renderHook(() => useVerifyEmailViewModel(memory.repository, ''));
  assert.equal(missing.vm.missingEmail, true);
  await missing.unmount();
});

test('recuperar senha não revela contas e valida a nova senha antes do código', async () => {
  const memory = createMemoryAuthRepository({ code: '654321' });
  memory.addAccount(ana, 'livros2026');
  const hook = await renderHook(() =>
    usePasswordRecoveryViewModel(memory.repository, 'ana@email.com'),
  );
  assert.equal(hook.vm.values.email, 'ana@email.com', 'aproveita o e-mail da tela Entrar');
  await act(async () => hook.vm.requestCode());
  assert.equal(hook.vm.step, 'reset');
  assert.match(hook.vm.notice, /Se houver uma conta/);

  await act(async () => hook.vm.setField('code', '654321'));
  await act(async () => hook.vm.setField('password', 'fraca'));
  await act(async () => hook.vm.resetPassword());
  assert.match(hook.vm.errors.password, /8 caracteres/);
  assert.match(hook.vm.errors.confirmation, /Repita/);
  assert.ok(!memory.calls.includes('resetPassword'), 'não confirma o código com senha inválida');

  await act(async () => hook.vm.setField('password', 'livros2026'));
  await act(async () => hook.vm.setField('confirmation', 'livros2026'));
  await act(async () => hook.vm.resetPassword());
  assert.match(hook.vm.errors.password, /diferente da anterior/);

  await act(async () => hook.vm.setField('code', '000000'));
  await act(async () => hook.vm.setField('password', 'novaLeitura1'));
  await act(async () => hook.vm.setField('confirmation', 'novaLeitura1'));
  await act(async () => hook.vm.resetPassword());
  assert.match(hook.vm.errors.code, /inválido ou expirado/);

  await act(async () => hook.vm.setField('code', '654321'));
  await act(async () => hook.vm.resetPassword());
  assert.equal(hook.vm.errors.code, undefined);
  assert.equal((await memory.repository.getCurrentUser()).email, 'ana@email.com');

  await act(async () => hook.vm.changeEmail());
  assert.equal(hook.vm.step, 'request');
  assert.equal(hook.vm.values.code, '');
  await hook.unmount();
});

test('onboarding avança, volta e marca como visto ao concluir ou pular', async () => {
  let seen = false;
  let finished = 0;
  const preferences = { hasSeenOnboarding: () => seen, markOnboardingSeen: () => (seen = true) };
  const hook = await renderHook(() =>
    useOnboardingViewModel(preferences, { onFinish: () => (finished += 1) }),
  );
  assert.equal(hook.vm.isFirst, true);
  await act(async () => hook.vm.next());
  await act(async () => hook.vm.back());
  assert.equal(hook.vm.index, 0);
  await act(async () => hook.vm.next());
  await act(async () => hook.vm.next());
  assert.equal(hook.vm.isLast, true);
  await act(async () => hook.vm.next());
  assert.equal(seen, true);
  assert.equal(finished, 1);
  await hook.unmount();
});

test('abertura escolhe o destino conforme sessão e onboarding', () => {
  assert.equal(startRoute('loading', false), null);
  assert.equal(startRoute('signedOut', false), '/onboarding');
  assert.equal(startRoute('signedOut', true), '/entrar');
  assert.equal(startRoute('signedIn', false), '/inicio');
});

test.after(() => dom.window.close());
