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
import { useStartViewModel } from '../src/viewmodel/useStartViewModel.ts';
import { afterSignIn } from '../src/viewmodel/afterSignIn.ts';
import { afterSignOut } from '../src/viewmodel/afterSignOut.ts';
import { useChangePasswordViewModel } from '../src/viewmodel/useChangePasswordViewModel.ts';

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
    useSignUpViewModel(memory.repository, {
      onSignedUp: (email) => (createdFor = email),
      now: () => new Date('2026-10-03T12:00:00Z'),
    }),
  );
  await act(async () => hook.vm.setField('password', 'curta'));
  await act(async () => hook.vm.submit());
  assert.match(hook.vm.errors.terms, /aceite os termos/, 'sem o aceite a conta não é criada');
  assert.match(hook.vm.errors.name, /Informe/);
  assert.match(hook.vm.errors.email, /Informe/);
  assert.match(hook.vm.errors.password, /8 caracteres/);
  assert.equal('confirmation' in hook.vm.values, false, 'cadastro sem confirmação de senha');
  assert.equal(createdFor, null);

  for (const [field, value] of [
    ['name', ' Ana Leitora '],
    ['email', 'Ana@Email.com'],
    ['password', 'livros2026'],
  ])
    await act(async () => hook.vm.setField(field, value));
  await act(async () => hook.vm.submit());
  assert.equal(createdFor, null, 'campos certos, mas termos ainda não aceitos');

  await act(async () => hook.vm.toggleTerms());
  assert.equal(hook.vm.acceptedTerms, true);
  assert.equal(hook.vm.errors.terms, undefined);
  await act(async () => hook.vm.submit());
  assert.equal(createdFor, 'ana@email.com');
  assert.deepEqual(memory.termsAcceptedAt('ana@email.com'), new Date('2026-10-03T12:00:00Z'));
  await hook.unmount();
});

test('verificar e-mail confirma com o código, trata código errado e controla o reenvio', async () => {
  const memory = createMemoryAuthRepository({ code: '123456' });
  await memory.repository.signUp('Ana', 'ana@email.com', 'livros2026', new Date());
  const hook = await renderHook(() => useVerifyEmailViewModel(memory.repository, 'ana@email.com'));
  assert.equal(hook.vm.resendSeconds, 60, 'o código acabou de ser enviado');
  await act(async () => hook.vm.resend());
  assert.ok(!memory.calls.includes('resendSignUpCode'), 'não reenvia durante a espera');

  await act(async () => hook.vm.setCode('111111'));
  await act(async () => hook.vm.verify());
  assert.match(hook.vm.error, /inválido ou expirado/);
  assert.equal(afterSignIn.peek(), null, 'código errado não marca a tela de sucesso');

  const session = await renderHook(() => useSession(memory.repository));
  await act(async () => hook.vm.setCode('123 456'));
  await act(async () => hook.vm.verify());
  assert.equal(hook.vm.error, undefined);
  assert.equal(session.vm.status, 'signedIn');
  assert.equal(afterSignIn.peek(), 'emailConfirmed', 'a entrada mostra E-mail confirmado (01.13)');
  afterSignIn.clear();
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
  assert.ok(
    !memory.calls.includes('verifyRecoveryCode'),
    'não confirma o código com senha inválida',
  );

  await act(async () => hook.vm.setField('code', '000000'));
  await act(async () => hook.vm.setField('password', 'novaLeitura1'));
  await act(async () => hook.vm.setField('confirmation', 'novaLeitura1'));
  await act(async () => hook.vm.resetPassword());
  assert.match(hook.vm.errors.code, /inválido ou expirado/);
  assert.ok(!memory.calls.includes('updatePassword'), 'código inválido não grava a senha');
  assert.equal(afterSignIn.peek(), null);

  await act(async () => hook.vm.setField('code', '654321'));
  await act(async () => hook.vm.resetPassword());
  assert.equal(hook.vm.errors.code, undefined);
  assert.equal(memory.passwordOf('ana@email.com'), 'novaLeitura1');
  assert.equal((await memory.repository.getCurrentUser()).email, 'ana@email.com');
  assert.equal(afterSignIn.peek(), 'passwordUpdated', 'a entrada mostra Senha atualizada (01.09)');
  afterSignIn.clear();

  await act(async () => hook.vm.changeEmail());
  assert.equal(hook.vm.step, 'request');
  assert.equal(hook.vm.values.code, '');
  await hook.unmount();
});

