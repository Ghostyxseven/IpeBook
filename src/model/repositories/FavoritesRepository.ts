/** Favoritos de quem está na conta. Todas as operações rejeitam com `FavoriteError`. */
export interface FavoritesRepository {
  /** Todos os ids favoritados por quem está na conta, para marcar os cards de uma vez. */
  listFavoriteIds(): Promise<string[]>;
  add(listingId: string): Promise<void>;
  remove(listingId: string): Promise<void>;
}
