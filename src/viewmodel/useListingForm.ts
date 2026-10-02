import { useCallback, useMemo, useState } from 'react';
import type { ListingCondition, ListingDraft, Modality } from '../model/entities/Listing';
import { centsToInput, parseBRLToCents } from '../model/services/listingFormat.ts';
import {
  emptyDraft,
  isValid,
  normalizeDraft,
  validateBookStep,
  validateDraft,
  validateModalityStep,
  type ListingErrors,
  type ListingField,
} from '../model/services/listingValidation.ts';

/** Os passos do pattern "Publicar anúncio", na ordem em que aparecem. */
export const steps = ['book', 'modality', 'cover', 'review'] as const;
export type Step = (typeof steps)[number];

/** Campos de texto simples do formulário. */
export type TextField = 'title' | 'author' | 'tradeTerms' | 'neighborhood' | 'description';

/**
 * O estado do formulário de anúncio, compartilhado por publicar e editar.
 *
 * O preço vive como TEXTO enquanto a pessoa digita e só vira centavos na hora
 * de validar: converter a cada tecla apagaria a vírgula no meio da digitação
 * ("25," viraria "25" e o cursor pularia).
 *
 * Os erros só aparecem depois da primeira tentativa de avançar. Marcar o campo
 * de vermelho antes de a pessoa terminar de escrever é ruído, não ajuda.
 */
export function useListingForm(initial?: ListingDraft) {
  const [draft, setDraft] = useState<ListingDraft>(initial ?? emptyDraft());
  const [priceInput, setPriceInput] = useState(() => centsToInput(initial?.priceCents ?? null));
  const [touched, setTouched] = useState<Partial<Record<Step, boolean>>>({});

  /** O rascunho com o preço já convertido — a verdade que vai para o Model. */
  const current = useMemo<ListingDraft>(
    () => ({
      ...draft,
      priceCents: draft.modality === 'sale' ? parseBRLToCents(priceInput) : null,
    }),
    [draft, priceInput],
  );

  const bookErrors = useMemo(() => validateBookStep(current), [current]);
  const modalityErrors = useMemo(() => validateModalityStep(current), [current]);

  const errorsOf = useCallback(
    (step: Step): ListingErrors => {
      if (step === 'book') return touched.book ? bookErrors : {};
      if (step === 'modality') return touched.modality ? modalityErrors : {};
      return {};
    },
    [touched, bookErrors, modalityErrors],
  );

  const stepIsValid = useCallback(
    (step: Step) => {
      if (step === 'book') return isValid(bookErrors);
      if (step === 'modality') return isValid(modalityErrors);
      return true;
    },
    [bookErrors, modalityErrors],
  );

  const setText = useCallback((field: TextField, value: string) => {
    setDraft((previous) => ({ ...previous, [field]: value }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setDraft((previous) => ({ ...previous, category }));
  }, []);

  const setCondition = useCallback((condition: ListingCondition) => {
    setDraft((previous) => ({ ...previous, condition }));
  }, []);

  /**
   * Trocar a modalidade limpa o campo da anterior já no estado.
   *
   * O `normalizeDraft` faria isso de novo antes de gravar, mas aqui serve a
   * outro propósito: a tela de revisão não pode mostrar "R$ 25,00" embaixo de
   * "Doação" enquanto a pessoa confere o que vai publicar.
   */
  const setModality = useCallback((modality: Modality) => {
    setDraft((previous) => ({
      ...previous,
      modality,
      priceCents: modality === 'sale' ? previous.priceCents : null,
      tradeTerms: modality === 'trade' ? previous.tradeTerms : null,
    }));
    if (modality !== 'sale') setPriceInput('');
  }, []);

  const markTouched = useCallback((step: Step) => {
    setTouched((previous) => ({ ...previous, [step]: true }));
  }, []);

  /**
   * Identidade estável, de propósito: a tela de edição chama `reset` dentro de
   * um efeito que depende dele. Recriado a cada render, o efeito rodaria para
   * sempre — e o teste da edição derrubou o Node provando isso.
   */
  const reset = useCallback((next?: ListingDraft) => {
    setDraft(next ?? emptyDraft());
    setPriceInput(centsToInput(next?.priceCents ?? null));
    setTouched({});
  }, []);

  return {
    draft: current,
    priceInput,
    setPriceInput,
    setText,
    setCategory,
    setCondition,
    setModality,
    errorsOf,
    stepIsValid,
    markTouched,
    /** O que vai para o repositório: aparado e com a modalidade coerente. */
    toSubmit: () => normalizeDraft(current),
    allErrors: (): ListingErrors => validateDraft(normalizeDraft(current)),
    complete: () => isValid(validateDraft(normalizeDraft(current))),
    reset,
  };
}

export type ListingFormField = ListingField;
