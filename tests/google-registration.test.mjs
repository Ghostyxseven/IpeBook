import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSupabaseAuthRepository,
  toUser,
} from '../src/model/repositories/supabaseAuthRepository.ts';
import { createMemoryAuthRepository } from '../src/model/repositories/memoryAuthRepository.ts';
import {
  completeGoogleRegistration,
  validateGoogleRegistration,
} from '../src/model/services/googleRegistration.ts';
import { AuthError } from '../src/model/entities/AuthError.ts';

const raw = {
  id: 'g1',
  email: 'leitor@example.com',
  email_confirmed_at: '2026-10-08',
  app_metadata: { provider: 'google' },
  user_metadata: { name: 'Leitor' },
};
const values = {
  name: ' Ana Leitora ',
  password: 'senhaFicticia123',
  confirmation: 'senhaFicticia123',
  neighborhood: '  Fonte   dos Matos  ',
};
const now = new Date('2026-10-08T12:00:00Z');

test('Google pendente é identificado sem atingir contas de e-mail ou concluídas', () => {
  assert.equal(toUser(raw).needsRegistration, true);
  assert.equal(
    toUser({ ...raw, app_metadata: { provider: 'email', providers: ['email', 'google'] } })
      .needsRegistration,
    undefined,
  );
  assert.equal(
    toUser({ ...raw, user_metadata: { google_registration_completed: true } }).needsRegistration,
    undefined,
  );
});

test('conclusão usa a mesma identidade, bairro antes da senha e não repete onboarding', async () => {
  const memory = createMemoryAuthRepository({ googleAccount: toUser(raw) });
  await memory.repository.signInWithGoogle();
  const order = [];
  const profile = {
    setNeighborhood: async (value) => {
      order.push('bairro');
      assert.equal(value, 'Fonte dos Matos');
    },
  };
  const finish = memory.repository.completeGoogleRegistration;
  memory.repository.completeGoogleRegistration = (...args) => {
    order.push('auth');
    return finish(...args);
  };
  await completeGoogleRegistration(memory.repository, profile, values, true, now);
  assert.deepEqual(order, ['bairro', 'auth']);
  await memory.repository.signOut();
  const signedIn = await memory.repository.signIn(raw.email, values.password);
  assert.equal(signedIn.id, raw.id);
  assert.equal(signedIn.name, 'Ana Leitora');
  assert.equal(signedIn.needsRegistration, undefined);
  assert.equal((await memory.repository.signInWithGoogle()).needsRegistration, undefined);
});

test('falha no bairro não define senha; falha Auth mantém pendência e permite repetir', async () => {
  let fail = true;
  const memory = createMemoryAuthRepository({
    googleAccount: toUser(raw),
    beforePasswordUpdate: async () => {
      if (fail) throw new AuthError('network');
    },
  });
  await memory.repository.signInWithGoogle();
  await assert.rejects(
    completeGoogleRegistration(
      memory.repository,
      {
        setNeighborhood: async () => {
          throw new Error('offline');
        },
      },
      values,
      true,
      now,
    ),
  );
  assert.ok(!memory.calls.includes('completeGoogleRegistration'));
  const profile = { setNeighborhood: async () => {} };
  await assert.rejects(completeGoogleRegistration(memory.repository, profile, values, true, now), {
    code: 'network',
  });
  assert.equal((await memory.repository.getCurrentUser()).needsRegistration, true);
  fail = false;
  await completeGoogleRegistration(memory.repository, profile, values, true, now);
  assert.equal((await memory.repository.getCurrentUser()).needsRegistration, undefined);
});

test('validação exige nome, bairro, senha, confirmação e termos antes de gravar', async () => {
  const errors = validateGoogleRegistration(
    { name: '', password: 'curta', confirmation: 'outra', neighborhood: '' },
    false,
  );
  for (const key of ['name', 'password', 'confirmation', 'neighborhood', 'terms'])
    assert.ok(errors[key]);
  await assert.rejects(
    completeGoogleRegistration({}, {}, { ...values, neighborhood: '' }, true, now),
  );
  await assert.rejects(
    completeGoogleRegistration({ getCurrentUser: async () => null }, {}, values, true, now),
  );
});

test('Supabase atualiza senha fora dos metadados e não altera e-mail nem cria conta', async () => {
  let update;
  const auth = {
    getUser: async () => ({ data: { user: raw }, error: null }),
    updateUser: async (payload) => {
      update = payload;
      return { data: { user: { ...raw, user_metadata: payload.data } }, error: null };
    },
  };
  const result = await createSupabaseAuthRepository({ auth }).completeGoogleRegistration(
    'Ana',
    values.password,
    now,
  );
  assert.deepEqual(update, {
    password: values.password,
    data: {
      name: 'Ana',
      terms_accepted_at: now.toISOString(),
      google_registration_completed: true,
    },
  });
  assert.equal(result.id, raw.id);
  assert.equal(result.email, raw.email);
  assert.equal(result.needsRegistration, undefined);
  auth.getUser = async () => ({ data: { user: null }, error: null });
  await assert.rejects(
    createSupabaseAuthRepository({ auth }).completeGoogleRegistration('Ana', values.password, now),
  );
});
