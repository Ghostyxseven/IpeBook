import test from 'node:test';
import assert from 'node:assert/strict';
import { AuthError } from '../src/model/entities/AuthError.ts';
import { authErrorMessage } from '../src/model/services/authMessages.ts';
import {
  normalizeCode,
  normalizeEmail,
  validateCode,
  validateEmail,
  validateLoginPassword,
  validateName,
  validateNewPassword,
  validatePasswordConfirmation,
} from '../src/model/services/authValidation.ts';
import {
  createSupabaseAuthRepository,
  mapSupabaseError,
} from '../src/model/repositories/supabaseAuthRepository.ts';
import { createPreferencesRepository } from '../src/model/repositories/preferencesRepository.ts';
import { welcome } from '../src/model/services/onboarding.ts';

test('validações aceitam dados corretos e explicam o que corrigir', () => {
  assert.equal(validateEmail(' Leitora@Email.com '), undefined);
  assert.equal(normalizeEmail(' Leitora@Email.com '), 'leitora@email.com');
  assert.match(validateEmail(''), /Informe/);
  assert.match(validateEmail('leitora@email'), /Exemplo/);
  assert.equal(validateName('Ana'), undefined);
  assert.match(validateName(' '), /Informe/);
  assert.match(validateName('A'), /2 letras/);
  assert.equal(validateLoginPassword('x'), undefined);
  assert.match(validateLoginPassword(''), /Informe/);
  assert.equal(validateNewPassword('livros2026'), undefined);
  assert.match(validateNewPassword('curta1'), /8 caracteres/);
  assert.match(validateNewPassword('somenteletras'), /letras e números/);
  assert.match(validateNewPassword('12345678'), /letras e números/);
  assert.equal(validatePasswordConfirmation('livros2026', 'livros2026'), undefined);
  assert.match(validatePasswordConfirmation('livros2026', 'livros2025'), /não são iguais/);
  assert.equal(validateCode('123 456'), undefined);
  assert.equal(normalizeCode(' 123 456 '), '123456');
  assert.match(validateCode('12a456'), /apenas números/);
  assert.match(validateCode(''), /Digite/);
});

test('todo código de erro tem mensagem em português sem expor o código técnico', () => {
  for (const code of [
    'invalid_credentials',
    'email_not_confirmed',
    'email_in_use',
    'invalid_email',
    'weak_password',
    'invalid_code',
    'same_password',
    'rate_limited',
    'network',
    'not_configured',
    'unknown',
  ]) {
    const message = authErrorMessage(code);
    assert.ok(message.length > 10, code);
    assert.doesNotMatch(message, /_/);
  }
});

test('erros do Supabase viram códigos do domínio', () => {
  const map = (error) => mapSupabaseError(error).code;
  assert.equal(map({ code: 'invalid_credentials', status: 400 }), 'invalid_credentials');
  assert.equal(map({ code: 'email_not_confirmed', status: 400 }), 'email_not_confirmed');
  assert.equal(map({ code: 'user_already_exists', status: 422 }), 'email_in_use');
  assert.equal(map({ code: 'weak_password', status: 422 }), 'weak_password');
  assert.equal(map({ code: 'otp_expired', status: 403 }), 'invalid_code');
  assert.equal(map({ code: 'over_email_send_rate_limit', status: 429 }), 'rate_limited');
  assert.equal(map({ status: 429 }), 'rate_limited');
  assert.equal(map({ name: 'AuthRetryableFetchError', status: 0 }), 'network');
  assert.equal(map({ code: 'algo_novo', status: 500 }), 'unknown');
  assert.equal(map(new TypeError('Failed to fetch')), 'unknown');
  assert.equal(map(new AuthError('network')), 'network');
});