test('recuperar senha: reenviar marca o aviso de vidro do iPhone (Figma 01.15)', async () => {
  const memory = createMemoryAuthRepository({ code: '654321' });
  memory.addAccount(ana, 'livros2026');
  const hook = await renderHook(() =>
    usePasswordRecoveryViewModel(memory.repository, 'ana@email.com'),
  );
  assert.equal(hook.vm.resent, false, 'ainda não reenviou');

  await act(async () => hook.vm.resend());
  assert.equal(hook.vm.resent, true, 'reenvio concluído marca o aviso');
  assert.match(hook.vm.notice, /Se houver uma conta/);

  await act(async () => hook.vm.changeEmail());
  assert.equal(hook.vm.resent, false, 'trocar o e-mail limpa o aviso');
  await hook.unmount();
});

/** Promessa controlada pelo teste, para segurar a gravação da senha. */
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((ok, fail) => ((resolve = ok), (reject = fail)));
  return { promise, resolve, reject };
}

test('recuperação: sessão avisada antes de gravar a senha não autentica nem tira da tela (#8)', async () => {
  let pending = deferred();
  const memory = createMemoryAuthRepository({
    code: '654321',
    beforePasswordUpdate: () => pending.promise,
  });
  memory.addAccount(ana, 'livros2026');
  const session = await renderHook(() => useSession(memory.repository));
  const hook = await renderHook(() =>
    usePasswordRecoveryViewModel(memory.repository, 'ana@email.com'),
  );
  await act(async () => hook.vm.requestCode());
  await act(async () => hook.vm.setField('code', '654321'));
  await act(async () => hook.vm.setField('password', 'novaLeitura1'));
  await act(async () => hook.vm.setField('confirmation', 'novaLeitura1'));

  // O código é confirmado e o "provedor" avisa a sessão, mas a senha ainda não foi gravada.
  let attempt;
  await act(async () => {
    attempt = hook.vm.resetPassword();
  });
  assert.ok(memory.calls.includes('verifyRecoveryCode'));
  assert.equal(hook.vm.submitting, true, 'o formulário continua carregando');
  assert.equal(session.vm.status, 'signedOut', 'ainda não conta como autenticada');
  assert.equal(await memory.repository.getCurrentUser(), null);

  // A gravação falha (rede): erro visível, sem navegação de sucesso.
  await act(async () => {
    pending.reject(new AuthError('network'));
    await attempt;
  });
  assert.equal(hook.vm.submitting, false);
  assert.match(hook.vm.errors.form, /internet/);
  assert.equal(hook.vm.step, 'reset');
  assert.equal(session.vm.status, 'signedOut');
  assert.equal(memory.passwordOf('ana@email.com'), 'livros2026');

  // Tentar de novo só grava a senha: o código já confirmado não é pedido outra vez.
  pending = deferred();
  await act(async () => {
    attempt = hook.vm.resetPassword();
  });
  assert.equal(session.vm.status, 'signedOut');
  await act(async () => {
    pending.resolve();
    await attempt;
  });
  assert.equal(memory.calls.filter((call) => call === 'verifyRecoveryCode').length, 1);
  assert.equal(memory.passwordOf('ana@email.com'), 'novaLeitura1');
  assert.equal(session.vm.status, 'signedIn', 'autentica só depois de gravar a senha');
  await hook.unmount();
  await session.unmount();
});

test('recuperação: mesma senha mantém a tela e desistir encerra a sessão de recuperação (#8)', async () => {
  const memory = createMemoryAuthRepository({ code: '654321' });
  memory.addAccount(ana, 'livros2026');
  const session = await renderHook(() => useSession(memory.repository));
  const hook = await renderHook(() =>
    usePasswordRecoveryViewModel(memory.repository, 'ana@email.com'),
  );
  await act(async () => hook.vm.requestCode());
  await act(async () => hook.vm.setField('code', '654321'));
  await act(async () => hook.vm.setField('password', 'livros2026'));
  await act(async () => hook.vm.setField('confirmation', 'livros2026'));
  await act(async () => hook.vm.resetPassword());
  assert.match(hook.vm.errors.password, /diferente da anterior/);
  assert.equal(session.vm.status, 'signedOut');

  await act(async () => hook.vm.changeEmail());
  assert.ok(memory.calls.includes('cancelPasswordRecovery'));
  assert.equal(session.vm.status, 'signedOut');
  assert.equal(await memory.repository.getCurrentUser(), null);
  await hook.unmount();
  await session.unmount();
});

