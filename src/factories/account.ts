/**
 * Monta as dependências reais da conta (padrão Factory da disciplina).
 * As telas usam estes hooks e não conhecem o Supabase.
 */
import type { User } from '../model/entities/User';
import { supabase } from '../infra/supabaseClient';
import { createSupabaseAccountRepository } from '../model/repositories/supabaseAccountRepository';
import { useDeleteAccountViewModel } from '../viewmodel/useDeleteAccountViewModel';
import { useExportMyDataViewModel } from '../viewmodel/useExportMyDataViewModel';
import { bookRequestRepository } from './bookRequest';
import { listingsRepository } from './listings';
import { profileRepository } from './profile';
import { reputationRepository } from './reputation';

export const accountRepository = createSupabaseAccountRepository(supabase);

export const useDeleteAccount = (options?: Parameters<typeof useDeleteAccountViewModel>[1]) =>
  useDeleteAccountViewModel(accountRepository, options);

/** "Baixar meus dados" (Figma 07.07). */
export const useExportMyData = (user: User) =>
  useExportMyDataViewModel(
    {
      profile: profileRepository,
      listings: listingsRepository,
      bookRequests: bookRequestRepository,
      reputation: reputationRepository,
    },
    user,
  );
