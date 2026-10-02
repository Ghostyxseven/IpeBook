import { useCallback, useMemo, useState } from 'react';
import type { BookRequestRepository } from '../model/repositories/BookRequestRepository';
import { BookRequestError, toBookRequestError } from '../model/entities/BookRequestError.ts';
import { bookRequestErrorMessage } from '../model/services/bookRequestMessages';
import { useAsyncAction } from './useAsyncAction';
import { useSessionContext } from './useSession';
import type { CatalogRepository } from '../model/repositories/CatalogRepository';
import { toCatalogError } from '../model/entities/CatalogError';
import { catalogErrorMessage } from '../model/services/catalogMessages';
import { ensureCanCreate } from '../model/services/bookRequestTransitions';

/**
 * Regex de data ISO usada no banco (YYYY-MM-DD).
 * Validação simples: formato e faixas mínimas.
 */
const VALID_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const VALID_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function useCreateBookRequestViewModel(
  catalogRepository: CatalogRepository,
  bookRequestRepository: BookRequestRepository,
  listingId: string,
) {
  const session = useSessionContext();
  const [busy, run] = useAsyncAction();
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [publicLocation, setPublicLocation] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  const isFormValid = useMemo(() => {
    return (
      publicLocation.trim().length > 0 &&
      VALID_DATE.test(meetingDate) &&
      VALID_TIME.test(meetingTime)
    );
  }, [publicLocation, meetingDate, meetingTime]);

  const submit = useCallback(async () => {
    setError(null);
    await run(async () => {
      try {
        if (!isFormValid) {
          throw new BookRequestError('invalid_transition');
        }
        if (!session.user?.id) {
          throw new BookRequestError('forbidden');
        }
        // 1. valida estado do anúncio
        const listing = await catalogRepository.getById(listingId);
        ensureCanCreate(listing, session.user.id);
        // 2. valida solicitação duplicada (tem solicitação pending para mesmo listing e mesmo user?)
        const existing = await bookRequestRepository.getRequestsByRequester(session.user.id);
        const duplicated = existing.some(
          (it) => it.listingId === listingId && it.status === 'pending',
        );
        if (duplicated) {
          throw new BookRequestError('already_exists');
        }
        // 3. cria a solicitação
        const created = await bookRequestRepository.createRequest({
          listingId,
          publicLocation: publicLocation.trim(),
          meetingDate,
          meetingTime,
        });
        setSubmitted(created.id);
      } catch (failure) {
        const br = toBookRequestError(failure);
        if (br.code === 'unknown') {
          const cs = toCatalogError(failure);
          setError(catalogErrorMessage(cs.code));
        } else {
          setError(bookRequestErrorMessage(br.code));
        }
        setSubmitted(null);
      }
    });
  }, [
    run,
    isFormValid,
    session.user?.id,
    catalogRepository,
    bookRequestRepository,
    listingId,
    publicLocation,
    meetingDate,
    meetingTime,
  ]);

  return {
    // Estado do formulário
    publicLocation,
    setPublicLocation,
    meetingDate,
    setMeetingDate,
    meetingTime,
    setMeetingTime,
    isFormValid,
    // Estado da operação
    submitting: busy,
    submitted,
    error,
    submit,
  };
}
