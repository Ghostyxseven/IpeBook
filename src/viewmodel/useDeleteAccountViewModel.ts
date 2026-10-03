import { useState } from 'react';
import { toAuthError } from '../model/entities/AuthError.ts';
import type { AccountRepository } from '../model/repositories/AccountRepository';
import { authErrorMessage } from '../model/services/authMessages.ts';
import { afterSignOut } from './afterSignOut.ts';
import { useAsyncAction } from './useAsyncAction.ts';

/** Excluir conta (Figma 07.09): confirmação, exclusão e, ao terminar, Conta excluída (07.17). */
export function useDeleteAccountViewModel(
  repository: AccountRepository,
  { confirmOnOpen = false }: { confirmOnOpen?: boolean } = {},
) {
  const [confirming, setConfirming] = useState(confirmOnOpen);
  const [error, setError] = useState<string | undefined>();
  const [deleting, run] = useAsyncAction();
  return {
    confirming,
    deleting,
    error,
    askToDelete: () => {
      setError(undefined);
      setConfirming(true);
    },
    cancel: () => {
      setConfirming(false);
      setError(undefined);
    },
    confirm: () =>
      run(async () => {
        setError(undefined);
        // A sessão acaba dentro da exclusão; o layout usa a marca para abrir Conta excluída.
        afterSignOut.markAccountDeleted();
        try {
          await repository.deleteAccount();
        } catch (failure) {
          afterSignOut.clear();
          setError(authErrorMessage(toAuthError(failure).code));
        }
      }),
  };
}
