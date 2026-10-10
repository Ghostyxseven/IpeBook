import { useCallback, useMemo, useState } from 'react';
import type { BookLookup } from '../model/entities/BookLookup';
import type { DraftRecord } from '../model/entities/Draft';
import { DraftError, toDraftError } from '../model/entities/Draft.ts';
import type { MyListing } from '../model/entities/Listing';
import { toListingError } from '../model/entities/ListingError.ts';
import { fillFromLookup } from '../model/services/bookLookup.ts';
import { listingErrorMessage } from '../model/services/listingMessages.ts';
import type { DraftsRepository } from '../model/repositories/DraftsRepository';
import type { CoverFile, ListingsRepository } from '../model/repositories/ListingsRepository';
import { draftErrorMessage } from '../model/services/draftMessages.ts';
import { missingFields } from '../model/services/draftSummary.ts';
import { useAsyncAction } from './useAsyncAction.ts';
import {
  emptyDraft,
  validateDraft,
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
  detalhes: ['category', 'condition', 'meetingPoint'],
};

/** A foto escolhida: os bytes que vão subir e o endereço local só para mostrar. */
export type PickedCover = { file: CoverFile; previewUri: string };

/**
 * Publicar anúncio (spec 025) como no Figma: livro e modalidade → fotos → detalhes → publicar.
 *
 * Uma etapa só avança com os campos dela válidos, e tentar avançar é o que
 * acende os erros: antes disso o formulário fica limpo.
 */
export function usePublishListingViewModel(
  repository: ListingsRepository,
  drafts?: DraftsRepository,
) {
  const form = useListingForm();
  const [index, setIndex] = useState(0);
  const [tried, setTried] = useState<Partial<Record<PublishStep, boolean>>>({});
  const [cover, setCover] = useState<PickedCover | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState<MyListing | null>(null);
  // A leitura de ISBN (spec 030) é um estado desta tela, não uma rota: uma rota
  // desmontaria o formulário e levaria junto o rascunho já digitado.
  const [scanning, setScanning] = useState(false);
  // O rascunho recém-guardado (quadro 04.14) e o que foi retomado, para que
  // salvar de novo atualize em vez de criar um segundo.
  const [savedDraft, setSavedDraft] = useState<DraftRecord | null>(null);
  const [resumedId, setResumedId] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  // 04.19: publicar falhou por rede COM foto escolhida. É o único caso em que
  // o quadro aparece — erro de validação ou de regra não é problema de envio.
  const [uploadFailed, setUploadFailed] = useState(false);
  const [submitting, run] = useAsyncAction();

  const step = publishSteps[index] as PublishStep;
  const { draft } = form;

  // A validação é a mesma da edição; aqui só é reagrupada pelas etapas do Figma.
  const allErrors = useMemo<ListingErrors>(() => validateDraft(draft), [draft]);

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

  /**
   * Há algo a perder ao sair? É o que decide se o quadro 04.13 aparece.
   *
   * "Algo" é qualquer coisa que a pessoa tenha digitado ou escolhido — inclusive
   * uma foto. Perguntar num formulário intocado seria atrapalhar quem só abriu
   * a tela por engano.
   */
  const hasContent = useMemo(() => {
    const missing = missingFields(draft).length;
    const untouched = missingFields(emptyDraft()).length;
    return missing < untouched || Boolean(cover) || form.priceInput.trim().length > 0;
  }, [draft, cover, form.priceInput]);

  /** "Salvar" do quadro 04.13. Sem repositório de rascunho, não faz nada. */
  const saveDraft = useCallback(
    () =>
      run(async () => {
        if (!drafts) return;
        setDraftError(null);
        try {
          const record = resumedId
            ? await drafts.update(resumedId, draft)
            : await drafts.save(draft);
          setResumedId(record.id);
          setSavedDraft(record);
        } catch (cause) {
          setDraftError(draftErrorMessage(toDraftError(cause).code));
        }
      }),
    [run, drafts, draft, resumedId],
  );

  /** "Retomar anúncio": o formulário volta preenchido, na etapa 1 (quadro 04.12). */
  const resume = useCallback(
    (record: DraftRecord) => {
      form.reset(record.draft);
      setResumedId(record.id);
      setSavedDraft(null);
      setIndex(0);
      setTried({});
    },
    [form],
  );

  /** O mesmo, a partir do id que a tela de rascunhos manda pela rota. */
  const resumeDraft = useCallback(
    async (id: string) => {
      if (!drafts) return;
      setDraftError(null);
      try {
        const found = (await drafts.list()).find((record) => record.id === id);
        if (!found) throw new DraftError('not_found');
        resume(found);
      } catch (cause) {
        setDraftError(draftErrorMessage(toDraftError(cause).code));
      }
    },
    [drafts, resume],
  );

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
        setUploadFailed(false);
        setTried({ livro: true, detalhes: true });
        if (!form.complete()) {
          setError(listingErrorMessage('invalid'));
          return;
        }
        try {
          setPublished(await repository.create(form.toSubmit(), cover?.file ?? null));
        } catch (failure) {
          const code = toListingError(failure).code;
          // Com foto e sem rede, o quadro 04.19 diz o que falhou e o que sobrou.
          // Sem foto, a mesma falha é só uma mensagem no rodapé do formulário.
          if (code === 'network' && cover) setUploadFailed(true);
          else setError(listingErrorMessage(code));
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
    hasContent,
    uploadFailed,
    dismissUploadFailure: () => setUploadFailed(false),
    saveDraft,
    savedDraft,
    clearSavedDraft: () => setSavedDraft(null),
    resume,
    resumeDraft,
    resumedId,
    draftError,
  };
}
