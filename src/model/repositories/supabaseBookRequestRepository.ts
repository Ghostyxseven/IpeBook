import { readMeetingPoint } from '../services/meetingPoints.ts';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BookRequest, RequestStatus } from '../entities/BookRequest';
import { BookRequestError } from '../entities/BookRequestError.ts';
import type { Listing } from '../entities/Listing';
import type { BookRequestRepository } from './BookRequestRepository';
import { COVERS_BUCKET } from './supabaseCatalogRepository.ts';

/**
 * Subconjunto do SupabaseClient usado pelo repositório (permite cliente falso nos testes).
 */
// `storage` entrou com a contraproposta: a estante de quem propôs mostra a capa real
// de cada anúncio, e a URL pública sai do mesmo bucket que o catálogo usa.
export type SupabaseBookRequestClient = Pick<SupabaseClient, 'from' | 'rpc' | 'storage'>;

/** Linha de `listings` como a função `shelf_of_requester` devolve. */
type ListingRow = {
  id: string;
  title: string;
  author: string;
  category: string;
  modality: Listing['modality'];
  price_cents: number | null;
  trade_terms: string | null;
  condition: Listing['condition'];
  neighborhood: string | null;
  city: string | null;
  description: string | null;
  cover_path: string | null;
  status: Listing['status'];
  owner_id?: string | null;
  created_at: string;
};

const TABLE = 'book_requests';
const COLUMNS =
  'id,listing_id,requester_id,offered_listing_id,counter_listing_id,public_location,meeting_date,meeting_time,status,created_at,updated_at,meeting_point';

type Row = {
  id: string;
  listing_id: string;
  requester_id: string;
  offered_listing_id?: string | null;
  counter_listing_id?: string | null;
  public_location: string | null;
  meeting_point?: unknown;
  meeting_date: string | null;
  meeting_time: string | null;
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
  if (code === '22P02' || code === 'PGRST116' || code === 'P0002') {
    return new BookRequestError('not_found', error);
  }
  if (code === '42501') return new BookRequestError('forbidden', error);
  if (code === 'P0001' && /invalid_transition/.test(message ?? '')) {
    return new BookRequestError('invalid_transition', error);
  }
  if (code === '23505') return new BookRequestError('already_exists', error);
  if (/fetch|network/i.test(message ?? '')) return new BookRequestError('network', error);
  return new BookRequestError('unknown', error);
}

const toBookRequest = (row: Row): BookRequest => ({
  id: row.id,
  listingId: row.listing_id,
  requesterId: row.requester_id,
  offeredListingId: row.offered_listing_id ?? null,
  counterListingId: row.counter_listing_id ?? null,
  publicLocation: row.public_location,
  meetingPoint: readMeetingPoint(row.meeting_point),
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
    async createRequest({
      listingId,
      publicLocation,
      meetingDate,
      meetingTime,
      offeredListingId,
      meetingPoint,
    }) {
      const db = requireClient();
      const result = await db
        .from(TABLE)
        .insert({
          listing_id: listingId,
          public_location: publicLocation,
          ...(meetingPoint !== undefined ? { meeting_point: meetingPoint } : {}),
          meeting_date: meetingDate,
          meeting_time: meetingTime,
          ...(offeredListingId ? { offered_listing_id: offeredListingId } : {}),
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
      // (ver migration 20261002125000) já restringe estritamente o conjunto retornado:
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

    async transitionRequest(id, status) {
      const db = requireClient();
      // A função do banco confere o papel, muda a solicitação e o anúncio juntos (ADR 0018).
      const result = await db
        .rpc('transition_book_request', { request_id: id, next_status: status })
        .select(COLUMNS)
        .maybeSingle();
      return readOne(result as { data: Row | null; error: unknown });
    },

    async reschedule(id, { publicLocation, meetingDate, meetingTime, meetingPoint }) {
      const db = requireClient();
      const result = await db
        .rpc(
          meetingPoint === undefined
            ? 'reschedule_book_request'
            : 'reschedule_book_request_with_point',
          {
            request_id: id,
            new_location: publicLocation,
            new_date: meetingDate,
            new_time: meetingTime,
            ...(meetingPoint !== undefined ? { new_point: meetingPoint } : {}),
          },
        )
        .select(COLUMNS)
        .maybeSingle();
      return readOne(result as { data: Row | null; error: unknown });
    },

    async proposeMeeting(id, { publicLocation, meetingDate, meetingTime, meetingPoint }) {
      const db = requireClient();
      const result = await db
        .rpc(meetingPoint === undefined ? 'propose_meeting' : 'propose_meeting_with_point', {
          request_id: id,
          new_location: publicLocation,
          new_date: meetingDate,
          new_time: meetingTime,
          ...(meetingPoint !== undefined ? { new_point: meetingPoint } : {}),
        })
        .select(COLUMNS)
        .maybeSingle();
      return readOne(result as { data: Row | null; error: unknown });
    },

    async shelfOfRequester(requestId) {
      const db = requireClient();
      const { data, error } = await db.rpc('shelf_of_requester', { p_request_id: requestId });
      if (error) throw mapSupabaseBookRequestError(error);
      if (!Array.isArray(data)) return [];
      return (data as ListingRow[]).map((row) => ({
        id: row.id,
        title: row.title,
        author: row.author,
        category: row.category,
        modality: row.modality,
        priceCents: row.price_cents,
        tradeTerms: row.trade_terms,
        condition: row.condition,
        neighborhood: row.neighborhood,
        city: row.city,
        description: row.description,
        coverUrl: row.cover_path
          ? db.storage.from(COVERS_BUCKET).getPublicUrl(row.cover_path).data.publicUrl
          : null,
        status: row.status,
        ownerId: row.owner_id ?? null,
        // Quem pediu já se identifica na negociação; a linha não repete o nome.
        ownerFirstName: null,
        createdAt: row.created_at,
      }));
    },

    async counterOffer(requestId, listingId) {
      const db = requireClient();
      const result = await db
        .rpc('counter_offer', { p_request_id: requestId, p_listing_id: listingId })
        .select(COLUMNS)
        .maybeSingle();
      return readOne(result as { data: Row | null; error: unknown });
    },

    async answerCounterOffer(requestId, accept) {
      const db = requireClient();
      const result = await db
        .rpc('answer_counter_offer', { p_request_id: requestId, p_accept: accept })
        .select(COLUMNS)
        .maybeSingle();
      return readOne(result as { data: Row | null; error: unknown });
    },

    async personFirstName(userId) {
      const db = requireClient();
      // A mesma função que dá o nome de quem anunciou serve para quem pediu.
      const { data, error } = await db.rpc('listing_owner_first_name', { owner: userId });
      return !error && typeof data === 'string' && data.trim() ? data : null;
    },
  };
}
