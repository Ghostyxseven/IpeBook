import { useState } from 'react';
import { toSecurityError } from '../model/entities/SecurityError.ts';
import type { SecurityRepository } from '../model/repositories/SecurityRepository';
import {
  listingReportReasons,
  REPORT_DETAILS_MAX,
  securityErrorMessage,
  userReportReasons,
} from '../model/services/securityFormat.ts';
import { useAsyncAction } from './useAsyncAction.ts';

/**
 * Denunciar anúncio ou pessoa (Figma 09.03 e 09.04). Com anúncio, os motivos são os do
 * anúncio; sem ele, os de uma pessoa. Enviar com sucesso troca a tela pela confirmação.
 */
export function useReportViewModel(
  repository: SecurityRepository,
  target: { userId: string | null; listingId: string | null },
) {
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetailsState] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, run] = useAsyncAction();

  const reasons = target.listingId ? listingReportReasons : userReportReasons;

  return {
    kind: target.listingId ? ('listing' as const) : ('user' as const),
    reasons,
    reason,
    setReason: (value: string) => {
      setReason(value);
      setError(null);
    },
    details,
    setDetails: (value: string) => setDetailsState(value.slice(0, REPORT_DETAILS_MAX)),
    detailsMax: REPORT_DETAILS_MAX,
    submitting,
    error,
    sent,
    submit: () =>
      run(async () => {
        setError(null);
        if (!reason) {
          setError(securityErrorMessage('invalid'));
          return;
        }
        try {
          await repository.createReport(target, reason, details.trim() || null);
          setSent(true);
        } catch (failure) {
          setError(securityErrorMessage(toSecurityError(failure).code));
        }
      }),
  };
}
