import { useCallback, useEffect, useState } from 'react';
import { toFavoriteError } from '../model/entities/FavoriteError.ts';
import type { FavoritesRepository } from '../model/repositories/FavoritesRepository.ts';
import { favoriteErrorMessage } from '../model/services/favoriteMessages.ts';

export type FavoritesStatus = 'loading' | 'ready' | 'error';

/**
 * Favoritos de quem está na conta (Figma 37): um coração nos cards e no Detalhe. Marcar
 * e desmarcar muda a tela na hora (otimista) e volta atrás se o servidor recusar — não
 * há um estado "salvando" visível, como o próprio coração do Figma não tem.
 */
export function useFavoritesViewModel(repository: FavoritesRepository) {
  const [ids, setIds] = useState<ReadonlySet<string>>(new Set());
  const [status, setStatus] = useState<FavoritesStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setIds(new Set(await repository.listFavoriteIds()));
      setStatus('ready');
    } catch {
      // A tela de catálogo já mostra o livro sem o coração marcado; não há erro
      // bloqueante aqui, só o favorito que não carregou.
      setStatus('error');
    }
  }, [repository]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = useCallback(
    (listingId: string) => {
      const wasFavorite = ids.has(listingId);
      setError(null);
      setIds((current) => {
        const next = new Set(current);
        if (wasFavorite) next.delete(listingId);
        else next.add(listingId);
        return next;
      });
      const action = wasFavorite ? repository.remove(listingId) : repository.add(listingId);
      action.catch((failure: unknown) => {
        // Desfaz a mudança otimista: o coração volta ao estado de antes do toque.
        setIds((current) => {
          const next = new Set(current);
          if (wasFavorite) next.add(listingId);
          else next.delete(listingId);
          return next;
        });
        setError(favoriteErrorMessage(toFavoriteError(failure).code));
      });
    },
    [ids, repository],
  );

  return {
    isFavorite: (listingId: string) => ids.has(listingId),
    toggle,
    status,
    error,
    retry: load,
  };
}
