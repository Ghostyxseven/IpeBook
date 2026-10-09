/**
 * Monta as dependências reais da conta (padrão Factory da disciplina).
 * As telas usam estes hooks e não conhecem o Supabase.
 */
import { supabase } from '../infra/supabaseClient';
import { createSupabaseAccountRepository } from '../model/repositories/supabaseAccountRepository';
import { useDeleteAccountViewModel } from '../viewmodel/useDeleteAccountViewModel';

export const accountRepository = createSupabaseAccountRepository(supabase);

export const useDeleteAccount = (options?: Parameters<typeof useDeleteAccountViewModel>[1]) =>
  useDeleteAccountViewModel(accountRepository, options);
