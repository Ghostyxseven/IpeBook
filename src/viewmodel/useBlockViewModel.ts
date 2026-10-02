import { useState } from 'react';
import type { SecurityRepository } from '../model/repositories/SecurityRepository';
import { useAsyncAction } from './useAsyncAction';

export function useBlockViewModel(
  repository: SecurityRepository,
  userIdToBlock: string,
  options: { onSuccess: () => void },
) {
  const [submitting, run] = useAsyncAction();
  const [error, setError] = useState<string | null>(null);

  return {
    submitting,
    error,
    submit: () =>
      run(async () => {
        setError(null);
        try {
          await repository.blockUser(userIdToBlock);
          options.onSuccess();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erro ao bloquear usuário');
        }
      }),
  };
}
