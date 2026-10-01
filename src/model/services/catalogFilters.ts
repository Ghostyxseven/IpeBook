import type { CatalogFilters, Modality } from '../entities/Listing';

export const MIN_QUERY_LENGTH = 2;

/** Texto pronto para a busca, ou `''` quando ainda é curto demais para filtrar. */
export function normalizeQuery(query: string) {
  const text = query.trim().replace(/\s+/g, ' ');
  return text.length >= MIN_QUERY_LENGTH ? text : '';
}

/** Filtros efetivamente aplicados: busca curta é ignorada e modalidades ficam sem repetição. */
export function effectiveFilters(filters: CatalogFilters): CatalogFilters {
  return {
    query: normalizeQuery(filters.query),
    modalities: [...new Set(filters.modalities)],
    category: filters.category,
  };
}

export function activeFilterCount(filters: CatalogFilters) {
  const effective = effectiveFilters(filters);
  return effective.modalities.length + (effective.category ? 1 : 0);
}

export function hasActiveSearch(filters: CatalogFilters) {
  return normalizeQuery(filters.query) !== '' || activeFilterCount(filters) > 0;
}

export function toggleModality(modalities: Modality[], modality: Modality) {
  return modalities.includes(modality)
    ? modalities.filter((item) => item !== modality)
    : [...modalities, modality];
}

/** Escapa curingas do `ilike` para a busca procurar o texto literal. */
export function toLikePattern(query: string) {
  return `%${query.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}
