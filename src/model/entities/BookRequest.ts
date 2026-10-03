export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'canceled' | 'completed';

export interface BookRequest {
  id: string;
  listingId: string;
  requesterId: string;

  // Dados do encontro
  publicLocation: string;
  meetingDate: string; // Formato YYYY-MM-DD
  meetingTime: string; // Formato HH:MM

  status: RequestStatus;

  /** Na troca, o anúncio de quem pediu oferecido em troca (Figma 03.05, ADR 0022). */
  offeredListingId?: string | null;

  /** Data ISO 8601 (mesmo padrão de Listing.createdAt). */
  createdAt: string;
  /** Data ISO 8601 (mesmo padrão de Listing.createdAt). */
  updatedAt: string;
}
