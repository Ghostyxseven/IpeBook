/**
 * Monta as dependências reais do perfil (padrão Factory da disciplina).
 * As telas usam estes hooks e não conhecem o Supabase.
 */
import { supabase } from '../infra/supabaseClient';
import { createSupabaseProfileRepository } from '../model/repositories/supabaseProfileRepository';
import { useNeighborhoodViewModel } from '../viewmodel/useNeighborhoodViewModel';

export const profileRepository = createSupabaseProfileRepository(supabase);

export const useNeighborhood = (options: Parameters<typeof useNeighborhoodViewModel>[1]) =>
  useNeighborhoodViewModel(profileRepository, options);
