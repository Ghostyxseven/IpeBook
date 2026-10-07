/**
 * Monta as dependências reais da reputação (padrão Factory da disciplina).
 * As telas usam estes hooks e não conhecem o Supabase.
 */
import { supabase } from '../infra/supabaseClient';
import { createSupabaseReputationRepository } from '../model/repositories/supabaseReputationRepository';
import {
  useHistoryViewModel,
  usePublicProfileViewModel,
  useRatingsReceivedViewModel,
} from '../viewmodel/useReputationViewModels';

export const reputationRepository = createSupabaseReputationRepository(supabase);

export const usePublicProfile = (userId: string) =>
  usePublicProfileViewModel(reputationRepository, userId);
export const useRatingsReceived = (userId: string) =>
  useRatingsReceivedViewModel(reputationRepository, userId);
export const useHistory = () => useHistoryViewModel(reputationRepository);
