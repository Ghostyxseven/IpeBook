import type { SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

/**
 * No celular, renova o token só com o app em primeiro plano (guia do Expo para Supabase).
 * Na Web, o próprio supabase-js acompanha a visibilidade da aba.
 */
export function bindSessionRefreshToAppState(client: SupabaseClient | null) {
  if (!client || Platform.OS === 'web') return;
  // O evento "change" não dispara na abertura: começa já se o app abriu em primeiro plano.
  if (AppState.currentState === 'active') client.auth.startAutoRefresh();
  AppState.addEventListener('change', (state) => {
    if (state === 'active') client.auth.startAutoRefresh();
    else client.auth.stopAutoRefresh();
  });
}
