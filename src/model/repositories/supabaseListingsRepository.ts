import type { SupabaseClient } from '@supabase/supabase-js';
import type { ListingDraft, MyListing } from '../entities/Listing';
import { isEditable } from '../entities/Listing.ts';
import { ListingError } from '../entities/ListingError.ts';
import { isValid, normalizeDraft, validateDraft } from '../services/listingValidation.ts';
import type { CoverFile, ListingsRepository } from './ListingsRepository';

/** `from`, `storage` e `auth`; facilita testar com um cliente falso. */
export type SupabaseListingsClient = Pick<SupabaseClient, 'from' | 'storage' | 'auth'>;

export const LISTINGS_TABLE = 'listings';
export const COVERS_BUCKET = 'listing-covers';

const columns =
  'id,title,author,category,modality,price_cents,trade_terms,condition,neighborhood,city,description,cover_path,status,owner_id,created_at';

type Row = {
  id: string;
  title: string;
  author: string;
  category: string;
  modality: MyListing['modality'];
  price_cents: number | null;
  trade_terms: string | null;
  condition: MyListing['condition'];
  neighborhood: string | null;
  city: string | null;
  description: string | null;
  cover_path: string | null;
  status: MyListing['status'];
  owner_id: string | null;
  created_at: string;
};

export function mapSupabaseListingError(error: unknown): ListingError {
  if (error instanceof ListingError) return error;
  const { code, message } = (error ?? {}) as { code?: string; message?: string };
  // PGRST205/42P01: a tabela do ADR 0008 ainda não foi criada neste projeto.
  if (code === 'PGRST205' || code === '42P01') return new ListingError('not_configured', error);
  // 22P02: texto que não é UUID na rota; PGRST116: nenhuma linha devolvida.
  if (code === '22P02' || code === 'PGRST116') return new ListingError('not_found', error);
  // 23514: uma das constraints de modalidade (ADR 0008); 23502: campo obrigatório.
  if (code === '23514' || code === '23502') return new ListingError('invalid', error);
  // 42501: a RLS recusou — o anúncio não é desta pessoa.
  if (code === '42501') return new ListingError('not_allowed', error);
  if (/fetch|network/i.test(message ?? '')) return new ListingError('network', error);
  return new ListingError('unknown', error);
}

/** Extensão do nome original; `jpg` quando não dá para saber. */
function extensionOf(filename: string, mimeType: string): string {
  const fromName = /\.([a-z0-9]{2,5})$/i.exec(filename)?.[1];
  if (fromName) return fromName.toLowerCase();
  const fromType = /^image\/([a-z0-9+.-]+)$/i.exec(mimeType)?.[1];
  return fromType === 'jpeg' ? 'jpg' : (fromType ?? 'jpg');
}

/**
 * Nome único a cada envio, nunca o mesmo caminho de novo.
 *
 * O bucket tem política de `insert` e de `delete`, mas **não tem de `update`**
 * (ADR 0008): um `upload(..., { upsert: true })` levaria 403. Então a capa nova
 * nasce com outro nome e a antiga é removida depois — o que também evita
 * precisar de migração para esta feature.
 */
function coverPathFor(userId: string, file: CoverFile): string {
  const unique = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return `${userId}/${unique}.${extensionOf(file.filename, file.mimeType)}`;
}

