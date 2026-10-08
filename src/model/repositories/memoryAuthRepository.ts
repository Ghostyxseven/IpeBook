import { AuthError } from '../entities/AuthError.ts';
import type { User } from '../entities/User';
import type { AuthRepository } from './AuthRepository';
import { createUserChangeGate } from './userChangeGate.ts';

type Account = { user: User; password: string; termsAcceptedAt?: Date };

/**
 * Implementação em memória para testes das ViewModels.
 * Não é usada pelo aplicativo: sem Supabase configurado, o app informa isso em vez de simular contas.
 *
 * Reproduz a ordem do Supabase na recuperação: confirmar o código já avisa uma sessão,
 * antes de a senha ser gravada. `beforePasswordUpdate` permite atrasar ou rejeitar a gravação.
 */
export function createMemoryAuthRepository({
  code = '123456',
  beforePasswordUpdate,
  googleAccount,
}: {
  code?: string;
  beforePasswordUpdate?: () => Promise<void>;
  /** Conta que o Google "devolve" em `signInWithGoogle`; `undefined` simula cancelar. */
  googleAccount?: User;
} = {}) {
  const accounts = new Map<string, Account>();
  const gate = createUserChangeGate();
  let current: User | null = null;
  let recoveringEmail: string | null = null;
  let restoreFailure: AuthError | null = null;
  const calls: string[] = [];

  /** Mudança de sessão no "provedor", como o onAuthStateChange do Supabase. */
  const setCurrent = (user: User | null) => {
    current = user;
    gate.emit(user);
  };
  const find = (email: string) => accounts.get(email);

  const repository: AuthRepository = {
    async getCurrentUser() {
      if (restoreFailure) throw restoreFailure;
      return gate.holding ? null : current;
    },
    onUserChange(listener) {
      return gate.subscribe(listener);
    },
    async signIn(email, password) {
      calls.push('signIn');
      const account = find(email);
      if (!account || account.password !== password) throw new AuthError('invalid_credentials');
      if (!account.user.emailVerified) throw new AuthError('email_not_confirmed');
      setCurrent(account.user);
      return account.user;
    },
    async signInWithGoogle() {
      calls.push('signInWithGoogle');
      if (!googleAccount) throw new AuthError('oauth_cancelled');
      const user = find(googleAccount.email)?.user ?? googleAccount;
      setCurrent(user);
      return user;
    },
    async completeGoogleRegistration(name, password, termsAcceptedAt) {
      calls.push('completeGoogleRegistration');
      if (!current?.needsRegistration) throw new AuthError('unknown');
      await beforePasswordUpdate?.();
      const { needsRegistration: _pending, ...previous } = current;
      const user = { ...previous, name };
      accounts.set(user.email, { user, password, termsAcceptedAt });
      setCurrent(user);
      return user;
    },
    async signUp(name, email, password, termsAcceptedAt) {
      calls.push('signUp');
      if (find(email)) return; // Mesmo comportamento do Supabase: não revela contas existentes.
      accounts.set(email, {
        user: { id: `u${accounts.size + 1}`, name, email, emailVerified: false },
        password,
        termsAcceptedAt,
      });
    },
    async verifySignUp(email, token) {
      calls.push('verifySignUp');
      const account = find(email);
      if (!account || token !== code) throw new AuthError('invalid_code');
      account.user = { ...account.user, emailVerified: true };
      setCurrent(account.user);
      return account.user;
    },
    async resendSignUpCode() {
      calls.push('resendSignUpCode');
    },
    async requestPasswordReset() {
      calls.push('requestPasswordReset');
    },
    async resetPassword(email, token, newPassword) {
      const account = find(email);
      if (recoveringEmail !== email) {
        calls.push('verifyRecoveryCode');
        if (!account || token !== code) throw new AuthError('invalid_code');
        gate.hold();
        recoveringEmail = email;
        setCurrent(account.user); // Sessão de recuperação avisada antes da gravação.
      }
      calls.push('updatePassword');
      await beforePasswordUpdate?.();
      if (account!.password === newPassword) throw new AuthError('same_password');
      account!.password = newPassword;
      recoveringEmail = null;
      gate.release(account!.user);
    },
    async changePassword(currentPassword, newPassword) {
      calls.push('changePassword');
      const account = current ? find(current.email) : undefined;
      if (!account) throw new AuthError('unknown');
      if (account.password !== currentPassword) throw new AuthError('wrong_current_password');
      if (newPassword === currentPassword) throw new AuthError('same_password');
      account.password = newPassword;
    },
    async cancelPasswordRecovery() {
      if (!gate.holding) return;
      calls.push('cancelPasswordRecovery');
      recoveringEmail = null;
      current = null;
      gate.release(null);
    },
    async signOut() {
      calls.push('signOut');
      setCurrent(null);
    },
  };

  return {
    repository,
    calls,
    /** Cria uma conta já confirmada para cenários de teste. */
    addAccount(user: User, password: string) {
      accounts.set(user.email, { user, password });
    },
    /** Simula reabrir o app com uma sessão salva. */
    restoreSession(user: User) {
      current = user;
    },
    /** Simula falha ao confirmar a sessão salva (ex.: token vencido e sem internet). */
    failRestore(error: AuthError | null) {
      restoreFailure = error;
    },
    /** Simula o provedor confirmando a sessão depois (ex.: internet voltou). */
    emitProviderUser(user: User | null) {
      setCurrent(user);
    },
    passwordOf(email: string) {
      return accounts.get(email)?.password;
    },
    /** Data do aceite dos termos gravada no cadastro. */
    termsAcceptedAt(email: string) {
      return accounts.get(email)?.termsAcceptedAt;
    },
  };
}
