import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { localStore } from './localStore';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** `null` quando o `.env` não foi preenchido; o repositório informa "não configurado". */
export const supabase: SupabaseClient | null =
  url && publishableKey
    ? createClient(url, publishableKey, {
        auth: {
          storage: localStore ?? undefined,
          autoRefreshToken: true,
          persistSession: true,
          // Verificação e recuperação usam código (ADR 0006), nunca sessão vinda da URL.
          detectSessionInUrl: false,
        },
      })
    : null;
