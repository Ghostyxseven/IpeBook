import type { DraftRecord } from '../entities/Draft';
import type { ListingDraft } from '../entities/Listing';

/**
 * Rascunhos de anúncio (ADR 0030). Rejeita com `DraftError`.
 *
 * `Promise` mesmo onde a implementação de hoje é síncrona: é o que permite
 * trocar o aparelho por um servidor sem tocar em ViewModel nem em tela.
 */
export interface DraftsRepository {
  /** Mais recente primeiro. */
  list(): Promise<DraftRecord[]>;
  /** Grava um rascunho novo e devolve o registro criado. */
  save(draft: ListingDraft): Promise<DraftRecord>;
  /** Substitui um rascunho existente; rejeita com `not_found` se ele sumiu. */
  update(id: string, draft: ListingDraft): Promise<DraftRecord>;
  remove(id: string): Promise<void>;
}
