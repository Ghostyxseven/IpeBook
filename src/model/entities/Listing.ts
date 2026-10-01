export type ListingModality = 'Venda' | 'Troca' | 'Doação';
export type ListingStatus = 'disponivel' | 'reservado' | 'concluido';
export type ListingFilter = 'Todos' | ListingModality;

type ListingBase = {
  id: string;
  title: string;
  author: string;
  category: string;
  /** Estado do exemplar, em texto livre curto (ex.: "Bom estado"). */
  condition: string;
  description: string;
  status: ListingStatus;
  coverUrl?: string;
  /** Só aparece quando a pessoa informou; nunca é inventada. */
  location?: string;
  createdAt: string;
};

/** Preço só existe em venda; troca explicita o interesse; doação é gratuita. */
export type Listing = ListingBase &
  (
    | { modality: 'Venda'; priceCents: number }
    | { modality: 'Troca'; exchangeInterest: string }
    | { modality: 'Doação' }
  );

export type CatalogErrorCode = 'network' | 'not_configured' | 'unknown';

export class CatalogError extends Error {
  readonly code: CatalogErrorCode;
  constructor(code: CatalogErrorCode, cause?: unknown) {
    super(code, { cause });
    this.name = 'CatalogError';
    this.code = code;
  }
}

export function toCatalogError(error: unknown): CatalogError {
  return error instanceof CatalogError ? error : new CatalogError('unknown', error);
}
