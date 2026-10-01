import type { SupabaseClient } from '@supabase/supabase-js';
import { CatalogError } from '../entities/CatalogError.ts';
import type { Listing } from '../entities/Listing';
import { effectiveFilters, toLikePattern } from '../services/catalogFilters.ts';
import type { CatalogRepository } from './CatalogRepository';

/** Só `from` e `storage` são usados; facilita testar com um cliente falso. */
export type SupabaseCatalogClient = Pick<SupabaseClient, 'from' | 'storage'>;

/** View de leitura do ADR 0008: já filtra situação e exclui os anúncios da própria pessoa. */
export const CATALOG_VIEW = 'catalog_listings';
export const COVERS_BUCKET = 'listing-covers';

const columns =
  'id,title,author,category,modality,price_cents,trade_terms,condition,neighborhood,city,description,cover_path,status,owner_first_name,created_at';

type Row = {
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
  owner_first_name: string | null;
  created_at: string;
};

export function mapSupabaseCatalogError(error: unknown): CatalogError {
  if (error instanceof CatalogError) return error;
  const { code, message } = (error ?? {}) as { code?: string; message?: string };
  // PGRST205/42P01: a view do ADR 0008 ainda não foi criada neste projeto.
  if (code === 'PGRST205' || code === '42P01') return new CatalogError('not_configured', error);
  // 22P02: texto que não é UUID na rota de detalhe; PGRST116: nenhuma linha.
  if (code === '22P02' || code === 'PGRST116') return new CatalogError('not_found', error);
  if (/fetch|network/i.test(message ?? '')) return new CatalogError('network', error);
  return new CatalogError('unknown', error);
}

/** Valor entre aspas para o filtro `or` do PostgREST aceitar vírgulas e parênteses. */
const quoted = (value: string) => `"${value.replace(/["\\]/g, (char) => `\\${char}`)}"`;

export function createSupabaseCatalogRepository(
  client: SupabaseCatalogClient | null,
): CatalogRepository {
  const requireClient = () => {
    if (!client) throw new CatalogError('not_configured');
    return client;
  };

  const toListing = (supabase: SupabaseCatalogClient, row: Row): Listing => ({
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
      ? supabase.storage.from(COVERS_BUCKET).getPublicUrl(row.cover_path).data.publicUrl
      : null,
    status: row.status,
    ownerFirstName: row.owner_first_name,
    createdAt: row.created_at,
  });

  return {
    async list({ filters, cursor, limit }) {
      const supabase = requireClient();
      const { query, modalities, category } = effectiveFilters(filters);
      // Conta o total só na primeira página, para o resumo "3 livros · Mais recentes".
      let request = supabase
        .from(CATALOG_VIEW)
        .select(columns, cursor ? undefined : { count: 'exact' });
      if (query) {
        const pattern = quoted(toLikePattern(query));
        request = request.or(
          `title.ilike.${pattern},author.ilike.${pattern},category.ilike.${pattern}`,
        );
      }
      if (modalities.length) request = request.in('modality', modalities);
      if (category) request = request.eq('category', category);
      if (cursor) {
        const at = quoted(cursor.createdAt);
        request = request.or(
          `created_at.lt.${at},and(created_at.eq.${at},id.lt.${quoted(cursor.id)})`,
        );
      }
      // Pede um a mais para saber se existe próxima página.
      const { data, error, count } = await request
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit + 1);
      if (error) throw mapSupabaseCatalogError(error);
      const rows = (data ?? []) as unknown as Row[];
      const items = rows.slice(0, limit).map((row) => toListing(supabase, row));
      const last = items[items.length - 1];
      return {
        items,
        nextCursor: rows.length > limit && last ? { createdAt: last.createdAt, id: last.id } : null,
        total: cursor ? null : (count ?? null),
      };
    },
    async getById(id) {
      const supabase = requireClient();
      const { data, error } = await supabase
        .from(CATALOG_VIEW)
        .select(columns)
        .eq('id', id)
        .maybeSingle();
      if (error) throw mapSupabaseCatalogError(error);
      if (!data) throw new CatalogError('not_found');
      return toListing(supabase, data as unknown as Row);
    },
  };
}
