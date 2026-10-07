/**
 * Monta as dependências reais da gestão de anúncios (padrão Factory da disciplina).
 * As telas usam estes hooks e não conhecem o Supabase.
 */
import { localStore } from '../infra/localStore';
import { supabase } from '../infra/supabaseClient';
import { createLocalDraftsRepository } from '../model/repositories/localDraftsRepository';
import { createSupabaseListingsRepository } from '../model/repositories/supabaseListingsRepository';
import { useDraftsViewModel } from '../viewmodel/useDraftsViewModel';
import { useEditListingViewModel } from '../viewmodel/useEditListingViewModel';
import { useManageListingViewModel } from '../viewmodel/useManageListingViewModel';
import { useMyListingsViewModel } from '../viewmodel/useMyListingsViewModel';
import { usePublishListingViewModel } from '../viewmodel/usePublishListingViewModel';

export const listingsRepository = createSupabaseListingsRepository(supabase);
/** Rascunhos moram no aparelho, não no servidor (ADR 0028). */
export const draftsRepository = createLocalDraftsRepository(localStore);

export const usePublishListing = () =>
  usePublishListingViewModel(listingsRepository, draftsRepository);
export const useDrafts = () => useDraftsViewModel(draftsRepository);
export const useEditListing = (id: string) => useEditListingViewModel(listingsRepository, id);
export const useManageListing = (id: string) => useManageListingViewModel(listingsRepository, id);
export const useMyListings = () => useMyListingsViewModel(listingsRepository);