function fakeClient(overrides = {}) {
  const calls = [];
  const supabaseUser = {
    id: 'u1',
    email: 'ana@email.com',
    email_confirmed_at: '2026-09-30T12:00:00Z',
    user_metadata: { name: 'Ana Leitora' },
  };
  const ok = (data = {}) => Promise.resolve({ data, error: null });
  const auth = {
    getSession: () => ok({ session: { user: supabaseUser } }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => calls.push('unsubscribe') } },
    }),
    signInWithPassword: (params) => (calls.push(['signIn', params]), ok({ user: supabaseUser })),
    signUp: (params) => (calls.push(['signUp', params]), ok({ user: supabaseUser, session: null })),
    verifyOtp: (params) => (calls.push(['verifyOtp', params]), ok({ user: supabaseUser })),
    resend: (params) => (calls.push(['resend', params]), ok()),
    resetPasswordForEmail: (email) => (calls.push(['reset', email]), ok()),
    updateUser: (params) => (calls.push(['updateUser', params]), ok({ user: supabaseUser })),
    signOut: () => (calls.push('signOut'), ok()),
    ...overrides,
  };
  return { client: { auth }, calls };
}

test('repositório Supabase envia os parâmetros certos e converte o usuário', async () => {
  const { client, calls } = fakeClient();
  const repository = createSupabaseAuthRepository(client);
  assert.deepEqual(await repository.getCurrentUser(), {
    id: 'u1',
    email: 'ana@email.com',
    name: 'Ana Leitora',
    emailVerified: true,
  });
  await repository.signUp(
    'Ana Leitora',
    'ana@email.com',
    'livros2026',
    new Date('2026-10-03T12:00:00Z'),
  );
  await repository.verifySignUp('ana@email.com', '123456');
  await repository.resendSignUpCode('ana@email.com');
  await repository.resetPassword('ana@email.com', '654321', 'novaSenha1');
  assert.deepEqual(calls, [
    [
      'signUp',
      {
        email: 'ana@email.com',
        password: 'livros2026',
        options: { data: { name: 'Ana Leitora', terms_accepted_at: '2026-10-03T12:00:00.000Z' } },
      },
    ],
    ['verifyOtp', { email: 'ana@email.com', token: '123456', type: 'signup' }],
    ['resend', { type: 'signup', email: 'ana@email.com' }],
    ['verifyOtp', { email: 'ana@email.com', token: '654321', type: 'recovery' }],
    ['updateUser', { password: 'novaSenha1' }],
  ]);
});

test('repositório Supabase rejeita com AuthError e não grava senha se o código falhar', async () => {
  const { client, calls } = fakeClient({
    signInWithPassword: () =>
      Promise.resolve({
        data: { user: null },
        error: { code: 'invalid_credentials', status: 400 },
      }),
    verifyOtp: () =>
      Promise.resolve({ data: { user: null }, error: { code: 'otp_expired', status: 403 } }),
    resetPasswordForEmail: () =>
      Promise.reject(Object.assign(new Error('x'), { name: 'AuthRetryableFetchError' })),
  });
  const repository = createSupabaseAuthRepository(client);
  await assert.rejects(repository.signIn('a@b.com', 'x'), { code: 'invalid_credentials' });
  await assert.rejects(repository.resetPassword('a@b.com', '000000', 'novaSenha1'), {
    code: 'invalid_code',
  });
  assert.ok(!calls.some((call) => call[0] === 'updateUser'));
  await assert.rejects(repository.requestPasswordReset('a@b.com'), { code: 'network' });
});

test('sem configuração do Supabase o app não simula autenticação', async () => {
  const repository = createSupabaseAuthRepository(null);
  assert.equal(await repository.getCurrentUser(), null);
  assert.equal(typeof repository.onUserChange(() => {}), 'function');
  await assert.rejects(repository.signIn('a@b.com', 'x'), { code: 'not_configured' });
  await assert.rejects(repository.signUp('Ana', 'a@b.com', 'livros2026', new Date()), {
    code: 'not_configured',
  });
});

test('preferências guardam o onboarding e toleram armazenamento indisponível', () => {
  const data = new Map();
  const storage = { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) };
  const preferences = createPreferencesRepository(storage);
  assert.equal(preferences.hasSeenOnboarding(), false);
  preferences.markOnboardingSeen();
  assert.equal(preferences.hasSeenOnboarding(), true);
  const broken = createPreferencesRepository({
    getItem: () => {
      throw new Error('bloqueado');
    },
    setItem: () => {
      throw new Error('bloqueado');
    },
  });
  assert.equal(broken.hasSeenOnboarding(), false);
  assert.doesNotThrow(() => broken.markOnboardingSeen());
  assert.equal(createPreferencesRepository(null).hasSeenOnboarding(), false);
});

