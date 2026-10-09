import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { webcrypto } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'expo-crypto') {
      return {
        shortCircuit: true,
        url:
          'data:text/javascript,' +
          encodeURIComponent(`
          import { webcrypto } from 'node:crypto';
          export const CryptoDigestAlgorithm = { SHA256: 'SHA-256' };
          export const digest = (algorithm, data) => webcrypto.subtle.digest(algorithm, data);
          export const getRandomValues = array => webcrypto.getRandomValues(array);
        `),
      };
    }
    return nextResolve(specifier, context);
  },
});

test('PKCE nativo: sem WebCrypto gera SHA-256 e autorização S256 sem aviso', async (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true });
  t.after(() => {
    Object.defineProperty(globalThis, 'crypto', descriptor);
    hooks.deregister();
  });
  const warn = t.mock.method(console, 'warn');
  await import('../src/infra/pkceCrypto.ts');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('abc'));
  assert.equal(
    Buffer.from(digest).toString('hex'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
  const array = new Uint32Array(56);
  assert.equal(crypto.getRandomValues(array), array);
  assert.ok(array.some((value) => value !== 0));
  const client = createClient('https://crypto-ficticio.supabase.co', 'chave-ficticia', {
    auth: {
      flowType: 'pkce',
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: () => {
        throw new Error('Não deve acessar a rede');
      },
    },
  });
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { skipBrowserRedirect: true },
  });
  assert.equal(error, null);
  assert.equal(new URL(data.url).searchParams.get('code_challenge_method'), 's256');
  assert.equal(warn.mock.callCount(), 0);
  await assert.rejects(crypto.subtle.digest('SHA-1', new Uint8Array()), /SHA-256/);
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
  await import('../src/infra/pkceCrypto.ts?existente');
  assert.equal(globalThis.crypto, webcrypto);
  assert.equal(globalThis.crypto.subtle, webcrypto.subtle);
});
