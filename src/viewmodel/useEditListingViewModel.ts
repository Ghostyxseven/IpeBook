import { useCallback, useEffect, useState } from 'react';
import type { ListingDraft, MyListing } from '../model/entities/Listing';
import { isEditable } from '../model/entities/Listing.ts';
import { toListingError } from '../model/entities/ListingError.ts';
import { lockedReason } from '../model/services/listingFormat.ts';
import { listingErrorMessage } from '../model/services/listingMessages.ts';
import type { CoverChange, ListingsRepository } from '../model/repositories/ListingsRepository';
import { useAsyncAction } from './useAsyncAction.ts';
import { useListingForm } from './useListingForm.ts';
import type { PickedCover } from './usePublishListingViewModel.ts';

type Status = 'loading' | 'ready' | 'error';

const draftOf = (listing: MyListing): ListingDraft => ({
  title: listing.title,
  author: listing.author,
  category: listing.category,
  modality: listing.modality,
  priceCents: listing.priceCents,
  tradeTerms: listing.tradeTerms,
  condition: listing.condition,
  neighborhood: listing.neighborhood,
  city: listing.city,
  description: listing.description,
});

/** Editar um anúncio: o mesmo formulário, já preenchido (spec 025, Figma 38 e 40). */
export function useEditListingViewModel(repository: ListingsRepository, id: string) {
  const form = useListingForm();
  const [listing, setListing] = useState<MyListing | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [cover, setCover] = useState<PickedCover | null>(null);
  const [coverCleared, setCoverCleared] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [saving, run] = useAsyncAction();
  const { reset } = form;

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setLoadError(null);
    repository.getMineById(id).then(
      (found) => {
        if (!active) return;
        setListing(found);
        reset(draftOf(found));
        setStatus('ready');
      },
      (failure) => {
        if (!active) return;
        setLoadError(listingErrorMessage(toListingError(failure).code));
        setStatus('error');
      },
    );
    return () => {
      active = false;
    };
  }, [repository, id, attempt, reset]);

  const pickCover = useCallback((picked: PickedCover) => {
    setCover(picked);
    setCoverCleared(false);
  }, []);

  const clearCover = useCallback(() => {
    setCover(null);
    setCoverCleared(true);
  }, []);

  const change = useCallback((): CoverChange => {
    if (cover) return { kind: 'replace', file: cover.file };
    return coverCleared ? { kind: 'clear' } : { kind: 'keep' };
  }, [cover, coverCleared]);

  const save = useCallback(
    () =>
      run(async () => {
        setError(null);
        setSaved(false);
        form.markTouched('book');
        form.markTouched('modality');
        if (!form.complete()) {
          setError(listingErrorMessage('invalid'));
          return;
        }
        try {
          const updated = await repository.update(id, form.toSubmit(), change());
          setListing(updated);
          setCover(null);
          setCoverCleared(false);
          setSaved(true);
        } catch (failure) {
          setError(listingErrorMessage(toListingError(failure).code));
        }
      }),
    [run, form, repository, id, change],
  );

  // O anúncio pode ter sido reservado depois que a tela abriu: a trava é olhada
  // na situação lida, não no que a lista mostrava antes.
  const locked = listing ? !isEditable(listing.status) : false;

  return {
    ...form,
    status,
    listing,
    loadError,
    retry: () => setAttempt((value) => value + 1),
    locked,
    lockedReason: listing ? lockedReason(listing.status) : null,
    cover,
    coverCleared,
    pickCover,
    clearCover,
    saving,
    save,
    error,
    saved,
  };
}
