import { useState } from 'react';
import type { SecurityRepository } from '../model/repositories/SecurityRepository';
import { useAsyncAction } from './useAsyncAction';

export function useReportViewModel(
  repository: SecurityRepository,
  target: { userId: string | null; listingId: string | null },
  options: { onSuccess: () => void },
) {
  const [reason, setReason] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [submitting, run] = useAsyncAction();
  const [error, setError] = useState<string | null>(null);

  return {
    reason,
    setReason,
    details,
    setDetails,
    submitting,
    error,
    submit: () =>
      run(async () => {
        setError(null);
        if (!reason) {
          setError('Por favor, selecione um motivo.');
          return;
        }
        try {
          await repository.createReport(target, reason, details || null);
          options.onSuccess();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erro ao enviar denúncia');
        }
      }),
  };
}
