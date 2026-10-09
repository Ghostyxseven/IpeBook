import { FavoriteError } from '../entities/FavoriteError.ts';
import type { FavoritesRepository } from './FavoritesRepository.ts';

/** O dublê dos testes: mesmas regras, sem Supabase. */
export function createMemoryFavoritesRepository(
  seed: { favorites?: readonly string[]; failWith?: FavoriteError } = {},
): FavoritesRepository {
  const favorites = new Set(seed.favorites ?? []);
  const fail = () => {
    if (seed.failWith) throw seed.failWith;
  };

  return {
    async listFavoriteIds() {
      fail();
      return [...favorites];
    },
    async add(listingId) {
      fail();
      favorites.add(listingId);
    },
    async remove(listingId) {
      fail();
      favorites.delete(listingId);
    },
  };
}