test('recuperação: sair da tela com a senha pendente encerra a sessão de recuperação (#8)', async () => {
  const memory = createMemoryAuthRepository({ code: '654321' });
  memory.addAccount(ana, 'livros2026');
  const hook = await renderHook(() =>
    usePasswordRecoveryViewModel(memory.repository, 'ana@email.com'),
  );
  await act(async () => hook.vm.requestCode());
  await act(async () => hook.vm.setField('code', '654321'));
  await act(async () => hook.vm.setField('password', 'livros2026'));
  await act(async () => hook.vm.setField('confirmation', 'livros2026'));
  await act(async () => hook.vm.resetPassword());
  await hook.unmount();
  assert.ok(memory.calls.includes('cancelPasswordRecovery'));
  assert.equal(await memory.repository.getCurrentUser(), null);
});

test('sessão salva sem internet aguarda conexão em vez de ir para Entrar (#34)', async () => {
  const memory = createMemoryAuthRepository();
  memory.restoreSession(ana);
  memory.failRestore(new AuthError('network'));
  const session = await renderHook(() => useSession(memory.repository));
  assert.equal(session.vm.status, 'loading', 'não conta como saída');
  assert.match(session.vm.restoreError, /internet/);
  assert.equal(startRoute(session.vm.status, true), null, 'abertura não manda para Entrar');

  // Tentar de novo ainda sem internet mantém o aviso.
  await act(async () => session.vm.retryRestore());
  assert.equal(session.vm.status, 'loading');
  assert.match(session.vm.restoreError, /internet/);

  // A internet volta e a nova tentativa confirma a sessão.
  memory.failRestore(null);
  await act(async () => session.vm.retryRestore());
  assert.equal(session.vm.status, 'signedIn');
  assert.equal(session.vm.restoreError, null);
  await session.unmount();
});

test('o provedor confirmando a sessão depois também libera a entrada (#34)', async () => {
  const memory = createMemoryAuthRepository();
  memory.failRestore(new AuthError('network'));
  const session = await renderHook(() => useSession(memory.repository));
  assert.equal(session.vm.status, 'loading');
  await act(async () => memory.emitProviderUser(ana));
  assert.equal(session.vm.status, 'signedIn');
  assert.equal(session.vm.restoreError, null);
  await session.unmount();
});

test('falha que não é de rede na restauração leva para Entrar (#34)', async () => {
  const memory = createMemoryAuthRepository();
  memory.failRestore(new AuthError('unknown'));
  const session = await renderHook(() => useSession(memory.repository));
  assert.equal(session.vm.status, 'signedOut');
  assert.equal(session.vm.restoreError, null);
  await session.unmount();
});

test('reabrir o app com sessão salva vai direto para a Início (#34)', async () => {
  const memory = createMemoryAuthRepository();
  memory.restoreSession(ana);
  const primeira = await renderHook(() => useSession(memory.repository));
  assert.equal(primeira.vm.status, 'signedIn');
  await primeira.unmount();
  const reaberto = await renderHook(() => useSession(memory.repository));
  assert.equal(reaberto.vm.status, 'signedIn');
  assert.equal(startRoute(reaberto.vm.status, true), '/inicio');
  await reaberto.unmount();
});

test('abertura: ViewModel decide o destino pela sessão e pelo onboarding (#32)', async () => {
  let seen = false;
  const preferences = { hasSeenOnboarding: () => seen, markOnboardingSeen: () => (seen = true) };
  const memory = createMemoryAuthRepository();

  const primeira = await renderHook(() => useStartViewModel(memory.repository, preferences));
  assert.equal(primeira.vm.destination, '/onboarding', 'primeira abertura mostra o onboarding');
  await primeira.unmount();

  seen = true;
  const depois = await renderHook(() => useStartViewModel(memory.repository, preferences));
  assert.equal(depois.vm.destination, '/entrar', 'onboarding visto e sem sessão vai para Entrar');
  await depois.unmount();

  memory.restoreSession(ana);
  const logado = await renderHook(() => useStartViewModel(memory.repository, preferences));
  assert.equal(logado.vm.destination, '/inicio');
  assert.equal(logado.vm.session.user.email, 'ana@email.com');
  await logado.unmount();

  memory.failRestore(new AuthError('network'));
  const semRede = await renderHook(() => useStartViewModel(memory.repository, preferences));
  assert.equal(semRede.vm.destination, null, 'sem rede aguarda na abertura');
  assert.match(semRede.vm.session.restoreError, /internet/);
  await semRede.unmount();
});

