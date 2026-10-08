import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { createHash } from 'node:crypto';
import { createSupabaseAuthRepository } from '../src/model/repositories/supabaseAuthRepository.ts';

const user = {
  id: 'google-ficticio',
  email: 'leitor@example.com',
  user_metadata: { name: 'Leitor' },
};

test('Google: configuração real gera PKCE, troca código e restaura sessão', async (t) => {
  const previousUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const previousKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://teste-google.supabase.co';
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'chave-ficticia';
  // Substitui somente o armazenamento nativo; mantém a configuração e o SDK reais.
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      if (specifier === './pkceCrypto' && context.parentURL?.endsWith('/infra/supabaseClient.ts')) {
        return nextResolve('./pkceCrypto.web.ts', context);
      }
      if (specifier === './localStore' && context.parentURL?.endsWith('/infra/supabaseClient.ts')) {
        return { url: 'data:text/javascript,export const localStore = null;', shortCircuit: true };
      }
      return nextResolve(specifier, context);
    },
  });
  t.after(() => {
    hooks.deregister();
    for (const [key, value] of Object.entries({
      EXPO_PUBLIC_SUPABASE_URL: previousUrl,
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: previousKey,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  let challenge;
  let exchanges = 0;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(new URL(url).pathname, '/auth/v1/token');
    assert.equal(new URL(url).searchParams.get('grant_type'), 'pkce');
    const body = JSON.parse(options.body);
    assert.equal(body.auth_code, 'codigo-ficticio');
    assert.ok(body.code_verifier);
    assert.equal(createHash('sha256').update(body.code_verifier).digest('base64url'), challenge);
    exchanges++;
    return new Response(
      JSON.stringify({
        access_token: 'token-ficticio',
        refresh_token: 'refresh-ficticio',
        expires_in: 3600,
        token_type: 'bearer',
        user,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  });
  const { supabase } = await import('../src/infra/supabaseClient.ts');
  t.after(() => supabase.auth.stopAutoRefresh());
  const repository = createSupabaseAuthRepository(supabase, {
    createRedirectUrl: () => 'ipebook://auth/callback',
    async openAuthSession(url, redirect) {
      const params = new URL(url).searchParams;
      assert.equal(params.get('provider'), 'google');
      assert.equal(params.get('redirect_to'), redirect);
      assert.equal(params.get('code_challenge_method'), 's256');
      challenge = params.get('code_challenge');
      assert.ok(challenge, 'o login precisa iniciar PKCE para receber um código');
      return { type: 'success', url: `${redirect}?code=codigo-ficticio` };
    },
  });
  assert.equal((await repository.signInWithGoogle()).id, user.id);
  assert.equal(exchanges, 1);
  assert.equal((await repository.getCurrentUser()).id, user.id);
});

for (const [name, result, expected] of [
  ['cancelado', { type: 'cancel' }, 'oauth_cancelled'],
  ['fechado', { type: 'dismiss' }, 'oauth_cancelled'],
  [
    'sem código',
    { type: 'success', url: 'ipebook://auth/callback?error=access_denied' },
    'unknown',
  ],
  ['código vazio', { type: 'success', url: 'ipebook://auth/callback?code=' }, 'unknown'],
]) {
  test(`Google: retorno ${name} não troca sessão`, async () => {
    let exchanges = 0;
    const repository = createSupabaseAuthRepository(
      {
        auth: {
          signInWithOAuth: async () => ({ data: { url: 'https://exemplo.invalid' }, error: null }),
          exchangeCodeForSession: async () => {
            exchanges++;
            throw new Error('não deveria trocar');
          },
        },
      },
      {
        createRedirectUrl: () => 'ipebook://auth/callback',
        openAuthSession: async () => result,
      },
    );
    await assert.rejects(repository.signInWithGoogle(), { code: expected });
    assert.equal(exchanges, 0);
  });
}

test('Google: falha na troca de código preserva erro de rede do domínio', async () => {
  const repository = createSupabaseAuthRepository(
    {
      auth: {
        signInWithOAuth: async () => ({ data: { url: 'https://exemplo.invalid' }, error: null }),
        exchangeCodeForSession: async () => ({
          data: {},
          error: { name: 'AuthRetryableFetchError' },
        }),
      },
    },
    {
      createRedirectUrl: () => 'ipebook://auth/callback',
      openAuthSession: async () => ({
        type: 'success',
        url: 'ipebook://auth/callback?code=ficticio',
      }),
    },
  );
  await assert.rejects(repository.signInWithGoogle(), { code: 'network' });
});
