import { useCallback, useEffect, useRef, useState } from 'react';
import type { NotificationRepository } from '../model/repositories/NotificationRepository';
import { unreadBadgeText, unreadCountLabel } from '../model/services/notificationFormat.ts';

/** Avisa quando o aplicativo volta ao primeiro plano; devolve a função que cancela o aviso. */
export type ForegroundSubscription = (onForeground: () => void) => () => void;

/**
 * Contador de avisos não lidos para o ícone de acesso. Atualiza ao abrir, ao chamar
 * `refresh` (por exemplo ao voltar para a tela) e quando o app volta ao primeiro plano.
 * Uma falha mantém o último valor: o contador é um reforço e não deve gerar erro na tela.
 */
export function useUnreadCountViewModel(
  repository: NotificationRepository,
  options: { onForeground?: ForegroundSubscription } = {},
) {
  const [count, setCount] = useState(0);
  const requestId = useRef(0);
  const { onForeground } = options;

  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const next = await repository.unreadCount();
      if (id === requestId.current) setCount(next);
    } catch {
      // Mantém o valor anterior.
    }
  }, [repository]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(
    () => (onForeground ? onForeground(() => void refresh()) : undefined),
    [onForeground, refresh],
  );

  return {
    count,
    badgeText: unreadBadgeText(count),
    accessibilityLabel: unreadCountLabel(count),
    refresh,
  };
}
