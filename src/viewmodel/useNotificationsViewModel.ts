import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppNotification } from '../model/entities/Notification';
import { toNotificationError } from '../model/entities/NotificationError.ts';
import type {
  NotificationCursor,
  NotificationRepository,
} from '../model/repositories/NotificationRepository';
import { notificationErrorMessage } from '../model/services/notificationMessages.ts';

export const NOTIFICATIONS_PAGE_SIZE = 20;

export type NotificationsStatus = 'loading' | 'ready' | 'error';

/**
 * Lista paginada de avisos. Cada nova consulta invalida as anteriores, para uma resposta
 * atrasada nunca sobrescrever a mais recente. Marcar como lido vale na tela na hora e
 * volta ao estado anterior se o servidor falhar.
 */
export function useNotificationsViewModel(repository: NotificationRepository) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [status, setStatus] = useState<NotificationsStatus>('loading');
  const [error, setError] = useState<string>();
  const [actionError, setActionError] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string>();
  const [markingAll, setMarkingAll] = useState(false);
  const cursor = useRef<NotificationCursor | null>(null);
  const requestId = useRef(0);
  const busyMore = useRef(false);
  const busyAll = useRef(false);
  const loaded = useRef(false);

  const loadFirst = useCallback(
    async (mode: 'initial' | 'refresh') => {
      const id = ++requestId.current;
      busyMore.current = false;
      setLoadingMore(false);
      setLoadMoreError(undefined);
      if (mode === 'refresh') setRefreshing(true);
      else setStatus('loading');
      try {
        const page = await repository.list({ cursor: null, limit: NOTIFICATIONS_PAGE_SIZE });
        if (id !== requestId.current) return;
        cursor.current = page.nextCursor;
        setItems(page.items);
        setError(undefined);
        setStatus('ready');
        loaded.current = true;
      } catch (cause) {
        if (id !== requestId.current) return;
        const message = notificationErrorMessage(toNotificationError(cause).code);
        // Ao atualizar uma lista já carregada, mantém os avisos e só avisa do erro.
        if (mode === 'refresh' && loaded.current) setError(message);
        else {
          setItems([]);
          setError(message);
          setStatus('error');
          loaded.current = false;
        }
      } finally {
        if (id === requestId.current) setRefreshing(false);
      }
    },
    [repository],
  );

  useEffect(() => {
    void loadFirst('initial');
  }, [loadFirst]);

  const loadMore = useCallback(async () => {
    if (busyMore.current || !cursor.current || status !== 'ready') return;
    busyMore.current = true;
    const id = requestId.current;
    setLoadingMore(true);
    setLoadMoreError(undefined);
    try {
      const page = await repository.list({
        cursor: cursor.current,
        limit: NOTIFICATIONS_PAGE_SIZE,
      });
      if (id !== requestId.current) return;
      cursor.current = page.nextCursor;
      setItems((current) => [...current, ...page.items]);
    } catch (cause) {
      if (id !== requestId.current) return;
      setLoadMoreError(notificationErrorMessage(toNotificationError(cause).code));
    } finally {
      if (id === requestId.current) {
        busyMore.current = false;
        setLoadingMore(false);
      }
    }
  }, [repository, status]);

  /** Marca um aviso como lido; devolve o destino (anúncio) para a tela abrir. */
  const markRead = useCallback(
    async (notificationId: string) => {
      const target = items.find((item) => item.id === notificationId);
      if (!target) return null;
      if (target.readAt !== null) return target.targetListingId;
      const readAt = new Date().toISOString();
      setActionError(undefined);
      setItems((current) =>
        current.map((item) => (item.id === notificationId ? { ...item, readAt } : item)),
      );
      try {
        await repository.markRead(notificationId);
      } catch (cause) {
        // Volta ao estado anterior, a menos que outra ação já tenha mexido neste aviso.
        setItems((current) =>
          current.map((item) =>
            item.id === notificationId && item.readAt === readAt ? { ...item, readAt: null } : item,
          ),
        );
        setActionError(notificationErrorMessage(toNotificationError(cause).code));
      }
      return target.targetListingId;
    },
    [items, repository],
  );

  const markAllRead = useCallback(async () => {
    if (busyAll.current) return;
    busyAll.current = true;
    setMarkingAll(true);
    setActionError(undefined);
    const before = items;
    const readAt = new Date().toISOString();
    setItems((current) => current.map((item) => (item.readAt ? item : { ...item, readAt })));
    try {
      await repository.markAllRead();
    } catch (cause) {
      // Restaura só os avisos que esta ação marcou.
      setItems((current) =>
        current.map((item) => {
          const original = before.find((candidate) => candidate.id === item.id);
          return original && original.readAt === null && item.readAt === readAt
            ? { ...item, readAt: null }
            : item;
        }),
      );
      setActionError(notificationErrorMessage(toNotificationError(cause).code));
    } finally {
      busyAll.current = false;
      setMarkingAll(false);
    }
  }, [items, repository]);

  const refresh = useCallback(() => loadFirst('refresh'), [loadFirst]);
  const retry = useCallback(() => loadFirst('initial'), [loadFirst]);

  return {
    items,
    status,
    error,
    actionError,
    refreshing,
    loadingMore,
    loadMoreError,
    markingAll,
    unreadInList: items.filter((item) => item.readAt === null).length,
    hasMore: cursor.current !== null,
    loadMore,
    markRead,
    markAllRead,
    refresh,
    retry,
  };
}
