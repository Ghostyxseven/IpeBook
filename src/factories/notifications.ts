/**
 * Monta as dependências reais das notificações e das configurações (padrão Factory da disciplina).
 * As telas usam estes hooks e não conhecem o Supabase.
 */
import Constants from 'expo-constants';
import { onAppForeground } from '../infra/appForeground';
import { supabase } from '../infra/supabaseClient';
import { createSupabaseNotificationRepository } from '../model/repositories/supabaseNotificationRepository';
import { useNotificationsViewModel } from '../viewmodel/useNotificationsViewModel';
import { useSessionContext } from '../viewmodel/useSession';
import { useSettingsViewModel } from '../viewmodel/useSettingsViewModel';
import { useUnreadCountViewModel } from '../viewmodel/useUnreadCountViewModel';

export const notificationRepository = createSupabaseNotificationRepository(supabase);

export const useNotifications = () => useNotificationsViewModel(notificationRepository);
export const useUnreadCount = () =>
  useUnreadCountViewModel(notificationRepository, { onForeground: onAppForeground });
export const useSettings = () =>
  useSettingsViewModel(notificationRepository, useSessionContext(), {
    appVersion: Constants.expoConfig?.version ?? '—',
    // Endereço público da página institucional (documentos legais); sem ele os links ficam ocultos.
    siteUrl: process.env.EXPO_PUBLIC_SITE_URL,
  });
