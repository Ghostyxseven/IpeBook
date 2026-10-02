import type { BookRequest, RequestStatus } from '../entities/BookRequest';

const statusLabel: Record<RequestStatus, string> = {
  pending: 'Aguardando resposta',
  accepted: 'Encontro combinado',
  rejected: 'Recusada',
  canceled: 'Cancelada',
  completed: 'Concluída',
};

/** Rótulo legível do status (pt-BR). */
export function requestStatusLabel(status: RequestStatus): string {
  return statusLabel[status];
}

/**
 * Formata uma data ISO 8601 no padrão do usuário (Brasil).
 * Tolerante a valores inválidos: retorna null em caso de erro.
 */
export function meetingDateLabel(meetingDate: string): string | null {
  try {
    const [year, month, day] = meetingDate.split('-').map((part) => Number(part));
    if (!year || !month || !day) return null;
    const date = new Date(year, month - 1, day, 12, 0, 0);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

/** Horário formatado (HH:MM → 09h30). Mantém simples e determinístico. */
export function meetingTimeLabel(meetingTime: string): string {
  const [hh, mm] = meetingTime.split(':');
  if (!hh || !mm) return meetingTime;
  return `${hh}h${mm}`;
}

/** Resumo amigável do encontro: "Praça das Flores • 30 de set. de 2026 • 09h30" */
export function meetingSummary(request: BookRequest): string {
  const parts = [
    request.publicLocation.trim(),
    meetingDateLabel(request.meetingDate),
    meetingTimeLabel(request.meetingTime),
  ].filter((part): part is string => Boolean(part));
  return parts.join(' • ');
}

/** Rótulo de listagem para a tela principal da pessoa. */
export function requestListLabel(request: BookRequest, { asOwner }: { asOwner: boolean }): string {
  if (asOwner) {
    return request.status === 'pending'
      ? 'Nova solicitação de encontro'
      : statusLabel[request.status];
  }
  return request.status === 'pending' ? 'Aguardando o dono responder' : statusLabel[request.status];
}
