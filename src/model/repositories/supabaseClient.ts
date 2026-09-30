import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
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

// No celular, só renova o token com o app em primeiro plano (guia do Expo para Supabase).
// Na Web, o próprio supabase-js acompanha a visibilidade da aba.
if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
