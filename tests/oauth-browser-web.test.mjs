import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

test('OAuth Web retorna ao app publicado e preserva a sessão do Expo', async (t) => {
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      if (specifier === 'expo-web-browser') {
        return {
          url: 'data:text/javascript,export async function openAuthSessionAsync(url, redirectUrl) { return {url, redirectUrl}; }',
          shortCircuit: true,
        };
      }
      return nextResolve(specifier, context);
    },
  });
  t.after(() => hooks.deregister());
  const previous = globalThis.window;
  const previousEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  globalThis.window = { location: { origin: 'https://ipebook.example' } };
  t.after(() => {
    process.env.NODE_ENV = previousEnv;
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  });
  const { oauthBrowser } = await import('../src/infra/oauthBrowser.web.ts');
  const redirect = oauthBrowser.createRedirectUrl('auth/callback');
  assert.equal(redirect, 'https://ipebook.example/app/auth/callback');
  assert.deepEqual(await oauthBrowser.openAuthSession('https://provedor.example', redirect), {
    url: 'https://provedor.example',
    redirectUrl: redirect,
  });
});
