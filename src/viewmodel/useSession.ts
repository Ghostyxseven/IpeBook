import { createContext, useContext, useEffect, useState } from 'react';
import { toAuthError } from '../model/entities/AuthError.ts';
import type { User } from '../model/entities/User';
import type { AuthRepository } from '../model/repositories/AuthRepository';
import { authErrorMessage } from '../model/services/authMessages.ts';
import { useAsyncAction } from './useAsyncAction.ts';

export type SessionStatus = 'loading' | 'signedOut' | 'signedIn';
export type StartRoute = '/onboarding' | '/entrar' | '/inicio';

export function useSession(repository: AuthRepository) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [signingOut, run] = useAsyncAction();

  useEffect(() => {
    let active = true;
    let notified = false;
    const apply = (next: User | null) => {
      if (!active) return;
      setUser(next);
      setStatus(next ? 'signedIn' : 'signedOut');
    };
    const unsubscribe = repository.onUserChange((next) => {
      notified = true;
      apply(next);
    });
    // A leitura inicial só vale se nenhum evento mais recente já tiver chegado.
    repository.getCurrentUser().then(
      (current) => notified || apply(current),
      () => notified || apply(null),
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [repository]);

  return {
    status,
    user,
    error,
    signingOut,
    signOut: () =>
      run(async () => {
        setError(null);
        try {
          await repository.signOut();
        } catch (failure) {
          setError(authErrorMessage(toAuthError(failure).code));
        }
      }),
  };
}

export type Session = ReturnType<typeof useSession>;

/** Cada grupo de rotas ((auth) e (app)) cria a sessão e a compartilha com suas telas. */
export const SessionContext = createContext<Session | null>(null);

export function useSessionContext(): Session {
  const session = useContext(SessionContext);
  if (!session)
    throw new Error('useSessionContext precisa estar dentro de SessionContext.Provider.');
  return session;
}

/** Destino da abertura no celular: onboarding só na primeira vez. */
export function startRoute(status: SessionStatus, seenOnboarding: boolean): StartRoute | null {
  if (status === 'loading') return null;
  if (status === 'signedIn') return '/inicio';
  return seenOnboarding ? '/entrar' : '/onboarding';
}
