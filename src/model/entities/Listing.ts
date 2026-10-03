/** Modalidades do anúncio (ADR 0008). Os rótulos em português ficam em `catalogFormat`. */
export type Modality = 'sale' | 'trade' | 'donation';

export type ListingCondition = 'novo' | 'como_novo' | 'bom' | 'marcas_de_uso';

/** Todas as situações aceitas no banco (conforme migration do ADR 0008).
 * Apenas `disponivel` e `reservado` chegam ao catálogo público; `concluido`
 * e `arquivado` são usados apenas por gestão e negociação. */
export type ListingStatus = 'disponivel' | 'reservado' | 'concluido' | 'arquivado';

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
  ownerId: string | null;
  ownerFirstName: string | null;
  /** Data ISO 8601. */
  createdAt: string;
};

export type CatalogFilters = {
  query: string;
  modalities: Modality[];
  category: string | null;
  /** "Somente bom estado" do Figma 02.03: novo, como novo ou bom. */
  goodCondition?: boolean;
};

export const emptyFilters: CatalogFilters = {
  query: '',
  modalities: [],
  category: null,
  goodCondition: false,
};

// ── Anúncios de quem publicou (spec 025) ────────────────────────────────────

/**
 * As quatro situações que o banco aceita (ADR 0008).
 *
 * Existe separado do `ListingStatus` de propósito: aquele descreve o que CHEGA
 * ao catálogo, e só duas situações chegam. Alargá-lo obrigaria `statusLabels`
 * em `catalogFormat.ts` a crescer junto — arquivo da feature de catálogo, que
 * não tem nada a ver com esta mudança.
 */
export type MyListingStatus = ListingStatus | 'concluido' | 'arquivado';

/**
 * O anúncio visto por quem o publicou.
 *
 * Difere do `Listing` do catálogo em três pontos: não traz `ownerFirstName`
 * (quem vê é o dono), carrega a situação completa, e guarda o `coverPath` —
 * o caminho no bucket, sem o qual não há como apagar a foto depois.
 */
export type MyListing = Omit<Listing, 'status' | 'ownerFirstName'> & {
  status: MyListingStatus;
  coverPath: string | null;
};

/** O que o formulário produz, antes de virar linha. */
export type ListingDraft = {
  title: string;
  author: string;
  category: string;
  modality: Modality;
  /** Em centavos. Só na venda; `null` nas outras — o banco recusa o contrário. */
  priceCents: number | null;
  /** Só na troca. */
  tradeTerms: string | null;
  condition: ListingCondition;
  neighborhood: string | null;
  city: string | null;
  description: string | null;
};

/** Situações em que o anúncio ainda é do dono para mexer. */
export function isEditable(status: MyListingStatus): boolean {
  return status === 'disponivel';
}
