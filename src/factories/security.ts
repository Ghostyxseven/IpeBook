import { createSupabaseSecurityRepository } from '../model/repositories/supabaseSecurityRepository';
import { supabase } from '../infra/supabaseClient';
import { useBlockViewModel } from '../viewmodel/useBlockViewModel';
import { useReportViewModel } from '../viewmodel/useReportViewModel';

export const securityRepository = createSupabaseSecurityRepository(supabase);

export const useBlockUser = (
  userIdToBlock: string,
  options: Parameters<typeof useBlockViewModel>[2],
) => useBlockViewModel(securityRepository, userIdToBlock, options);

export const useReport = (
  target: Parameters<typeof useReportViewModel>[1],
  options: Parameters<typeof useReportViewModel>[2],
) => useReportViewModel(securityRepository, target, options);
