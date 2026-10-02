import { useCallback, useState } from 'react';
import type { MyListing } from '../model/entities/Listing';
import { toListingError } from '../model/entities/ListingError.ts';
import { listingErrorMessage } from '../model/services/listingMessages.ts';
import type { CoverFile, ListingsRepository } from '../model/repositories/ListingsRepository';
import { useAsyncAction } from './useAsyncAction.ts';
import { steps, useListingForm, type Step } from './useListingForm.ts';

/** A foto escolhida: os bytes que vão subir e o endereço local só para mostrar. */
export type PickedCover = { file: CoverFile; previewUri: string };

/**
 * Publicar anúncio (spec 025), no pattern do design system:
 * dados do livro → modalidade → foto → revisar → publicar.
 *
 * Um passo só avança com os campos dele válidos, e tentar avançar é o que
 * acende os erros — antes disso o formulário fica limpo.
 */
export function usePublishListingViewModel(repository: ListingsRepository) {
  const form = useListingForm();
  const [index, setIndex] = useState(0);
  const [cover, setCover] = useState<PickedCover | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState<MyListing | null>(null);
  const [submitting, run] = useAsyncAction();

  const step = steps[index] as Step;

  const next = useCallback(() => {
    form.markTouched(step);
    if (!form.stepIsValid(step)) return false;
    setIndex((current) => Math.min(current + 1, steps.length - 1));
    return true;
  }, [form, step]);

  const back = useCallback(() => {
    setError(null);
    setIndex((current) => Math.max(current - 1, 0));
  }, []);

  /** Voltar para corrigir a partir da revisão, sem perder o que já foi digitado. */
  const goTo = useCallback((target: Step) => {
    setError(null);
    setIndex(steps.indexOf(target));
  }, []);

  const submit = useCallback(
    () =>
      run(async () => {
        setError(null);
        // Marca os dois passos de dados: se algo escapou, o erro precisa estar
        // visível quando a pessoa voltar para corrigir.
        form.markTouched('book');
        form.markTouched('modality');
        if (!form.complete()) {
          setError(listingErrorMessage('invalid'));
          return;
        }
        try {
          setPublished(await repository.create(form.toSubmit(), cover?.file ?? null));
        } catch (failure) {
          setError(listingErrorMessage(toListingError(failure).code));
        }
      }),
    [run, form, repository, cover],
  );

  return {
    ...form,
    step,
    stepNumber: index + 1,
    stepCount: steps.length,
    isFirst: index === 0,
    isLast: index === steps.length - 1,
    next,
    back,
    goTo,
    cover,
    pickCover: setCover,
    clearCover: () => setCover(null),
    submitting,
    submit,
    error,
    published,
  };
}
