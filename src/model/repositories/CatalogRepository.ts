import type { CatalogFilters, Listing } from '../entities/Listing';

/** Posição do último item carregado; a próxima página começa logo depois dele. */
export type CatalogCursor = { createdAt: string; id: string };

/** `total` só vem na primeira página (sem cursor); nas seguintes é `null`. */
export type CatalogPage = {
  items: Listing[];
  nextCursor: CatalogCursor | null;
  total: number | null;
};

/**
 * Contrato de leitura do catálogo usado pelas ViewModels.
 * A busca por texto procura no título, no autor e na categoria.
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
