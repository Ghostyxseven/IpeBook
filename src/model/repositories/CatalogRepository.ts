import type { CatalogFilters, Listing } from '../entities/Listing';

/** Posição do último item carregado; a próxima página começa logo depois dele. */
export type CatalogCursor = { createdAt: string; id: string };

export type CatalogPage = { items: Listing[]; nextCursor: CatalogCursor | null };

/**
 * Contrato de leitura do catálogo usado pelas ViewModels.
 * Lista só anúncios disponíveis ou reservados de outras pessoas, dos mais recentes aos mais antigos.
 * Todas as operações rejeitam com `CatalogError` (ver entities/CatalogError.ts).
 */
export interface CatalogRepository {
  list(params: {
    filters: CatalogFilters;
    cursor: CatalogCursor | null;
    limit: number;
  }): Promise<CatalogPage>;
  /** Rejeita com `not_found` quando o anúncio não existe ou saiu do catálogo. */
  getById(id: string): Promise<Listing>;
}
