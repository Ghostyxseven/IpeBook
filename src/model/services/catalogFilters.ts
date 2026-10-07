import type { CatalogFilters, ListingCondition, Modality } from '../entities/Listing';
import { conditionLabels, formatBRL, modalityLabels } from './catalogFormat.ts';

export const MIN_QUERY_LENGTH = 2;

/** Texto pronto para a busca, ou `''` quando ainda é curto demais para filtrar. */
export function normalizeQuery(query: string) {
  const text = query.trim().replace(/\s+/g, ' ');
  return text.length >= MIN_QUERY_LENGTH ? text : '';
}

/** Conservações na ordem do Figma 02.03, da melhor para a mais gasta. */
export const CONDITION_ORDER: ListingCondition[] = ['novo', 'como_novo', 'bom', 'marcas_de_uso'];

/** Teto do controle de preço (Figma 02.03) e o passo de cada ajuste, em centavos. */
export const MAX_PRICE_CENTS = 20000;
export const PRICE_STEP_CENTS = 500;

/** Mantém o preço dentro da faixa do controle, no passo, ou `null` quando não limita. */
export function normalizeMaxPrice(cents: number | null | undefined): number | null {
  if (cents == null || !Number.isFinite(cents) || cents <= 0) return null;
  const stepped = Math.round(cents / PRICE_STEP_CENTS) * PRICE_STEP_CENTS;
  return Math.min(Math.max(stepped, PRICE_STEP_CENTS), MAX_PRICE_CENTS);
}

/** Filtros efetivamente aplicados: busca curta é ignorada e as listas ficam sem repetição. */
export function effectiveFilters(filters: CatalogFilters): CatalogFilters {
  const conditions = new Set(filters.conditions ?? []);
  return {
    query: normalizeQuery(filters.query),
    modalities: [...new Set(filters.modalities)],
    category: filters.category,
    // Ordem canônica: o resumo e a consulta não dependem da ordem de toque.
    conditions: CONDITION_ORDER.filter((condition) => conditions.has(condition)),
    maxPriceCents: normalizeMaxPrice(filters.maxPriceCents),
  };
}

export function activeFilterCount(filters: CatalogFilters) {
  const effective = effectiveFilters(filters);
  return (
    effective.modalities.length +
    (effective.category ? 1 : 0) +
    effective.conditions.length +
    (effective.maxPriceCents != null ? 1 : 0)
  );
}

export function hasActiveSearch(filters: CatalogFilters) {
  return normalizeQuery(filters.query) !== '' || activeFilterCount(filters) > 0;
}

export function toggleModality(modalities: Modality[], modality: Modality) {
  return modalities.includes(modality)
    ? modalities.filter((item) => item !== modality)
    : [...modalities, modality];
}

export function toggleCondition(conditions: ListingCondition[], condition: ListingCondition) {
  return conditions.includes(condition)
    ? conditions.filter((item) => item !== condition)
    : [...conditions, condition];
}

/** "Até R$ 30" do controle de preço; sem teto, a faixa inteira. */
export function maxPriceLabel(cents: number | null) {
  return cents == null ? 'Qualquer preço' : `Até ${formatBRL(cents)}`;
}

/** Escapa curingas do `ilike` para a busca procurar o texto literal. */
export function toLikePattern(query: string) {
  return `%${query.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

const modalityTitles: Record<Modality, string> = {
  sale: 'Livros à venda.',
  trade: 'Livros para troca.',
  donation: 'Livros para doação.',
};

/** Título do Explorar (Figma 03, 12 e 26 a 28). */
export function exploreTitle(filters: CatalogFilters, empty: boolean) {
  if (empty && hasActiveSearch(filters)) return 'Ainda não encontramos.';
  const { modalities } = effectiveFilters(filters);
  return modalities.length === 1 ? modalityTitles[modalities[0]] : 'O que vamos ler hoje?';
}

/** "3 livros · Mais recentes" ou "1 livro · Venda"; sem total conhecido, só a ordem ou o filtro. */
export function resultSummary(total: number | null, filters: CatalogFilters) {
  const { modalities, category, conditions, maxPriceCents } = effectiveFilters(filters);
  const parts = [
    modalities.map((modality) => modalityLabels[modality]).join(', '),
    category ?? '',
    conditions.map((condition) => conditionLabels[condition]).join(', '),
    maxPriceCents != null ? maxPriceLabel(maxPriceCents) : '',
  ].filter(Boolean);
  const scope = parts.length ? parts.join(' · ') : 'Mais recentes';
  if (total == null) return scope;
  return `${total} ${total === 1 ? 'livro' : 'livros'} · ${scope}`;
}
