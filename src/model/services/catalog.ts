import type { Listing, ListingFilter, ListingStatus } from '../entities/Listing';
import type { CatalogErrorCode } from '../entities/Listing';

export type CatalogQuery = {
  query: string;
  modality: ListingFilter;
  /** `null` mostra todas as categorias. */
  category: string | null;
};

export type CatalogOrder = 'recentes' | 'titulo' | 'menor-preco';

export const catalogOrders: { id: CatalogOrder; label: string }[] = [
  { id: 'recentes', label: 'Mais recentes' },
  { id: 'titulo', label: 'Título (A–Z)' },
  { id: 'menor-preco', label: 'Menor preço' },
];

export const modalityFilters: ListingFilter[] = ['Todos', 'Venda', 'Troca', 'Doação'];

export const emptyQuery: CatalogQuery = { query: '', modality: 'Todos', category: null };

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('pt-BR').trim();

/** Concluídos saem da descoberta; reservados continuam visíveis e marcados. */
export const isDiscoverable = (listing: Listing) => listing.status !== 'concluido';

export function filterListings(listings: Listing[], { query, modality, category }: CatalogQuery) {
  const term = normalize(query);
  return listings.filter(
    (listing) =>
      isDiscoverable(listing) &&
      (modality === 'Todos' || listing.modality === modality) &&
      (category === null || listing.category === category) &&
      (term === '' ||
        normalize(`${listing.title} ${listing.author} ${listing.category}`).includes(term)),
  );
}

/** Doação (R$ 0) primeiro, depois venda por preço; troca não tem preço e vai por último. */
function priceRank(listing: Listing) {
  if (listing.modality === 'Doação') return 0;
  if (listing.modality === 'Venda') return listing.priceCents;
  return Number.POSITIVE_INFINITY;
}

export function sortListings(listings: Listing[], order: CatalogOrder): Listing[] {
  const copy = [...listings];
  if (order === 'titulo') {
    return copy.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }));
  }
  if (order === 'menor-preco') {
    return copy.sort(
      (a, b) =>
        priceRank(a) - priceRank(b) ||
        a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }),
    );
  }
  return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function categoriesOf(listings: Listing[]): string[] {
  return [...new Set(listings.filter(isDiscoverable).map((listing) => listing.category))].sort(
    (a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }),
  );
}

export function formatPrice(priceCents: number): string {
  return (priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Texto do Book Card: preço só na venda, gratuidade na doação, condição na troca. */
export function listingTerms(listing: Listing): string {
  if (listing.modality === 'Venda') return formatPrice(listing.priceCents);
  if (listing.modality === 'Troca') return `Troca por: ${listing.exchangeInterest}`;
  return 'Gratuito';
}

export const statusLabels: Record<ListingStatus, string | null> = {
  disponivel: null,
  reservado: 'Reservado',
  concluido: 'Concluído',
};

export function catalogErrorMessage(code: CatalogErrorCode): string {
  if (code === 'network') return 'Sem conexão. Confira a internet e tente de novo.';
  if (code === 'not_configured') return 'O catálogo ainda não está disponível nesta versão.';
  return 'Não foi possível carregar os livros agora. Tente de novo em instantes.';
}

export type DiscoverStatus = 'loading' | 'error' | 'empty' | 'no-results' | 'ready';

/** Estado único da tela de descoberta, para a View não recombinar flags. */
export function discoverStatus(input: {
  loading: boolean;
  failed: boolean;
  total: number;
  shown: number;
}): DiscoverStatus {
  if (input.loading) return 'loading';
  if (input.failed) return 'error';
  if (input.total === 0) return 'empty';
  return input.shown === 0 ? 'no-results' : 'ready';
}
