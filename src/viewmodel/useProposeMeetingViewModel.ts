import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BookRequest } from '../model/entities/BookRequest';
import { toBookRequestError } from '../model/entities/BookRequestError.ts';
import type { Listing } from '../model/entities/Listing';
import type { BookRequestRepository } from '../model/repositories/BookRequestRepository';
import type { CatalogRepository } from '../model/repositories/CatalogRepository';
import { bookRequestErrorMessage } from '../model/services/bookRequestMessages.ts';
import { isOwner } from '../model/services/bookRequestTransitions.ts';
import { useAsyncAction } from './useAsyncAction.ts';

export type ProposeMeetingStatus = 'loading' | 'ready' | 'closed' | 'error';

const VALID_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const VALID_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Propor o primeiro encontro de uma negociação que começou só como conversa (ADR 0035):
 * local, dia e horário, do zero. Só funciona em `pending` sem proposta prévia; o banco
 * confere de novo (`propose_meeting`). Espelha `useRescheduleViewModel`.
 */
export function useProposeMeetingViewModel(
  bookRequests: BookRequestRepository,
  catalog: CatalogRepository,
  requestId: string,
  userId: string,
) {
  const [status, setStatus] = useState<ProposeMeetingStatus>('loading');
  const [request, setRequest] = useState<BookRequest | null>(null);
  const [otherName, setOtherName] = useState<string | null>(null);
  const [publicLocation, setPublicLocation] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<BookRequest | null>(null);
  const [saving, run] = useAsyncAction();
  const loadId = useRef(0);

  const load = useCallback(async () => {
    const current = ++loadId.current;
    setStatus('loading');
    setError(null);
    try {
      const found = await bookRequests.getRequestById(requestId);
      const listing: Listing | null = await catalog.getById(found.listingId).catch(() => null);
      const asOwner = listing ? isOwner(userId, listing) : false;
      const name = asOwner
        ? await bookRequests.personFirstName(found.requesterId).catch(() => null)
        : (listing?.ownerFirstName ?? null);
      if (current !== loadId.current) return;
      setRequest(found);
      setOtherName(name);
      setStatus(found.status === 'pending' && found.publicLocation === null ? 'ready' : 'closed');
    } catch (failure) {
      if (current !== loadId.current) return;
      setError(bookRequestErrorMessage(toBookRequestError(failure).code));
      setStatus('error');
    }
  }, [bookRequests, catalog, requestId, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const canSubmit = useMemo(
    () =>
      publicLocation.trim().length > 0 &&
      VALID_DATE.test(meetingDate) &&
      VALID_TIME.test(meetingTime) &&
      !saving,
    [publicLocation, meetingDate, meetingTime, saving],
  );

  const submit = useCallback(
    () =>
      run(async () => {
        if (!request || !canSubmit) return;
        setError(null);
        try {
          const updated = await bookRequests.proposeMeeting(request.id, {
            publicLocation: publicLocation.trim(),
            meetingDate,
            meetingTime,
          });
          setRequest(updated);
          setDone(updated);
        } catch (failure) {
          setError(bookRequestErrorMessage(toBookRequestError(failure).code));
        }
      }),
    [run, request, canSubmit, bookRequests, publicLocation, meetingDate, meetingTime],
  );

  return {
    status,
    retry: load,
    request,
    otherName,
    publicLocation,
    setPublicLocation,
    meetingDate,
    setMeetingDate,
    meetingTime,
    setMeetingTime,
    canSubmit,
    saving,
    error,
    done,
    submit,
  };
}
