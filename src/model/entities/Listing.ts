/** Modalidades do anúncio (ADR 0008). Os rótulos em português ficam em `catalogFormat`. */
export type Modality = 'sale' | 'trade' | 'donation';

export type ListingCondition = 'novo' | 'como_novo' | 'bom' | 'marcas_de_uso';

/** Situações visíveis no catálogo; `concluido` e `arquivado` nunca chegam aqui. */
export type ListingStatus = 'disponivel' | 'reservado';

export type Listing = {
  id: string;
  title: string;
  author: string;
  category: string;
  modality: Modality;
  /** Só na venda; em centavos para evitar arredondamento. */
  priceCents: number | null;
  /** Só na troca. */
  tradeTerms: string | null;
  condition: ListingCondition;
  neighborhood: string | null;
  city: string | null;
  description: string | null;
  coverUrl: string | null;
  status: ListingStatus;
  ownerFirstName: string | null;
  /** Data ISO 8601. */
  createdAt: string;
};

export type CatalogFilters = {
  query: string;
  modalities: Modality[];
  category: string | null;
};

export const emptyFilters: CatalogFilters = { query: '', modalities: [], category: null };
