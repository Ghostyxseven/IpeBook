import { createSupabaseSecurityRepository } from '../model/repositories/supabaseSecurityRepository';
import { supabase } from '../model/repositories/supabaseClient';

export const securityRepository = createSupabaseSecurityRepository(supabase);
