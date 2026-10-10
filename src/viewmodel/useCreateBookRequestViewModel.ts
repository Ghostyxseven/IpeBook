import { useMeetingLocation } from './useMeetingLocation.ts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BookRequestRepository } from '../model/repositories/BookRequestRepository';
import { BookRequestError, toBookRequestError } from '../model/entities/BookRequestError.ts';
import { bookRequestErrorMessage } from '../model/services/bookRequestMessages.ts';
import { useAsyncAction } from './useAsyncAction.ts';
import { useSessionContext } from './useSession.ts';
import type { CatalogRepository } from '../model/repositories/CatalogRepository';
import type { ListingsRepository } from '../model/repositories/ListingsRepository';
import { toCatalogError } from '../model/entities/CatalogError.ts';
import { catalogErrorMessage } from '../model/services/catalogMessages.ts';
import { ensureCanCreate } from '../model/services/bookRequestTransitions.ts';
import type { Listing, MyListing } from '../model/entities/Listing';

/**
 * Regex de data ISO usada no banco (YYYY-MM-DD).
 * Validação simples: formato e faixas mínimas.
 */
const VALID_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const VALID_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Na troca, o pedido começa escolhendo o livro oferecido (Figma 03.05); depois o encontro. */
export type CreateStep = 'offer' | 'meeting';
export type OfferStatus = 'loading' | 'ready' | 'error';

export function useCreateBookRequestViewModel(
  catalogRepository: CatalogRepository,
  bookRequestRepository: BookRequestRepository,
  listingId: string,
  listingsRepository?: ListingsRepository,
) {
  const session = useSessionContext();
  const [busy, run] = useAsyncAction();
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { publicLocation, setPublicLocation, meetingPoint, chooseMeetingPoint } =
    useMeetingLocation();
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  // Troca (spec 028, etapa 3): o livro pedido e os livros disponíveis de quem pede.
  const [listing, setListing] = useState<Listing | null>(null);
  const [offerOptions, setOfferOptions] = useState<MyListing[]>([]);
  const [offerStatus, setOfferStatus] = useState<OfferStatus>('loading');
  const [offeredListingId, setOfferedListingId] = useState<string | null>(null);
  const [step, setStep] = useState<CreateStep>('meeting');

  const loadOffer = useCallback(async () => {
    setOfferStatus('loading');
    try {
      const found = await catalogRepository.getById(listingId);
      setListing(found);
      chooseMeetingPoint(found.meetingPoint ?? null);
      if (found.modality !== 'trade' || !listingsRepository) {
        setStep('meeting');
        setOfferStatus('ready');
        return;
      }
      setStep('offer');
      const mine = await listingsRepository.listMine();
      const options = mine.filter((item) => item.status === 'disponivel' && item.id !== listingId);
      setOfferOptions(options);
      setOfferedListingId((current) => current ?? options[0]?.id ?? null);
      setOfferStatus('ready');
    } catch {
      // Sem a lista, quem pede pode tentar de novo; o envio confere o anúncio outra vez.
      setOfferStatus('error');
    }
  }, [catalogRepository, listingsRepository, listingId, chooseMeetingPoint]);

  useEffect(() => {
    void loadOffer();
  }, [loadOffer]);

  const needsOffer = listing?.modality === 'trade' && Boolean(listingsRepository);
  const offeredListing = offerOptions.find((item) => item.id === offeredListingId) ?? null;

  const isFormValid = useMemo(() => {
    return (
      publicLocation.trim().length > 0 &&
      VALID_DATE.test(meetingDate) &&
      VALID_TIME.test(meetingTime) &&
      (!needsOffer || offeredListing !== null)
    );
  }, [publicLocation, meetingDate, meetingTime, needsOffer, offeredListing]);

  /** Do 03.05 para o 06.04: só segue com um livro escolhido. */
  const continueToMeeting = useCallback(() => {
    if (offeredListing) setStep('meeting');
  }, [offeredListing]);

  const backToOffer = useCallback(() => {
    if (needsOffer) setStep('offer');
  }, [needsOffer]);

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
        const current = await catalogRepository.getById(listingId);
        ensureCanCreate(current, session.user.id);
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
          meetingPoint,
          meetingDate,
          meetingTime,
          offeredListingId: needsOffer ? offeredListingId : null,
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
    meetingPoint,
    meetingDate,
    meetingTime,
    needsOffer,
    offeredListingId,
  ]);

  return {
    // Troca
    listing,
    step,
    needsOffer,
    offerStatus,
    offerOptions,
    offeredListingId,
    offeredListing,
    chooseOffer: setOfferedListingId,
    continueToMeeting,
    backToOffer,
    retryOffer: loadOffer,
    // Estado do formulário
    publicLocation,
    setPublicLocation,
    meetingPoint,
    chooseMeetingPoint,
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
