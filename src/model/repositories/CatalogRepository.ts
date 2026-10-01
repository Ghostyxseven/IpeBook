import type { Listing } from '../entities/Listing';

/** Contrato de acesso aos anúncios; a ViewModel só conhece esta interface. */
export interface CatalogRepository {
  list(): Promise<Listing[]>;
  /** `null` quando o anúncio não existe ou não está mais visível. */
  get(id: string): Promise<Listing | null>;
}
