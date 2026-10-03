import type { RequestStatus } from '../entities/BookRequest';
import type { MessageErrorCode } from '../entities/MessageError';

/** Limite da mensagem; o mesmo `check` da tabela `request_messages`. */
export const MESSAGE_MAX = 1000;

/** O texto que vai para o banco, ou `null` quando não há o que enviar. */
export function normalizeMessage(body: string): string | null {
  const text = body.trim();
  if (!text) return null;
  return text.slice(0, MESSAGE_MAX);
}

/** A conversa aceita mensagens enquanto a negociação está pendente ou aceita. */
export function isConversationOpen(status: RequestStatus): boolean {
  return status === 'pending' || status === 'accepted';
}

const pad = (value: number) => String(value).padStart(2, '0');

/** Hora da mensagem no balão, como no Figma 06.02: "8h40". */
export function messageTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getHours()}h${pad(date.getMinutes())}`;
}

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Quando foi a última mensagem, na lista de Conversas (Figma 06.01):
 * "8h40" hoje, "Ontem", o dia da semana até seis dias e a data depois disso.
 */
export function conversationWhen(iso: string, now: Date): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(date)) / 86_400_000);
  if (days <= 0) return messageTime(iso);
  if (days === 1) return 'Ontem';
  if (days < 7) return weekdays[date.getDay()];
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}

/** Iniciais do avatar: "Ana Paula" vira "AP"; sem nome, "?". */
export function initials(name: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

export function messageErrorMessage(code: MessageErrorCode): string {
  switch (code) {
    case 'invalid':
      return 'Escreva uma mensagem de até 1.000 caracteres.';
    case 'closed':
      return 'Esta negociação foi encerrada. A conversa fica só para consulta.';
    case 'network':
      return 'Sua mensagem ficou pendente. Confira sua conexão e tente novamente.';
    case 'not_configured':
      return 'A conversa ainda não foi configurada neste aparelho.';
    default:
      return 'Não conseguimos enviar agora. Tente de novo em instantes.';
  }
}
