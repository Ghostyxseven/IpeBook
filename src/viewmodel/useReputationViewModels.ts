import { useCallback, useEffect, useRef, useState } from 'react';
import type { HistoryEntry, PublicProfile, ReceivedRating } from '../model/entities/Rating';
import { toReputationError } from '../model/entities/Rating.ts';
import type { ReputationRepository } from '../model/repositories/ReputationRepository';
import { reputationErrorMessage } from '../model/services/reputationMessages.ts';
import { useAsyncAction } from './useAsyncAction.ts';

export type LoadStatus = 'loading' | 'ready' | 'error';

/**
 * O carregamento que as três telas desta spec compartilham.
 *
 * Mesmo desenho do `useListingDetailViewModel`: `requestId` descarta resposta
 * velha quando a pessoa toca em "Tentar de novo" antes de a primeira chegar.
 */
function useLoad<T>(load: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const run = useCallback(async () => {
    const current = ++requestId.current;
    setStatus('loading');
    try {
      const result = await load();
      if (current !== requestId.current) return;
      setData(result);
      setError(null);
      setStatus('ready');
    } catch (cause) {
      if (current !== requestId.current) return;
      setError(reputationErrorMessage(toReputationError(cause).code));
      setStatus('error');
    }
  }, [load]);

  useEffect(() => {
    void run();
  }, [run]);

  return { data, status, error, retry: run };
}

/** Perfil de outra pessoa (Figma 03.04). */
export function usePublicProfileViewModel(repository: ReputationRepository, userId: string) {
  const loadProfile = useCallback(() => repository.getPublicProfile(userId), [repository, userId]);
  const profile = useLoad<PublicProfile | null>(loadProfile, null);
  return {
    profile: profile.data,
    status: profile.status,
    error: profile.error,
    retry: profile.retry,
  };
}

/** Avaliações recebidas (Figma 07.03). */
export function useRatingsReceivedViewModel(repository: ReputationRepository, userId: string) {
  const loadProfile = useCallback(() => repository.getPublicProfile(userId), [repository, userId]);
  const loadRatings = useCallback(
    () => repository.listRatingsReceived(userId),
    [repository, userId],
  );
  const profile = useLoad<PublicProfile | null>(loadProfile, null);
  const ratings = useLoad<ReceivedRating[]>(loadRatings, []);

  return {
    profile: profile.data,
    ratings: ratings.data,
    // Uma tela, um estado: enquanto qualquer das duas leituras não voltou, a
    // tela está carregando; se qualquer uma falhou, está em erro.
    status:
      profile.status === 'error' || ratings.status === 'error'
        ? ('error' as const)
        : profile.status === 'loading' || ratings.status === 'loading'
          ? ('loading' as const)
          : ('ready' as const),
    error: profile.error ?? ratings.error,
    retry: useCallback(() => {
      void profile.retry();
      void ratings.retry();
    }, [profile, ratings]),
  };
}

/**
 * Avaliar logo no fim da negociação (spec 028), sem passar pelo Histórico.
 *
 * O que a tela precisa saber — se já avaliei e quem é o outro lado — já vem em
 * `listMyHistory`, então não há método novo no repositório: a negociação recém-concluída
 * é uma entrada desse histórico. Enquanto ela não aparecer, a tela não oferece nada.
 */
export function useCompletionRatingViewModel(repository: ReputationRepository, requestId: string) {
  const load = useCallback(() => repository.listMyHistory(), [repository]);
  const history = useLoad<HistoryEntry[]>(load, []);
  const [submitting, run] = useAsyncAction();
  const [error, setError] = useState<string | null>(null);
  const [justRated, setJustRated] = useState(false);

  const entry = history.data.find((item) => item.requestId === requestId) ?? null;
  // Sem o outro lado (conta excluída) não há a quem avaliar.
  const canRate = Boolean(entry && !entry.rated && entry.otherPersonId) && !justRated;

  const rate = useCallback(
    (score: number, comment: string | null) =>
      run(async () => {
        setError(null);
        if (!entry?.otherPersonId) return;
        try {
          await repository.rate(entry.requestId, entry.otherPersonId, score, comment);
          setJustRated(true);
        } catch (cause) {
          setError(reputationErrorMessage(toReputationError(cause).code));
        }
      }),
    [run, repository, entry],
  );

  return {
    status: history.status,
    canRate,
    /** `true` depois de enviar, para a tela agradecer sem recarregar o histórico. */
    justRated,
    otherFirstName: entry?.otherFirstName ?? null,
    submitting,
    error,
    rate,
    /**
     * O histórico é lido uma vez, ao montar a tela. Quem conclui a negociação nessa
     * mesma tela muda o status local sem passar por `listMyHistory()` de novo, então
     * a negociação recém-concluída ainda não está no retrato que este hook já tinha.
     * A tela chama isto quando percebe a conclusão, para o convite aparecer na hora.
     */
    retry: history.retry,
  };
}

/** Histórico das negociações concluídas de quem está na conta. */
export function useHistoryViewModel(repository: ReputationRepository) {
  const load = useCallback(() => repository.listMyHistory(), [repository]);
  const history = useLoad<HistoryEntry[]>(load, []);
  const [submitting, run] = useAsyncAction();
  const [actionError, setActionError] = useState<string | null>(null);

  /** Avaliar o outro lado. Recarrega o histórico para o item sair do "a avaliar". */
  const rate = useCallback(
    (entry: HistoryEntry, score: number, comment: string | null) =>
      run(async () => {
        setActionError(null);
        if (!entry.otherPersonId) return;
        try {
          await repository.rate(entry.requestId, entry.otherPersonId, score, comment);
          await history.retry();
        } catch (cause) {
          setActionError(reputationErrorMessage(toReputationError(cause).code));
        }
      }),
    [run, repository, history],
  );

  return {
    history: history.data,
    status: history.status,
    error: history.error,
    retry: history.retry,
    rate,
    submitting,
    actionError,
  };
}
