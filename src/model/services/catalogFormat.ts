import type { Listing, ListingCondition, ListingStatus, Modality } from '../entities/Listing';

export const modalityLabels: Record<Modality, string> = {
  sale: 'Venda',
  trade: 'Troca',
  donation: 'Doação',
};

export const conditionLabels: Record<ListingCondition, string> = {
  novo: 'Novo',
  como_novo: 'Como novo',
  bom: 'Bom estado',
  marcas_de_uso: 'Com marcas de uso',
};

export const statusLabels: Record<ListingStatus, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
};

/** Formata centavos como "R$ 1.234,50" sem depender do suporte a Intl do motor JS. */
export function formatBRL(cents: number) {
  const value = Math.round(cents);
  const reais = Math.floor(Math.abs(value) / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const centavos = String(Math.abs(value) % 100).padStart(2, '0');
  return `${value < 0 ? '-' : ''}R$ ${reais},${centavos}`;
}

/** Valor que acompanha a modalidade: preço na venda, gratuidade na doação, nada na troca. */
export function priceLabel(listing: Pick<Listing, 'modality' | 'priceCents'>) {
  if (listing.modality === 'sale') {
    return listing.priceCents != null ? formatBRL(listing.priceCents) : null;
  }
  return listing.modality === 'donation' ? 'Gratuito' : null;
}

export function locationLabel(listing: Pick<Listing, 'neighborhood' | 'city'>) {
  const parts = [listing.neighborhood, listing.city].filter((part) => part?.trim());
  return parts.length ? parts.join(', ') : null;
}

const months = [
  'jan.',
  'fev.',
  'mar.',
  'abr.',
  'mai.',
  'jun.',
  'jul.',
  'ago.',
  'set.',
  'out.',
  'nov.',
  'dez.',
];

/** "Publicado em 30 de set. de 2026", no fuso do aparelho. */
export function publishedLabel(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  return `Publicado em ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

/** Frase única lida pelo leitor de tela ao focar o Book Card. */
export function listingAccessibilityLabel(listing: Listing) {
  return [
    listing.title,
    `de ${listing.author}`,
    modalityLabels[listing.modality],
    priceLabel(listing),
    listing.status === 'reservado' ? statusLabels.reservado : null,
    conditionLabels[listing.condition],
    locationLabel(listing),
  ]
    .filter(Boolean)
    .join(', ');
}

/** Selo da lista (Figma 03): "Venda · R$ 25,00", "Disponível para troca", "Doação · Gratuito". */
export function modalitySummary(listing: Pick<Listing, 'modality' | 'priceCents'>) {
  if (listing.modality === 'trade') return 'Disponível para troca';
  const price = priceLabel(listing);
  return price
    ? `${modalityLabels[listing.modality]} · ${price}`
    : modalityLabels[listing.modality];
}

/** Valor curto do card do Início (Figma 02): preço, "Para trocar" ou "Gratuito". */
export function tileValue(listing: Pick<Listing, 'modality' | 'priceCents'>) {
  return listing.modality === 'trade' ? 'Para trocar' : priceLabel(listing);
}

/** Destaque do detalhe (Figma 04, 13 e 14): valor grande e rótulo da modalidade. */
export function detailHeadline(listing: Pick<Listing, 'modality' | 'priceCents'>) {
  if (listing.modality === 'sale') {
    return { value: priceLabel(listing) ?? modalityLabels.sale, label: 'À VENDA' };
  }
  if (listing.modality === 'trade') return { value: 'Troca', label: 'POR OUTRO LIVRO' };
  return { value: 'Gratuito', label: 'DOAÇÃO' };
}

/** "BOM ESTADO · LITERATURA BRASILEIRA" */
export function detailMeta(listing: Pick<Listing, 'condition' | 'category'>) {
  return `${conditionLabels[listing.condition]} · ${listing.category}`.toLocaleUpperCase('pt-BR');
}

/** Índice estável (0 a `count - 1`) para escolher a cor da capa ilustrativa pelo id. */
export function coverIndex(id: string, count: number) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return count > 0 ? hash % count : 0;
}
