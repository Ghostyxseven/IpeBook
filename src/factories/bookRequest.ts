/**
 * Monta as dependências reais de negociação (padrão Factory da disciplina).
 * As telas usam estes hooks e não conhecem o Supabase.
 */
import { createSupabaseBookRequestRepository } from '../model/repositories/supabaseBookRequestRepository';
import { supabase } from '../infra/supabaseClient';
import { catalogRepository } from './catalog';
import { useBookRequestDetailViewModel } from '../viewmodel/useBookRequestDetailViewModel';
import { useBookRequestListViewModel } from '../viewmodel/useBookRequestListViewModel';
import { useCreateBookRequestViewModel } from '../viewmodel/useCreateBookRequestViewModel';

export const bookRequestRepository = createSupabaseBookRequestRepository(supabase);

export const useCreateBookRequest = (listingId: string) =>
  useCreateBookRequestViewModel(catalogRepository, bookRequestRepository, listingId);

export const useBookRequestDetail = (id: string) =>
  useBookRequestDetailViewModel(catalogRepository, bookRequestRepository, id);

export const useBookRequestList = () =>
  useBookRequestListViewModel(bookRequestRepository, catalogRepository);
