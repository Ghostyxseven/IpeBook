import type { MeetingPoint } from './MeetingPoint';

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'canceled' | 'completed';

export interface BookRequest {
  id: string;
  listingId: string;
  requesterId: string;

  // Dados do encontro. `null` nos três: "Conversar" (ADR 0035) abriu a negociação
  // sem encontro nenhum ainda, só para falar antes de propor onde/quando.
  publicLocation: string | null;
  meetingPoint?: MeetingPoint | null;
  meetingDate: string | null; // Formato YYYY-MM-DD
  meetingTime: string | null; // Formato HH:MM

  status: RequestStatus;

  /** Na troca, o anúncio de quem pediu oferecido em troca (Figma 03.05, ADR 0022). */
  offeredListingId?: string | null;

  /**
   * Na troca, o outro livro de quem pediu que o dono prefere receber (Figma 06.19, ADR 0030).
   * Enquanto está preenchido, a vez de responder é de quem pediu.
   */
  counterListingId?: string | null;

  /** Data ISO 8601 (mesmo padrão de Listing.createdAt). */
  createdAt: string;
  /** Data ISO 8601 (mesmo padrão de Listing.createdAt). */
  updatedAt: string;
}
