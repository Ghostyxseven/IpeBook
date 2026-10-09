import { useCallback, useEffect, useRef, useState } from 'react';
import { NOTIFICATION_KINDS, type NotificationKind } from '../model/entities/Notification.ts';
import { toNotificationError } from '../model/entities/NotificationError.ts';
import {
  defaultNotificationPreferences,
  type NotificationPreferences,
} from '../model/entities/NotificationPreferences.ts';
import type { NotificationRepository } from '../model/repositories/NotificationRepository';
import { notificationErrorMessage } from '../model/services/notificationMessages.ts';
import { firstName } from '../model/services/userFormat.ts';

export type SettingsStatus = 'loading' | 'ready' | 'error';

/** Parte da sessão de que as Configurações precisam; evita acoplar ao hook inteiro. */
export type SettingsSession = {
  user: { name: string; email: string } | null;
  signingOut: boolean;
  error: string | null;
  signOut: () => Promise<void> | void;
};

/**
 * Configurações: ligar ou desligar cada tipo de aviso, versão do aplicativo, documentos
 * legais e Sair. Cada alteração vale na tela na hora e volta atrás se o servidor falhar.
 */
export function useSettingsViewModel(
  repository: NotificationRepository,
  session: SettingsSession,
  options: { appVersion: string; siteUrl?: string | null },
) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    defaultNotificationPreferences,
  );
  const [status, setStatus] = useState<SettingsStatus>('loading');
  const [error, setError] = useState<string>();
  const [saveError, setSaveError] = useState<string>();
  const [saving, setSaving] = useState<Partial<Record<NotificationKind, boolean>>>({});
  const latest = useRef(preferences);
  latest.current = preferences;
  const requestId = useRef(0);
  const savingKinds = useRef(new Set<NotificationKind>());

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setStatus('loading');
    try {
      const loaded = await repository.getPreferences();
      if (id !== requestId.current) return;
      setPreferences(loaded);
      setError(undefined);
      setStatus('ready');
    } catch (cause) {
      if (id !== requestId.current) return;
      setError(notificationErrorMessage(toNotificationError(cause).code));
      setStatus('error');
    }
  }, [repository]);

  useEffect(() => {
    void load();
  }, [load]);

  const setPreference = useCallback(
    async (kind: NotificationKind, enabled: boolean) => {
      if (savingKinds.current.has(kind)) return;
      savingKinds.current.add(kind);
      setSaving((current) => ({ ...current, [kind]: true }));
      setSaveError(undefined);
      const previous = latest.current[kind];
      setPreferences((current) => ({ ...current, [kind]: enabled }));
      try {
        await repository.setPreference(kind, enabled);
      } catch (cause) {
        setPreferences((current) => ({ ...current, [kind]: previous }));
        setSaveError(notificationErrorMessage(toNotificationError(cause).code));
      } finally {
        savingKinds.current.delete(kind);
        setSaving((current) => ({ ...current, [kind]: false }));
      }
    },
    [repository],
  );

  const base = options.siteUrl?.trim().replace(/\/+$/, '') || null;

  return {
    status,
    error,
    saveError,
    retry: load,
    preferences,
    kinds: NOTIFICATION_KINDS,
    saving,
    setPreference,
    appVersion: options.appVersion,
    accountName: firstName(session.user?.name),
    accountEmail: session.user?.email ?? null,
    /** Só existem com o endereço do site definido; sem ele a tela esconde os links. */
    legalLinks: base
      ? [
          { label: 'Política de Privacidade', url: `${base}/privacidade` },
          { label: 'Termos de Uso', url: `${base}/termos` },
        ]
      : [],
    signOut: session.signOut,
    signingOut: session.signingOut,
    signOutError: session.error,
  };
}