test('boas-vindas marca a apresentação como vista ao começar ou entrar', async () => {
  let seen = false;
  const went = [];
  const preferences = { hasSeenOnboarding: () => seen, markOnboardingSeen: () => (seen = true) };
  const hook = await renderHook(() =>
    useOnboardingViewModel(preferences, {
      onStart: () => went.push('criar-conta'),
      onSignIn: () => went.push('entrar'),
    }),
  );
  assert.equal(hook.vm.content.title, 'Uma boa história');
  await act(async () => hook.vm.start());
  assert.equal(seen, true);
  seen = false;
  await act(async () => hook.vm.signIn());
  assert.equal(seen, true);
  assert.deepEqual(went, ['criar-conta', 'entrar']);
  await hook.unmount();
});

test('abertura escolhe o destino conforme sessão e onboarding', () => {
  assert.equal(startRoute('loading', false), null);
  assert.equal(startRoute('signedOut', false), '/onboarding');
  assert.equal(startRoute('signedOut', true), '/entrar');
  assert.equal(startRoute('signedIn', false), '/inicio');
});

test.after(() => dom.window.close());

test('alterar senha passa pelos estados do Figma (07.18 a 07.21)', async () => {
  const memory = createMemoryAuthRepository();
  memory.addAccount(ana, 'livros2026');
  memory.restoreSession(ana);
  const hook = await renderHook(() =>
    useChangePasswordViewModel(memory.repository, { email: ana.email }),
  );
  assert.equal(hook.vm.state, 'form');
  await act(async () => hook.vm.submit());
  assert.match(hook.vm.errors.current, /senha atual/);
  assert.equal(hook.vm.state, 'form');

  await act(async () => hook.vm.setField('current', 'livros2026'));
  await act(async () => hook.vm.setField('password', 'curta'));
  await act(async () => hook.vm.setField('confirmation', 'outra'));
  await act(async () => hook.vm.submit());
  assert.equal(hook.vm.state, 'invalidNew', '07.21');
  assert.match(hook.vm.errors.password, /8 caracteres/);
  assert.match(hook.vm.errors.confirmation, /não são iguais/);
  assert.ok(
    !memory.calls.includes('changePassword'),
    'não chama o provedor com a senha nova inválida',
  );

  await act(async () => hook.vm.setField('current', 'errada99'));
  await act(async () => hook.vm.setField('password', 'novaLeitura1'));
  await act(async () => hook.vm.setField('confirmation', 'novaLeitura1'));
  await act(async () => hook.vm.submit());
  assert.equal(hook.vm.state, 'wrongCurrent', '07.19');
  assert.match(hook.vm.errors.current, /não confere/);
  assert.equal(hook.vm.values.current, '', 'limpa a senha atual errada');

  await act(async () => hook.vm.setField('current', 'livros2026'));
  await act(async () => hook.vm.submit());
  assert.equal(hook.vm.state, 'done', '07.20');
  assert.equal(memory.passwordOf(ana.email), 'novaLeitura1');
  await hook.unmount();
});

test('alterar senha: esqueci a senha atual sai da conta e abre a recuperação com o e-mail', async () => {
  const memory = createMemoryAuthRepository();
  memory.addAccount(ana, 'livros2026');
  memory.restoreSession(ana);
  const hook = await renderHook(() =>
    useChangePasswordViewModel(memory.repository, { email: ana.email }),
  );
  await act(async () => hook.vm.recoverAccess());
  assert.equal(await memory.repository.getCurrentUser(), null);
  assert.equal(afterSignOut.recoveryEmail(), ana.email);

  const recovery = await renderHook(() =>
    usePasswordRecoveryViewModel(memory.repository, ana.email),
  );
  assert.equal(afterSignOut.recoveryEmail(), null, 'a recuperação limpa a marca ao abrir');
  assert.equal(recovery.vm.values.email, ana.email);
  await recovery.unmount();
  await hook.unmount();
});
