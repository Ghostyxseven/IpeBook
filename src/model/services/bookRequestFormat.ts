import type { BookRequest, RequestStatus } from '../entities/BookRequest';
import type { Modality } from '../entities/Listing';

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

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const pad = (value: number) => String(value).padStart(2, '0');

/** Dia curto dos chips e do resumo do Figma 06.04: "Sáb, 03/10". */
export function meetingDayLabel(meetingDate: string): string | null {
  const [year, month, day] = meetingDate.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day, 12);
  if (Number.isNaN(date.getTime()) || date.getDate() !== day) return null;
  return `${weekdays[date.getDay()]}, ${pad(day)}/${pad(month)}`;
}

/** Hora curta do Figma: "10h" ou "15h30". */
export function meetingHourLabel(meetingTime: string): string {
  const [hh, mm] = meetingTime.split(':');
  if (!hh || !mm) return meetingTime;
  return mm === '00' ? `${Number(hh)}h` : `${Number(hh)}h${mm}`;
}

/** "Sáb, 03/10 · 10h" (Figma 06.05). */
export function meetingWhen(request: Pick<BookRequest, 'meetingDate' | 'meetingTime'>): string {
  return [meetingDayLabel(request.meetingDate), meetingHourLabel(request.meetingTime)]
    .filter(Boolean)
    .join(' · ');
}

/** Próximos dias oferecidos nos chips de "Dia" (Figma 06.04), a partir de amanhã. */
export function meetingDayOptions(today: Date, count = 7) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index + 1, 12);
    const value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    return { value, label: meetingDayLabel(value) ?? value };
  });
}

/** Horários oferecidos nos chips de "Horário" (Figma 06.04), em horário comercial. */
export const meetingTimeOptions = ['09:00', '10:00', '14:00', '15:00', '17:00', '19:00'];

const dealNouns: Record<Modality, string> = { sale: 'compra', trade: 'troca', donation: 'doação' };
const wantVerbs: Record<Modality, string> = {
  sale: 'comprar',
  trade: 'trocar',
  donation: 'receber',
};

/**
 * Título e texto de cada situação da negociação (Figma 06.03 a 06.18).
 * `otherName` é o primeiro nome de quem anunciou, quando quem vê é quem pediu.
 */
export function requestScreenCopy(
  request: Pick<BookRequest, 'status' | 'meetingDate' | 'meetingTime'>,
  {
    asOwner,
    modality,
    ownerName,
  }: { asOwner: boolean; modality: Modality; ownerName?: string | null },
): { title: string; body: string } {
  const owner = ownerName?.trim() || 'quem anunciou';
  const other = asOwner ? 'quem pediu' : owner;
  switch (request.status) {
    case 'pending':
      return asOwner
        ? {
            title: `Alguém quer ${wantVerbs[modality]} seu livro`,
            body: 'Ao aceitar, seu anúncio fica Reservado e vocês combinam o encontro.',
          }
        : { title: 'Proposta enviada.', body: `Aguardando a resposta de ${owner}.` };
    case 'accepted':
      return {
        title: 'Seu próximo capítulo está perto.',
        body: `${meetingWhen(request)} · ${dealNouns[modality]} com ${other}.`,
      };
    case 'completed':
      return {
        title: 'Seu livro ganhou um novo começo.',
        body: asOwner
          ? 'Obrigado por fazer as histórias seguirem.'
          : 'A entrega foi confirmada. Boa leitura!',
      };
    case 'canceled':
      return {
        title: 'Encontro cancelado.',
        body: 'O horário foi liberado. Combine uma nova data quando quiser.',
      };
    case 'rejected':
      return asOwner
        ? {
            title: 'Proposta recusada.',
            body: 'Seu anúncio continua disponível. Você pode receber outras propostas.',
          }
        : {
            title: 'Proposta recusada.',
            body: 'Quem anunciou não pôde aceitar desta vez. Há outros livros esperando por você.',
          };
  }
}

export type ConfirmKind = 'reject' | 'cancel' | 'complete';

/** Textos das confirmações (Figma 06.17, 06.11 e 06.07). */
export function confirmCopy(
  kind: ConfirmKind,
  {
    asOwner,
    ownerName,
    listingTitle,
  }: { asOwner: boolean; ownerName?: string | null; listingTitle: string },
) {
  const other = asOwner ? 'Quem pediu' : ownerName?.trim() || 'Quem anunciou';
  switch (kind) {
    case 'reject':
      return {
        title: 'Recusar esta proposta?',
        body: `Quem pediu será avisado de que a proposta não foi aceita. Seu ${listingTitle} continua disponível para outras propostas.`,
        keep: 'Voltar à proposta',
        confirm: 'Recusar proposta',
      };
    case 'cancel':
      return {
        title: 'Cancelar este encontro?',
        body: `${other} verá a negociação como cancelada. Vocês podem combinar outro dia com uma nova proposta.`,
        keep: 'Manter encontro',
        confirm: 'Cancelar encontro',
      };
    case 'complete':
      return {
        title: 'O livro chegou bem?',
        body: 'Confirme só depois de entregar o livro e conferir tudo. O anúncio passa a Concluído.',
        keep: 'Ainda não',
        confirm: 'Concluir negociação',
      };
  }
}
