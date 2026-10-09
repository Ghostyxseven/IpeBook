import { useState } from 'react';
import { toSecurityError } from '../model/entities/SecurityError.ts';
import type { SecurityRepository } from '../model/repositories/SecurityRepository';
import { securityErrorMessage } from '../model/services/securityFormat.ts';
import { useAsyncAction } from './useAsyncAction.ts';

/** Bloquear uma pessoa, confirmado no diálogo do Figma 09.02. */
export function useBlockViewModel(repository: SecurityRepository, userIdToBlock: string | null) {
  const [submitting, run] = useAsyncAction();
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);

  return {
    submitting,
    error,
    blocked,
    canBlock: Boolean(userIdToBlock),
    clearError: () => setError(null),
    submit: () =>
      run(async () => {
        if (!userIdToBlock) return;
        setError(null);
        try {
          await repository.blockUser(userIdToBlock);
          setBlocked(true);
        } catch (failure) {
          setError(securityErrorMessage(toSecurityError(failure).code));
        }
      }),
  };
}