test('boas-vindas apresenta as três modalidades sem prometer recursos inexistentes', () => {
  assert.deepEqual([...welcome.modalities], ['Venda', 'Troca', 'Doação']);
  const text = JSON.stringify(welcome);
  assert.doesNotMatch(text, /garantid|100%|verificad/i);
});

test('Supabase: evento de sessão da recuperação não autentica antes de gravar a senha (#8)', async () => {
  const supabaseUser = {
    id: 'u1',
    email: 'ana@email.com',
    email_confirmed_at: '2026-09-30T12:00:00Z',
    user_metadata: { name: 'Ana' },
  };
  let providerCallback;
  let updateResult = {
    data: { user: null },
    error: { name: 'AuthRetryableFetchError', status: 0 },
  };
  const calls = [];
  const client = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: { user: supabaseUser } }, error: null }),
      onAuthStateChange: (callback) => {
        providerCallback = callback;
        return { data: { subscription: { unsubscribe: () => calls.push('unsubscribe') } } };
      },
      verifyOtp: async () => {
        calls.push('verifyOtp');
        // Como no Supabase: a sessão de recuperação é avisada antes de verifyOtp resolver.
        providerCallback('PASSWORD_RECOVERY', { user: supabaseUser });
        return { data: { user: supabaseUser }, error: null };
      },
      updateUser: async () => {
        calls.push('updateUser');
        return updateResult;
      },
      signOut: async () => {
        calls.push('signOut');
        providerCallback('SIGNED_OUT', null);
        return { error: null };
      },
    },
  };
  const repository = createSupabaseAuthRepository(client);
  const seen = [];
  const unsubscribe = repository.onUserChange((user) => seen.push(user?.email ?? null));

  await assert.rejects(repository.resetPassword('ana@email.com', '654321', 'novaSenha1'), {
    code: 'network',
  });
  assert.deepEqual(seen, [], 'nenhum aviso de login enquanto a senha não foi gravada');
  assert.equal(await repository.getCurrentUser(), null);

  updateResult = { data: { user: supabaseUser }, error: null };
  await repository.resetPassword('ana@email.com', '654321', 'novaSenha1');
  assert.deepEqual(
    calls.filter((call) => call === 'verifyOtp').length,
    1,
    'não pede o código de novo',
  );
  assert.deepEqual(seen, ['ana@email.com'], 'avisa o login só depois de gravar');
  assert.equal((await repository.getCurrentUser()).email, 'ana@email.com');

  // Desistir de uma recuperação pendente encerra a sessão sem avisar login.
  updateResult = { data: { user: null }, error: { code: 'same_password', status: 422 } };
  providerCallback('SIGNED_OUT', null);
  seen.length = 0;
  await assert.rejects(repository.resetPassword('bia@email.com', '111111', 'outraSenha1'), {
    code: 'same_password',
  });
  await repository.cancelPasswordRecovery();
  assert.ok(calls.includes('signOut'));
  assert.deepEqual(seen, [null]);
  unsubscribe();
  assert.ok(calls.includes('unsubscribe'));
});

test('Supabase: código de recuperação inválido não grava a senha nem prende os avisos (#8)', async () => {
  let providerCallback;
  const calls = [];
  const client = {
    auth: {
      onAuthStateChange: (callback) => {
        providerCallback = callback;
        return { data: { subscription: { unsubscribe() {} } } };
      },
      verifyOtp: async () => ({
        data: { user: null },
        error: { code: 'otp_expired', status: 403 },
      }),
      updateUser: async () => (calls.push('updateUser'), { data: {}, error: null }),
    },
  };
  const repository = createSupabaseAuthRepository(client);
  const seen = [];
  repository.onUserChange((user) => seen.push(user?.email ?? null));
  await assert.rejects(repository.resetPassword('ana@email.com', '000000', 'novaSenha1'), {
    code: 'invalid_code',
  });
  assert.deepEqual(calls, []);
  providerCallback('SIGNED_IN', { user: { id: 'u2', email: 'bia@email.com', user_metadata: {} } });
  assert.deepEqual(seen, ['bia@email.com'], 'o portão foi reaberto');
});

