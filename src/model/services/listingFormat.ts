import type { ListingDraft, MyListing, MyListingStatus } from '../entities/Listing';
import { formatBRL, modalityLabels } from './catalogFormat.ts';

/**
 * Reais digitados → centavos inteiros.
 *
 * Dinheiro é `integer` em centavos, nunca float: `19.90 * 100` dá 1989.9999…
 * em ponto flutuante, e um centavo perdido por anúncio vira reclamação. Por
 * isso a conta é feita sobre os dígitos, não sobre o número.
 *
 * Aceita o que as pessoas realmente digitam: "25", "25,90", "R$ 1.234,50",
 * "25.90". Devolve `null` quando não dá para ler um valor.
 */
export function parseBRLToCents(input: string): number | null {
  const cleaned = input.replace(/[^\d,.]/g, '');
  if (!cleaned) return null;

  // O último separador é o decimal; os outros são de milhar. Resolve "1.234,50"
  // e "1,234.50" sem precisar saber qual convenção a pessoa usou.
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  const decimalAt = Math.max(lastComma, lastDot);

  const digitsOf = (text: string) => text.replace(/\D/g, '');
  if (decimalAt === -1) {
    const whole = digitsOf(cleaned);
    return whole ? Number(whole) * 100 : null;
  }

  const whole = digitsOf(cleaned.slice(0, decimalAt));
  const fraction = digitsOf(cleaned.slice(decimalAt + 1));
  // Mais de dois dígitos depois do separador: era milhar, não centavo ("1.234").
  if (fraction.length > 2) return Number(digitsOf(cleaned)) * 100 || null;

  const cents = Number(fraction.padEnd(2, '0').slice(0, 2));
  return Number(whole || '0') * 100 + cents;
}

/** Centavos → o que vai no campo ao abrir a edição ("25,90"), sem o "R$". */
export function centsToInput(cents: number | null): string {
  if (cents === null) return '';
  return formatBRL(cents).replace('R$ ', '');
}

/** Rótulos das quatro situações. O catálogo só conhece duas; aqui vão todas. */
export const myStatusLabels: Record<MyListingStatus, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  concluido: 'Concluído',
  arquivado: 'Arquivado',
};

/** O que o anúncio mostra como destaque da modalidade, na revisão e na estante. */
export function modalityHighlight(draft: Pick<ListingDraft, 'modality' | 'priceCents'>): string {
  if (draft.modality === 'sale')
    return draft.priceCents === null ? '' : formatBRL(draft.priceCents);
  return draft.modality === 'trade' ? 'Troca' : 'Gratuito';
}

/** Por que o anúncio não pode ser mexido, em palavras de quem lê a tela. */
export function lockedReason(status: MyListingStatus): string | null {
  if (status === 'reservado')
    return 'Alguém já pediu este livro. Conclua ou cancele a negociação para poder editar.';
  if (status === 'concluido') return 'Este anúncio já foi concluído e fica como histórico.';
  return null;
}

// ── Minha estante (Figma 05.01 a 05.06) ─────────────────────────────────────

/**
 * As duas abas da estante que saem dos próprios anúncios: os que ainda circulam
 * (disponíveis, reservados e arquivados) e os concluídos, que ficam como histórico.
 * A aba Propostas vem das negociações, não daqui.
 */
export function shelfSections(listings: MyListing[]): {
  active: MyListing[];
  done: MyListing[];
} {
  return {
    active: listings.filter((listing) => listing.status !== 'concluido'),
    done: listings.filter((listing) => listing.status === 'concluido'),
  };
}

const DAY = 24 * 60 * 60 * 1000;

/** "publicado hoje", "publicado ontem" ou "publicado há 3 dias", contados pela data local. */
export function publishedAgo(createdAt: string, now: Date): string {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return '';
  const startOf = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = Math.max(0, Math.round((startOf(now) - startOf(created)) / DAY));
  if (days === 0) return 'publicado hoje';
  if (days === 1) return 'publicado ontem';
  return `publicado há ${days} dias`;
}

/**
 * Linha de apoio de um livro na estante (Figma 05.01: "R$ 25,00 · Centro · publicado há 2 dias · Venda").
 * Disponível termina na modalidade; nas outras situações, a situação é o que importa.
 */
export function shelfSupportingText(listing: MyListing, now: Date): string {
  const value = listing.modality === 'sale' ? modalityHighlight(listing) : '';
  const ending =
    listing.status === 'disponivel'
      ? modalityLabels[listing.modality]
      : `${modalityLabels[listing.modality]} · ${myStatusLabels[listing.status]}`;
  const when = listing.status === 'concluido' ? '' : publishedAgo(listing.createdAt, now);
  return [value, listing.neighborhood?.trim() ?? '', when, ending].filter(Boolean).join(' · ');
}
