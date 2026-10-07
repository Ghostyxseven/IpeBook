import { useCallback, useEffect, useState } from 'react';
import { toSecurityError } from '../model/entities/SecurityError.ts';
import type { BlockedPerson } from '../model/entities/UserBlock';
import type { SecurityRepository } from '../model/repositories/SecurityRepository';
import { securityErrorMessage } from '../model/services/securityFormat.ts';
import { useAsyncAction } from './useAsyncAction.ts';

type Status = 'loading' | 'ready' | 'error';

/** Pessoas bloqueadas (Figma 07.10 a 07.12): a lista e o desbloqueio com confirmação. */
export function useBlockedPeopleViewModel(repository: SecurityRepository) {
  const [people, setPeople] = useState<BlockedPerson[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  /** Falha ao desbloquear: aviso na tela, sem esconder a lista. */
  const [error, setError] = useState<string | null>(null);
  /** Quem a pessoa tocou para desbloquear, esperando a confirmação. */
  const [confirming, setConfirming] = useState<BlockedPerson | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [unblocking, run] = useAsyncAction();

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setLoadError(null);
    repository.listBlocked().then(
      (found) => {
        if (!active) return;
        setPeople(found);
        setStatus('ready');
      },
      (failure) => {
        if (!active) return;
        setLoadError(securityErrorMessage(toSecurityError(failure).code));
        setStatus('error');
      },
    );
    return () => {
      active = false;
    };
  }, [repository, attempt]);

  const confirmUnblock = useCallback(
    () =>
      run(async () => {
        if (!confirming) return;
        setError(null);
        try {
          await repository.unblockUser(confirming.blockedId);
          setPeople((current) => current.filter((p) => p.blockedId !== confirming.blockedId));
          setConfirming(null);
        } catch (failure) {
          setConfirming(null);
          setError(securityErrorMessage(toSecurityError(failure).code));
        }
      }),
    [run, confirming, repository],
  );

  return {
    status,
    people,
    empty: status === 'ready' && people.length === 0,
    loadError,
    error,
    retry: () => setAttempt((n) => n + 1),
    confirming,
    askUnblock: (person: BlockedPerson) => {
      setError(null);
      setConfirming(person);
    },
    cancelUnblock: () => setConfirming(null),
    confirmUnblock,
    unblocking,
  };
}
