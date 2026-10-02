import type { ListingDraft, MyListing } from '../entities/Listing';

/**
 * Uma foto de capa pronta para subir.
 *
 * Bytes e tipo, nada de `File` nem de `Asset` do expo-image-picker: o Model não
 * conhece React Native (ADR 0002 e ADR 0012). Quem escolhe a imagem converte.
 */
export type CoverFile = {
  /** Nome original, só para deduzir a extensão. */
  readonly filename: string;
  readonly mimeType: string;
  readonly bytes: ArrayBuffer;
};

/** O que fazer com a capa ao gravar uma edição. */
export type CoverChange =
  | { readonly kind: 'keep' }
  | { readonly kind: 'replace'; readonly file: CoverFile }
  | { readonly kind: 'clear' };

/**
 * Contrato de gestão dos próprios anúncios (spec 025).
 *
 * Só mexe no que é da pessoa — a RLS do ADR 0008 garante isso do lado do banco,
 * e `not_allowed` é o que volta quando a situação não permite (reservado ou
 * concluído pertencem à negociação).
 *
 * Todas as operações rejeitam com `ListingError` (ver entities/ListingError.ts).
 */
export interface ListingsRepository {
  /** Os próprios anúncios, em todas as situações, dos mais recentes aos mais antigos. */
  listMine(): Promise<MyListing[]>;
  /** Rejeita com `not_found` quando o anúncio não existe ou não é da pessoa. */
  getMineById(id: string): Promise<MyListing>;
  create(draft: ListingDraft, cover: CoverFile | null): Promise<MyListing>;
  /** Rejeita com `not_allowed` se o anúncio não estiver `disponivel`. */
  update(id: string, draft: ListingDraft, cover: CoverChange): Promise<MyListing>;
  archive(id: string): Promise<MyListing>;
  republish(id: string): Promise<MyListing>;
  /** Apaga o anúncio E a foto. Rejeita com `not_allowed` fora de `disponivel`. */
  remove(id: string): Promise<void>;
}
