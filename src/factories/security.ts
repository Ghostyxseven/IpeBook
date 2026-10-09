import { createSupabaseSecurityRepository } from '../model/repositories/supabaseSecurityRepository';
import { supabase } from '../infra/supabaseClient';
import { useBlockedPeopleViewModel } from '../viewmodel/useBlockedPeopleViewModel';
import { useBlockViewModel } from '../viewmodel/useBlockViewModel';
import { useReportViewModel } from '../viewmodel/useReportViewModel';

export const securityRepository = createSupabaseSecurityRepository(supabase);

export const useBlockUser = (userIdToBlock: string | null) =>
  useBlockViewModel(securityRepository, userIdToBlock);

export const useReport = (target: Parameters<typeof useReportViewModel>[1]) =>
  useReportViewModel(securityRepository, target);

export const useBlockedPeople = () => useBlockedPeopleViewModel(securityRepository);
