/**
 * Monta as dependências reais do catálogo (padrão Factory da disciplina).
 * As telas usam estes hooks e não conhecem o Supabase.
 */
import type { Modality } from '../model/entities/Listing';
import { createSupabaseCatalogRepository } from '../model/repositories/supabaseCatalogRepository';
import { supabase } from '../model/repositories/supabaseClient';
import { useCatalogFeedViewModel } from '../viewmodel/useCatalogFeedViewModel';
import { useCatalogSearchViewModel } from '../viewmodel/useCatalogSearchViewModel';
import { useListingDetailViewModel } from '../viewmodel/useListingDetailViewModel';

export const catalogRepository = createSupabaseCatalogRepository(supabase);

export const useCatalogFeed = (userName?: string | null) =>
  useCatalogFeedViewModel(catalogRepository, { userName });
export const useCatalogSearch = (initialModality?: Modality | null) =>
  useCatalogSearchViewModel(catalogRepository, { initialModality });
export const useListingDetail = (id: string) => useListingDetailViewModel(catalogRepository, id);