/** Cliente supabase-js real com armazenamento em memória, como um app reaberto (#34). */
async function reopenedApp({ expiresIn, fetchImpl }) {
  const { createClient } = await import('@supabase/supabase-js');
  const store = new Map();
  const storage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  };
  const now = Math.floor(Date.now() / 1000);
  store.set(
    'sb-projetoteste-auth-token',
    JSON.stringify({
      access_token: 'a.b.c',
      refresh_token: 'r',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: now + expiresIn,
      user: {
        id: 'u1',
        aud: 'authenticated',
        email: 'ana@email.com',
        email_confirmed_at: '2026-09-30T12:00:00Z',
        user_metadata: { name: 'Ana' },
        app_metadata: {},
        created_at: '2026-09-30T12:00:00Z',
      },
    }),
  );
  const client = createClient('https://projetoteste.supabase.co', 'sb_publishable_teste', {
    auth: { storage, autoRefreshToken: false, persistSession: true, detectSessionInUrl: false },
    global: { fetch: fetchImpl ?? (async () => Promise.reject(new TypeError('sem rede'))) },
  });
  return { repository: createSupabaseAuthRepository(client), store };
}

test('reabrir o app restaura a sessão salva, inclusive na troca de telas (#34)', async () => {
  const { repository } = await reopenedApp({ expiresIn: 3600 });
  assert.equal((await repository.getCurrentUser()).email, 'ana@email.com');
  // Abertura se inscreve, sai, e a área logada se inscreve de novo.
  const abertura = [];
  const offAbertura = repository.onUserChange((user) => abertura.push(user?.email ?? null));
  await new Promise((resolve) => setTimeout(resolve, 30));
  offAbertura();
  const inicio = [];
  const offInicio = repository.onUserChange((user) => inicio.push(user?.email ?? null));
  await new Promise((resolve) => setTimeout(resolve, 30));
  offInicio();
  assert.deepEqual(abertura, ['ana@email.com']);
  assert.deepEqual(inicio, ['ana@email.com']);
});

test('token vencido e sem internet não equivale a sair: sessão continua salva (#34)', async () => {
  // Retorno medido com o supabase-js real (1º/10/2026): com o token vencido e sem rede, a
  // sessão continua no armazenamento e getSession devolve AuthRetryableFetchError. O
  // supabase-js real leva cerca de 25 s tentando renovar, por isso o cenário é simulado.
  const offline = createSupabaseAuthRepository({
    auth: {
      getSession: async () => ({
        data: { session: null },
        error: Object.assign(new Error('Network request failed'), {
          name: 'AuthRetryableFetchError',
          status: 0,
        }),
      }),
    },
  });
  await assert.rejects(offline.getCurrentUser(), { code: 'network' });

  const silence = console.error;
  console.error = () => {};
  try {
    const refused = await reopenedApp({
      expiresIn: -600,
      fetchImpl: async () =>
        new Response(JSON.stringify({ error_code: 'refresh_token_not_found', msg: 'Invalid' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }),
    });
    await assert.rejects(refused.repository.getCurrentUser(), (error) => error.code !== 'network');
    assert.ok(!refused.store.has('sb-projetoteste-auth-token'), 'sessão recusada é removida');
  } finally {
    console.error = silence;
  }
});

test('Supabase: alterar senha confere a senha atual antes de gravar a nova (07.18 e 07.19)', async () => {
  const errado = fakeClient({
    signInWithPassword: () =>
      Promise.resolve({
        data: { user: null },
        error: { code: 'invalid_credentials', status: 400 },
      }),
  });
  await assert.rejects(
    createSupabaseAuthRepository(errado.client).changePassword('errada1', 'novaLeitura1'),
    { code: 'wrong_current_password' },
  );
  assert.ok(!errado.calls.some((call) => call[0] === 'updateUser'), 'não grava sem conferir');

  const certo = fakeClient();
  await createSupabaseAuthRepository(certo.client).changePassword('livros2026', 'novaLeitura1');
  assert.deepEqual(certo.calls, [
    ['signIn', { email: 'ana@email.com', password: 'livros2026' }],
    ['updateUser', { password: 'novaLeitura1' }],
  ]);
});