export function createSupabaseListingsRepository(
  client: SupabaseListingsClient | null,
): ListingsRepository {
  const requireClient = () => {
    if (!client) throw new ListingError('not_configured');
    return client;
  };

  const requireUserId = async (supabase: SupabaseListingsClient) => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw mapSupabaseListingError(error);
    const id = data?.user?.id;
    if (!id) throw new ListingError('not_allowed');
    return id;
  };

  const toListing = (supabase: SupabaseListingsClient, row: Row): MyListing => ({
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
    ownerId: row.owner_id,
    coverPath: row.cover_path,
    coverUrl: row.cover_path
      ? supabase.storage.from(COVERS_BUCKET).getPublicUrl(row.cover_path).data.publicUrl
      : null,
    status: row.status,
    createdAt: row.created_at,
  });

  /** Os campos da linha, com os três da modalidade sempre juntos. */
  const rowOf = (draft: ListingDraft) => {
    const clean = normalizeDraft(draft);
    if (!isValid(validateDraft(clean))) throw new ListingError('invalid');
    return {
      title: clean.title,
      author: clean.author,
      category: clean.category,
      modality: clean.modality,
      // Os três viajam sempre juntos: as constraints do ADR 0008 olham a LINHA,
      // e um UPDATE parcial ao trocar de modalidade seria recusado.
      price_cents: clean.priceCents,
      trade_terms: clean.tradeTerms,
      condition: clean.condition,
      neighborhood: clean.neighborhood,
      city: clean.city,
      description: clean.description,
    };
  };

  const upload = async (supabase: SupabaseListingsClient, userId: string, file: CoverFile) => {
    const path = coverPathFor(userId, file);
    const { error } = await supabase.storage
      .from(COVERS_BUCKET)
      .upload(path, file.bytes, { contentType: file.mimeType });
    if (error) throw mapSupabaseListingError(error);
    return path;
  };

  /** Remoção de capa nunca derruba a operação principal: o anúncio é o que importa. */
  const discard = async (supabase: SupabaseListingsClient, path: string | null) => {
    if (!path) return;
    await supabase.storage.from(COVERS_BUCKET).remove([path]);
  };

  const mine = async (supabase: SupabaseListingsClient, userId: string, id: string) => {
    const { data, error } = await supabase
      .from(LISTINGS_TABLE)
      .select(columns)
      .eq('id', id)
      .eq('owner_id', userId)
      .maybeSingle();
    if (error) throw mapSupabaseListingError(error);
    if (!data) throw new ListingError('not_found');
    return toListing(supabase, data as unknown as Row);
  };

  const setStatus = async (id: string, from: MyListing['status'][], to: MyListing['status']) => {
    const supabase = requireClient();
    const userId = await requireUserId(supabase);
    const current = await mine(supabase, userId, id);
    if (!from.includes(current.status)) throw new ListingError('not_allowed');
    const { data, error } = await supabase
      .from(LISTINGS_TABLE)
      .update({ status: to })
      .eq('id', id)
      .eq('owner_id', userId)
      .select(columns)
      .maybeSingle();
    if (error) throw mapSupabaseListingError(error);
    if (!data) throw new ListingError('not_found');
    return toListing(supabase, data as unknown as Row);
  };

  return {
    async listMine() {
      const supabase = requireClient();
      const userId = await requireUserId(supabase);
      // A política de select libera todo anúncio disponível, de qualquer pessoa.
      // O filtro por dono é NOSSO, não da RLS: sem ele a estante mostraria o
      // catálogo inteiro.
      const { data, error } = await supabase
        .from(LISTINGS_TABLE)
        .select(columns)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });
      if (error) throw mapSupabaseListingError(error);
      return ((data ?? []) as unknown as Row[]).map((row) => toListing(supabase, row));
    },

    async getMineById(id) {
      const supabase = requireClient();
      return mine(supabase, await requireUserId(supabase), id);
    },

    async create(draft, cover) {
      const supabase = requireClient();
      const userId = await requireUserId(supabase);
      const path = cover ? await upload(supabase, userId, cover) : null;
      const { data, error } = await supabase
        .from(LISTINGS_TABLE)
        .insert({ ...rowOf(draft), owner_id: userId, cover_path: path })
        .select(columns)
        .maybeSingle();
      if (error) {
        // A linha não entrou: a foto que acabou de subir não pertence a nada.
        await discard(supabase, path);
        throw mapSupabaseListingError(error);
      }
      if (!data) {
        await discard(supabase, path);
        throw new ListingError('unknown');
      }
      return toListing(supabase, data as unknown as Row);
    },

    async update(id, draft, cover) {
      const supabase = requireClient();
      const userId = await requireUserId(supabase);
      const current = await mine(supabase, userId, id);
      if (!isEditable(current.status)) throw new ListingError('not_allowed');

      let path = current.coverPath;
      if (cover.kind === 'replace') path = await upload(supabase, userId, cover.file);
      else if (cover.kind === 'clear') path = null;

      const { data, error } = await supabase
        .from(LISTINGS_TABLE)
        .update({ ...rowOf(draft), cover_path: path })
        .eq('id', id)
        .eq('owner_id', userId)
        .select(columns)
        .maybeSingle();
      if (error) {
        if (cover.kind === 'replace') await discard(supabase, path);
        throw mapSupabaseListingError(error);
      }
      if (!data) throw new ListingError('not_found');

      // Só depois que a linha já aponta para a nova: se isto falhar, sobra um
      // arquivo sem uso — e não um anúncio apontando para uma capa apagada.
      if (cover.kind !== 'keep' && current.coverPath && current.coverPath !== path)
        await discard(supabase, current.coverPath);

      return toListing(supabase, data as unknown as Row);
    },

    archive: (id) => setStatus(id, ['disponivel'], 'arquivado'),
    republish: (id) => setStatus(id, ['arquivado'], 'disponivel'),

    async remove(id) {
      const supabase = requireClient();
      const userId = await requireUserId(supabase);
      const current = await mine(supabase, userId, id);
      if (!isEditable(current.status)) throw new ListingError('not_allowed');

      // A foto sai primeiro. O bucket é público: um arquivo órfão continua
      // acessível por link para quem já o tinha, e "excluí" tem de ser verdade.
      await discard(supabase, current.coverPath);

      const { error } = await supabase
        .from(LISTINGS_TABLE)
        .delete()
        .eq('id', id)
        .eq('owner_id', userId);
      if (error) throw mapSupabaseListingError(error);
    },
  };
}
