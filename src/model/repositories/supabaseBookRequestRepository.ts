import type { SupabaseClient } from '@supabase/supabase-js';
import type { BookRequest, RequestStatus } from '../entities/BookRequest';
import { BookRequestError } from '../entities/BookRequestError.ts';
import type { BookRequestRepository } from './BookRequestRepository';

/**
 * Subconjunto do SupabaseClient usado pelo repositório (permite cliente falso nos testes).
 */
export type SupabaseBookRequestClient = Pick<SupabaseClient, 'from'>;

const TABLE = 'book_requests';
const COLUMNS =
  'id,listing_id,requester_id,public_location,meeting_date,meeting_time,status,created_at,updated_at';

type Row = {
  id: string;
  listing_id: string;
  requester_id: string;
  public_location: string;
  meeting_date: string;
  meeting_time: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
};

const isStatus = (value: unknown): value is RequestStatus =>
  value === 'pending' ||
  value === 'accepted' ||
  value === 'rejected' ||
  value === 'canceled' ||
  value === 'completed';

export function mapSupabaseBookRequestError(error: unknown): BookRequestError {
  if (error instanceof BookRequestError) return error;
  const { code, message } = (error ?? {}) as { code?: string; message?: string };
  if (code === 'PGRST205' || code === '42P01') return new BookRequestError('not_configured', error);
  if (code === '22P02' || code === 'PGRST116') return new BookRequestError('not_found', error);
  if (code === '23505') return new BookRequestError('already_exists', error);
  if (/fetch|network/i.test(message ?? '')) return new BookRequestError('network', error);
  return new BookRequestError('unknown', error);
}

const toBookRequest = (row: Row): BookRequest => ({
  id: row.id,
  listingId: row.listing_id,
  requesterId: row.requester_id,
  publicLocation: row.public_location,
  meetingDate: row.meeting_date,
  meetingTime: row.meeting_time,
  status: isStatus(row.status) ? row.status : 'pending',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function createSupabaseBookRequestRepository(
  client: SupabaseBookRequestClient | null,
): BookRequestRepository {
  const requireClient = () => {
    if (!client) throw new BookRequestError('not_configured');
    return client;
  };

  const readOne = async (result: { data: Row | null; error: unknown }): Promise<BookRequest> => {
    if (result.error) throw mapSupabaseBookRequestError(result.error);
    if (!result.data) throw new BookRequestError('not_found');
    return toBookRequest(result.data);
  };

  const readMany = async (result: {
    data: Row[] | null;
    error: unknown;
  }): Promise<BookRequest[]> => {
    if (result.error) throw mapSupabaseBookRequestError(result.error);
    return (result.data ?? []).map(toBookRequest);
  };

  return {
    async createRequest({ listingId, publicLocation, meetingDate, meetingTime }) {
      const db = requireClient();
      const result = await db
        .from(TABLE)
        .insert({
          listing_id: listingId,
          public_location: publicLocation,
          meeting_date: meetingDate,
          meeting_time: meetingTime,
        })
        .select(COLUMNS)
        .maybeSingle();
      return readOne(result as { data: Row | null; error: unknown });
    },

    async getRequestById(id) {
      const db = requireClient();
      const result = await db.from(TABLE).select(COLUMNS).eq('id', id).maybeSingle();
      return readOne(result as { data: Row | null; error: unknown });
    },

    async getRequestsByRequester(requesterId) {
      const db = requireClient();
      const result = await db
        .from(TABLE)
        .select(COLUMNS)
        .eq('requester_id', requesterId)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });
      return readMany(result as { data: Row[] | null; error: unknown });
    },

    async getRequestsByOwner(ownerId) {
      const db = requireClient();
      void ownerId;
      // IMPORTANTE: A política RLS "Envolvidos leem a própria negociação"
      // (ver migration 20261002120000) já restringe estritamente o conjunto retornado:
      //   requester_id = auth.uid()  OR  listing_id IN (SELECT id FROM listings WHERE owner_id = auth.uid())
      // Isso significa que o usuário autenticado SÓ consegue ler as linhas onde:
      //   (a) ele é o requerente,  OU  (b) ele é o DONO do anúncio associado.
      // O parâmetro `ownerId` existe para manter a assinatura do contrato e é usado
      // pelo repositório em memória e pelos testes unitários. Neste repositório Supabase,
      // o RLS BLOQUEIA qualquer vazamento para terceiros, mesmo que `ownerId` seja manipulado.
      // A distinção asOwner vs asRequester é feita no próximo nível (ViewModel), comparando
      // `session.user.id` com `listing.ownerId` (pois book_requests.requester_id === requerente,
      // e dono vem de listings.owner_id através do catálogo).
      const result = await db
        .from(TABLE)
        .select(COLUMNS)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });
      return readMany(result as { data: Row[] | null; error: unknown });
    },

    async updateRequestStatus(id, status) {
      const db = requireClient();
      const result = await db
        .from(TABLE)
        .update({ status })
        .eq('id', id)
        .select(COLUMNS)
        .maybeSingle();
      return readOne(result as { data: Row | null; error: unknown });
    },
  };
}
