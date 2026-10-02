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

  /** Data ISO 8601 (mesmo padrão de Listing.createdAt). */
  createdAt: string;
  /** Data ISO 8601 (mesmo padrão de Listing.createdAt). */
  updatedAt: string;
}
