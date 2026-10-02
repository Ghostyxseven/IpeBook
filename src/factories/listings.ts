/**
 * Monta as dependências reais da gestão de anúncios (padrão Factory da disciplina).
 * As telas usam estes hooks e não conhecem o Supabase.
 */
import { supabase } from '../infra/supabaseClient';
import { createSupabaseListingsRepository } from '../model/repositories/supabaseListingsRepository';
import { useEditListingViewModel } from '../viewmodel/useEditListingViewModel';
import { useMyListingsViewModel } from '../viewmodel/useMyListingsViewModel';
import { usePublishListingViewModel } from '../viewmodel/usePublishListingViewModel';

export const listingsRepository = createSupabaseListingsRepository(supabase);

export const usePublishListing = () => usePublishListingViewModel(listingsRepository);
export const useEditListing = (id: string) => useEditListingViewModel(listingsRepository, id);
export const useMyListings = () => useMyListingsViewModel(listingsRepository);
