import type { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { AuthError, type AuthErrorCode } from '../entities/AuthError.ts';
import type { User } from '../entities/User';
import type { AuthRepository } from './AuthRepository';
import { createUserChangeGate } from './userChangeGate.ts';

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
  const gate = createUserChangeGate();
  let providerSubscription: (() => void) | null = null;
  /** E-mail cuja recuperação teve o código confirmado e aguarda a nova senha. */
  let recoveringEmail: string | null = null;

  return {
    async getCurrentUser() {
      if (!client || gate.holding) return null;
      // Com o token vencido e sem internet, o Supabase mantém a sessão salva mas devolve
      // erro de rede: tratar como "sem sessão" mandava a pessoa para Entrar (issue #34).
      const { data, error } = await client.auth.getSession();
      if (error) throw mapSupabaseError(error);
      return data.session ? toUser(data.session.user) : null;
    },

    onUserChange(listener) {
      if (!client) return () => {};
      if (!providerSubscription) {
        // Uma inscrição no provedor, compartilhada pelas ViewModels por meio do portão.
        // Não chamar outros métodos do Supabase dentro deste callback (pode travar a sessão).
        const { data } = client.auth.onAuthStateChange((_event, session) =>
          gate.emit(session ? toUser(session.user) : null),
        );
        providerSubscription = () => data.subscription.unsubscribe();
      }
      const unsubscribe = gate.subscribe(listener);
      return () => {
        unsubscribe();
        if (!gate.listenerCount) {
          providerSubscription?.();
          providerSubscription = null;
        }
      };
    },

    async signIn(email, password) {
      const { data } = await run(() => auth().signInWithPassword({ email, password }));
      return toUser(data.user!);
    },

    async signUp(name, email, password, termsAcceptedAt) {
      // Com "Confirm email" ligado, um e-mail já cadastrado recebe um usuário ofuscado,
      // sem erro: o app segue para a verificação sem revelar se a conta existe.
      // A data do aceite fica nos metadados da conta (auth.users.raw_user_meta_data).
      const data = { name, terms_accepted_at: termsAcceptedAt.toISOString() };
      await run(() => auth().signUp({ email, password, options: { data } }));
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
      if (recoveringEmail !== email) {
        // verifyOtp cria a sessão de recuperação antes de a senha ser gravada.
        gate.hold();
        try {
          await run(() => auth().verifyOtp({ email, token: code, type: 'recovery' }));
        } catch (error) {
          gate.release();
          throw error;
        }
        recoveringEmail = email;
      }
      // Se falhar, o portão continua fechado: a tela mostra o erro e permite tentar de novo.
      const { data } = await run(() => auth().updateUser({ password: newPassword }));
      recoveringEmail = null;
      gate.release(data.user ? toUser(data.user) : null);
    },

    async cancelPasswordRecovery() {
      if (!gate.holding) return;
      recoveringEmail = null;
      try {
        if (client) await client.auth.signOut();
      } finally {
        gate.release(null);
      }
    },

    async signOut() {
      await run(() => auth().signOut());
    },
  };
}
