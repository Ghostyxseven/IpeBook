import { useCallback, useMemo, useState } from 'react';
import type { BookLookup } from '../model/entities/BookLookup';
import type { MyListing } from '../model/entities/Listing';
import { toListingError } from '../model/entities/ListingError.ts';
import { fillFromLookup } from '../model/services/bookLookup.ts';
import { listingErrorMessage } from '../model/services/listingMessages.ts';
import type { CoverFile, ListingsRepository } from '../model/repositories/ListingsRepository';
import { useAsyncAction } from './useAsyncAction.ts';
import {
  validateBookStep,
  validateModalityStep,
  type ListingErrors,
} from '../model/services/listingValidation.ts';
import { useListingForm } from './useListingForm.ts';

/**
 * As etapas do Anunciar livro no Figma (04.01, 04.04 e 04.05). Ficam aqui, e não no
 * formulário compartilhado, porque a edição continua com os passos dela.
 */
export const publishSteps = ['livro', 'fotos', 'detalhes'] as const;
export type PublishStep = (typeof publishSteps)[number];

/** Campos que cada etapa mostra; o erro de um campo só aparece na etapa dele. */
const fieldsOf: Record<PublishStep, readonly (keyof ListingErrors)[]> = {
  livro: ['title', 'author', 'modality', 'priceCents', 'tradeTerms'],
  fotos: [],
  detalhes: ['category', 'condition'],
};

/** A foto escolhida: os bytes que vão subir e o endereço local só para mostrar. */
export type PickedCover = { file: CoverFile; previewUri: string };

/**
 * Publicar anúncio (spec 025) como no Figma: livro e modalidade → fotos → detalhes → publicar.
 *
 * Uma etapa só avança com os campos dela válidos, e tentar avançar é o que
 * acende os erros: antes disso o formulário fica limpo.
 */
export function usePublishListingViewModel(repository: ListingsRepository) {
  const form = useListingForm();
  const [index, setIndex] = useState(0);
  const [tried, setTried] = useState<Partial<Record<PublishStep, boolean>>>({});
  const [cover, setCover] = useState<PickedCover | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState<MyListing | null>(null);
  // A leitura de ISBN (spec 030) é um estado desta tela, não uma rota: uma rota
  // desmontaria o formulário e levaria junto o rascunho já digitado.
  const [scanning, setScanning] = useState(false);
  const [submitting, run] = useAsyncAction();

  const step = publishSteps[index] as PublishStep;
  const { draft } = form;

  // A validação é a mesma da edição; aqui só é reagrupada pelas etapas do Figma.
  const allErrors = useMemo<ListingErrors>(
    () => ({ ...validateBookStep(draft), ...validateModalityStep(draft) }),
    [draft],
  );

  const rawErrorsOf = useCallback(
    (target: PublishStep): ListingErrors =>
      Object.fromEntries(
        Object.entries(allErrors).filter(([field]) =>
          fieldsOf[target].includes(field as keyof ListingErrors),
        ),
      ),
    [allErrors],
  );

  const stepErrors = useCallback(
    (target: PublishStep): ListingErrors => (tried[target] ? rawErrorsOf(target) : {}),
    [tried, rawErrorsOf],
  );

  const next = useCallback(() => {
    setTried((previous) => ({ ...previous, [step]: true }));
    if (Object.keys(rawErrorsOf(step)).length > 0) return false;
    setIndex((current) => Math.min(current + 1, publishSteps.length - 1));
    return true;
  }, [step, rawErrorsOf]);

  const openScanner = useCallback(() => setScanning(true), []);
  const closeScanner = useCallback(() => setScanning(false), []);

  /** "Usar estes dados" da 04.03: entra só no que está vazio (`fillFromLookup`). */
  const applyLookup = useCallback(
    (book: BookLookup) => {
      const filled = fillFromLookup(draft, book);
      form.setText('title', filled.title);
      form.setText('author', filled.author);
      setScanning(false);
    },
    [draft, form],
  );

  const back = useCallback(() => {
    setError(null);
    setIndex((current) => Math.max(current - 1, 0));
  }, []);

  const submit = useCallback(
    () =>
      run(async () => {
        setError(null);
        setTried({ livro: true, detalhes: true });
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
    stepCount: publishSteps.length,
    isFirst: index === 0,
    isLast: index === publishSteps.length - 1,
    stepErrors,
    next,
    back,
    cover,
    pickCover: setCover,
    clearCover: () => setCover(null),
    submitting,
    submit,
    error,
    published,
    scanning,
    openScanner,
    closeScanner,
    applyLookup,
  };
}
