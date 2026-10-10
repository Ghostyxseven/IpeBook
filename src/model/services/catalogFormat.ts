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
  concluido: 'Concluído',
  arquivado: 'Arquivado',
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

/** Sobretítulo do card de livro (Figma 02.01): "Venda · R$ 25,00", "Troca" ou "Doação". */
/** Valor ao lado da etiqueta no card da lista (Figma 02.02): preço, condição de troca ou "Gratuito". */
export function cardValue(listing: Pick<Listing, 'modality' | 'priceCents' | 'tradeTerms'>) {
  if (listing.modality === 'trade') return listing.tradeTerms?.trim() || 'Para trocar';
  return priceLabel(listing);
}

export function cardOverline(listing: Pick<Listing, 'modality' | 'priceCents'>) {
  const price = listing.modality === 'sale' ? priceLabel(listing) : null;
  return [modalityLabels[listing.modality], price].filter(Boolean).join(' · ');
}

/**
 * Destaque do detalhe (Figma 03.01 a 03.03): valor grande e o selo da modalidade ao lado.
 *
 * O selo é sempre a modalidade escrita — "Venda", "Troca" ou "Doação" —, como manda o
 * componente Tag do Figma ("etiqueta de modalidade e status"). A troca vinha trocada: o
 * selo dizia "Por outro livro" e o valor dizia "Troca".
 */
export function detailHeadline(listing: Pick<Listing, 'modality' | 'priceCents'>) {
  const label = modalityLabels[listing.modality];
  if (listing.modality === 'sale') {
    return { value: priceLabel(listing) ?? modalityLabels.sale, label };
  }
  if (listing.modality === 'trade') return { value: 'Por outro livro', label };
  return { value: 'Gratuito', label };
}

/**
 * Rótulo da ação principal do detalhe (Figma 03.01 a 03.03).
 *
 * As três levam à mesma tela de combinar local, dia e horário; muda só o que a pessoa
 * está pedindo, como nos quadros de cada modalidade.
 */
export function detailActionLabel(modality: Modality) {
  if (modality === 'donation') return 'Quero receber';
  if (modality === 'trade') return 'Propor troca';
  return 'Combinar encontro';
}

/**
 * Rótulo de quem ainda não entrou (Figma 03.01 a 03.03).
 *
 * Não dá para reaproveitar `detailActionLabel` aqui: ele é escrito na primeira pessoa
 * ("Quero receber") e viraria "Entrar para quero receber". Este diz o que vem depois
 * de entrar, no infinitivo.
 */
export function detailSignedOutLabel(modality: Modality) {
  if (modality === 'donation') return 'Entrar para receber o livro';
  if (modality === 'trade') return 'Entrar para propor troca';
  return 'Entrar para combinar encontro';
}

/**
 * As linhas do cartão de detalhes (Figma 03.01 a 03.03): conservação, categoria e,
 * se o anúncio tiver bairro ou cidade, onde retirar. A view escolhe o ícone de cada
 * uma pelo `label` — este serviço não conhece componente nem ícone (ADR da arquitetura
 * que tira React Native e Expo do Model).
 */
export function detailFacts(
  listing: Pick<Listing, 'condition' | 'category' | 'neighborhood' | 'city'>,
): Array<{ label: string; value: string }> {
  const facts = [
    { label: 'Conservação', value: conditionLabels[listing.condition] },
    { label: 'Categoria', value: listing.category },
  ];
  const place = locationLabel(listing);
  if (place) facts.push({ label: 'Retirada', value: place });
  return facts;
}

/**
 * Cartão informativo da troca e da doação (Figma 03.02 e 03.03): as condições de
 * quem anunciou, na troca; um aviso fixo de gratuidade, na doação. Não existe na
 * venda. Na troca, substitui o parágrafo de condições que antes entrava na
 * descrição — fica só aqui agora, para não repetir a informação.
 */
export function detailModalityNote(
  listing: Pick<Listing, 'modality' | 'tradeTerms'>,
): { title: string; text: string } | null {
  if (listing.modality === 'trade') {
    return {
      title: 'Aceita em troca',
      text: listing.tradeTerms?.trim() || 'Combine o livro oferecido pela conversa.',
    };
  }
  if (listing.modality === 'donation') {
    return {
      title: 'Doação para quem vai ler',
      text: 'Sem cobrança pelo exemplar. Retirada em local público, combinada pelo chat.',
    };
  }
  return null;
}

/** Índice estável (0 a `count - 1`) para escolher a cor da capa ilustrativa pelo id. */
export function coverIndex(id: string, count: number) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return count > 0 ? hash % count : 0;
}

/** Linha de apoio dos cards: "Bom estado · Centro, Picos" (sem localização, só o estado). */
export function listingMeta(listing: Pick<Listing, 'condition' | 'neighborhood' | 'city'>) {
  return [conditionLabels[listing.condition], locationLabel(listing)].filter(Boolean).join(' · ');
}

/** Tudo o que a tela de detalhe mostra, já decidido pelas regras de cada modalidade. */
export type ListingDetails = {
  headline: { value: string; label: string };
  /** Cartão de conservação, categoria e retirada (Figma 03.01 a 03.03). */
  facts: Array<{ label: string; value: string }>;
  /** Cartão de condições da troca ou aviso de gratuidade da doação; nada na venda. */
  modalityNote: { title: string; text: string } | null;
  /** Só a descrição de quem anunciou; condições de troca saíram para `modalityNote`. */
  paragraphs: string[];
  /** "Ana · Centro, Picos", ou `null` sem nome nem localização. */
  owner: string | null;
  /** "Capa ilustrativa · Publicado em …" */
  notes: string;
};

export function listingDetails(listing: Listing): ListingDetails {
  const paragraphs = [listing.description].filter((text): text is string => Boolean(text?.trim()));
  const owner = [listing.ownerFirstName, locationLabel(listing)].filter(Boolean).join(' · ');
  const notes = [listing.coverUrl ? null : 'Capa ilustrativa', publishedLabel(listing.createdAt)]
    .filter(Boolean)
    .join(' · ');
  return {
    headline: detailHeadline(listing),
    facts: detailFacts(listing),
    modalityNote: detailModalityNote(listing),
    paragraphs,
    owner: owner || null,
    notes,
  };
}
