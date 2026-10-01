/**
 * Monta as dependências reais do catálogo (padrão Factory da disciplina).
 * As telas usam estes hooks e não conhecem o Supabase.
 */
import { createSupabaseCatalogRepository } from '../model/repositories/supabaseCatalogRepository';
import { supabase } from '../model/repositories/supabaseClient';
import { useCatalogFeedViewModel } from '../viewmodel/useCatalogFeedViewModel';
import { useCatalogSearchViewModel } from '../viewmodel/useCatalogSearchViewModel';
import { useListingDetailViewModel } from '../viewmodel/useListingDetailViewModel';

export const catalogRepository = createSupabaseCatalogRepository(supabase);

export const useCatalogFeed = () => useCatalogFeedViewModel(catalogRepository);
export const useCatalogSearch = (initialCategory?: string | null) =>
  useCatalogSearchViewModel(catalogRepository, { initialCategory });
export const useListingDetail = (id: string) => useListingDetailViewModel(catalogRepository, id);
