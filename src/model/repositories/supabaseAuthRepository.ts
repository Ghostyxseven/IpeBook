import type { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { AuthError, type AuthErrorCode } from '../entities/AuthError.ts';
import type { User } from '../entities/User';
import type { AuthRepository } from './AuthRepository';

/** Só a parte `auth` do cliente é usada; facilita testar com um cliente falso. */
export type SupabaseAuthClient = Pick<SupabaseClient, 'auth'>;

const codeMap: Partial<Record<string, AuthErrorCode>> = {
  invalid_credentials: 'invalid_credentials',
  email_not_confirmed: 'email_not_confirmed',
  user_already_exists: 'email_in_use',
  email_exists: 'email_in_use',
  email_address_invalid: 'invalid_email',
  validation_failed: 'invalid_email',
  weak_password: 'weak_password',
  otp_expired: 'invalid_code',
  same_password: 'same_password',
  over_email_send_rate_limit: 'rate_limited',
  over_request_rate_limit: 'rate_limited',
};

export function mapSupabaseError(error: unknown): AuthError {
  if (error instanceof AuthError) return error;
  const { code, name, status } = (error ?? {}) as { code?: string; name?: string; status?: number };
  // AuthRetryableFetchError indica falha de rede ou servidor indisponível.
  if (name === 'AuthRetryableFetchError' || status === 0) return new AuthError('network', error);
  if (status === 429) return new AuthError('rate_limited', error);
  return new AuthError((code && codeMap[code]) || 'unknown', error);
}

export function toUser(user: SupabaseUser): User {
  const name = user.user_metadata?.name;
  return {
    id: user.id,
    email: user.email ?? '',
    name: typeof name === 'string' ? name : '',
    emailVerified: Boolean(user.email_confirmed_at),
  };
}

/** Executa a chamada e converte `{ error }` do Supabase em exceção do domínio. */
async function run<T extends { error: unknown }>(call: () => Promise<T>): Promise<T> {
  let result: T;
  try {
    result = await call();
  } catch (error) {
    throw mapSupabaseError(error);
  }
  if (result.error) throw mapSupabaseError(result.error);
  return result;
}

export function createSupabaseAuthRepository(client: SupabaseAuthClient | null): AuthRepository {
  const auth = () => {
    if (!client) throw new AuthError('not_configured');
    return client.auth;
  };

  return {
    async getCurrentUser() {
      if (!client) return null;
      const { data } = await client.auth.getSession();
      return data.session ? toUser(data.session.user) : null;
    },

    onUserChange(listener) {
      if (!client) return () => {};
      // Não chamar outros métodos do Supabase dentro deste callback (pode travar a sessão).
      const { data } = client.auth.onAuthStateChange((_event, session) =>
        listener(session ? toUser(session.user) : null),
      );
      return () => data.subscription.unsubscribe();
    },

    async signIn(email, password) {
      const { data } = await run(() => auth().signInWithPassword({ email, password }));
      return toUser(data.user!);
    },

    async signUp(name, email, password) {
      // Com "Confirm email" ligado, um e-mail já cadastrado recebe um usuário ofuscado,
      // sem erro: o app segue para a verificação sem revelar se a conta existe.
      await run(() => auth().signUp({ email, password, options: { data: { name } } }));
    },

    async verifySignUp(email, code) {
      const { data } = await run(() => auth().verifyOtp({ email, token: code, type: 'signup' }));
      if (!data.user) throw new AuthError('invalid_code');
      return toUser(data.user);
    },

    async resendSignUpCode(email) {
      await run(() => auth().resend({ type: 'signup', email }));
    },

    async requestPasswordReset(email) {
      await run(() => auth().resetPasswordForEmail(email));
    },

    async resetPassword(email, code, newPassword) {
      await run(() => auth().verifyOtp({ email, token: code, type: 'recovery' }));
      await run(() => auth().updateUser({ password: newPassword }));
    },

    async signOut() {
      await run(() => auth().signOut());
    },
  };
}
