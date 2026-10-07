import { useCallback, useEffect, useRef, useState } from 'react';
import type { DraftRecord } from '../model/entities/Draft';
import { toDraftError } from '../model/entities/Draft.ts';
import type { DraftsRepository } from '../model/repositories/DraftsRepository';
import { draftErrorMessage } from '../model/services/draftMessages.ts';
import { useAsyncAction } from './useAsyncAction.ts';

export type DraftsStatus = 'loading' | 'ready' | 'error';

/** Rascunhos (spec 032, Figma 04.11, 04.15 e 04.16): listar, retomar e descartar. */
export function useDraftsViewModel(repository: DraftsRepository) {
  const [drafts, setDrafts] = useState<DraftRecord[]>([]);
  const [status, setStatus] = useState<DraftsStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [discarding, run] = useAsyncAction();
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    setStatus('loading');
    try {
      const result = await repository.list();
      if (current !== requestId.current) return;
      setDrafts(result);
      setError(null);
      setStatus('ready');
    } catch (cause) {
      if (current !== requestId.current) return;
      setError(draftErrorMessage(toDraftError(cause).code));
      setStatus('error');
    }
  }, [repository]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Descartar não tem desfazer; quem chama já confirmou pelo quadro 04.15. */
  const discard = useCallback(
    (id: string) =>
      run(async () => {
        setActionError(null);
        try {
          await repository.remove(id);
          await load();
        } catch (cause) {
          setActionError(draftErrorMessage(toDraftError(cause).code));
        }
      }),
    [run, repository, load],
  );

  return { drafts, status, error, retry: load, discard, discarding, actionError };
}
