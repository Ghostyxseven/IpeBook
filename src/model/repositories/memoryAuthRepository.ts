import { AuthError } from '../entities/AuthError.ts';
import type { User } from '../entities/User';
import type { AuthRepository } from './AuthRepository';

type Account = { user: User; password: string };

/**
 * Implementação em memória para testes das ViewModels.
 * Não é usada pelo aplicativo: sem Supabase configurado, o app informa isso em vez de simular contas.
 */
export function createMemoryAuthRepository({ code = '123456' }: { code?: string } = {}) {
  const accounts = new Map<string, Account>();
  const listeners = new Set<(user: User | null) => void>();
  let current: User | null = null;
  const calls: string[] = [];

  const setCurrent = (user: User | null) => {
    current = user;
    listeners.forEach((listener) => listener(user));
  };
  const find = (email: string) => accounts.get(email);

  const repository: AuthRepository = {
    async getCurrentUser() {
      return current;
    },
    onUserChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async signIn(email, password) {
      calls.push('signIn');
      const account = find(email);
      if (!account || account.password !== password) throw new AuthError('invalid_credentials');
      if (!account.user.emailVerified) throw new AuthError('email_not_confirmed');
      setCurrent(account.user);
      return account.user;
    },
    async signUp(name, email, password) {
      calls.push('signUp');
      if (find(email)) return; // Mesmo comportamento do Supabase: não revela contas existentes.
      accounts.set(email, {
        user: { id: `u${accounts.size + 1}`, name, email, emailVerified: false },
        password,
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
      calls.push('resetPassword');
      const account = find(email);
      if (!account || token !== code) throw new AuthError('invalid_code');
      if (account.password === newPassword) throw new AuthError('same_password');
      account.password = newPassword;
      setCurrent(account.user);
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
  };
}
