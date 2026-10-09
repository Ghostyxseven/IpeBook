import type { NotificationErrorCode } from '../entities/NotificationError';

const messages: Record<NotificationErrorCode, string> = {
  network: 'Não conseguimos carregar os avisos. Confira sua internet e tente de novo.',
  not_configured: 'Os avisos ainda não foram configurados neste ambiente.',
  unknown: 'Algo deu errado com os avisos. Tente de novo em instantes.',
};

export function notificationErrorMessage(code: NotificationErrorCode) {
  return messages[code];
}
