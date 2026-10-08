/**
 * Monta as dependências reais de favoritos (padrão Factory da disciplina).
 * As telas usam este hook e não conhecem o Supabase.
 */
import { supabase } from '../infra/supabaseClient';
import { createSupabaseFavoritesRepository } from '../model/repositories/supabaseFavoritesRepository';
import { useFavoritesViewModel } from '../viewmodel/useFavoritesViewModel';

export const favoritesRepository = createSupabaseFavoritesRepository(supabase);

export const useFavorites = () => useFavoritesViewModel(favoritesRepository);
