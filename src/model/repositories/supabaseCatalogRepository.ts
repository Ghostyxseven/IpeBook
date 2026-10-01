import type { SupabaseClient } from '@supabase/supabase-js';
import { CatalogError, toCatalogError, type Listing } from '../entities/Listing.ts';
import type { CatalogRepository } from './CatalogRepository';

/** Só `from` é usado; facilita testar com um cliente falso. */
export type SupabaseCatalogClient = Pick<SupabaseClient, 'from'>;

const modalities = { venda: 'Venda', troca: 'Troca', doacao: 'Doação' } as const;
const statuses = ['disponivel', 'reservado', 'concluido'] as const;

type Row = Record<string, unknown>;
const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null);

/**
 * Converte uma linha da tabela `listings` (contrato em specs/023-catalogo-livros/contracts).
 * Linhas incompletas ou inconsistentes viram `null` e são descartadas: nada é inventado.
 */
export function rowToListing(row: Row): Listing | null {
  const id = text(row.id);
  const title = text(row.title);
  const author = text(row.author);
  const category = text(row.category);
  const condition = text(row.condition);
  const createdAt = text(row.created_at);
  const modality = modalities[row.modality as keyof typeof modalities];
  const status = statuses.find((item) => item === row.status);
  if (!id || !title || !author || !category || !condition || !createdAt || !modality || !status) {
    return null;
  }
  const base = {
    id,
    title,
    author,
    category,
    condition,
    description: text(row.description) ?? '',
    status,
    createdAt,
    ...(text(row.cover_url) ? { coverUrl: text(row.cover_url)! } : {}),
    ...(text(row.location) ? { location: text(row.location)! } : {}),
  };
  if (modality === 'Venda') {
    const price = row.price_cents;
    return typeof price === 'number' && Number.isInteger(price) && price > 0
      ? { ...base, modality, priceCents: price }
      : null;
  }
  if (modality === 'Troca') {
    const interest = text(row.exchange_interest);
    return interest ? { ...base, modality, exchangeInterest: interest } : null;
  }
  return { ...base, modality };
}

function failure(error: { message?: string; status?: number } | null) {
  const network = error?.status === 0 || /fetch|network/i.test(error?.message ?? '');
  return new CatalogError(network ? 'network' : 'unknown', error);
}

export function createSupabaseCatalogRepository(
  client: SupabaseCatalogClient | null,
): CatalogRepository {
  const ready = () => {
    if (!client) throw new CatalogError('not_configured');
    return client;
  };
  return {
    async list() {
      try {
        const { data, error } = await ready()
          .from('listings')
          .select('*')
          .neq('status', 'concluido')
          .order('created_at', { ascending: false });
        if (error) throw failure(error);
        return (data ?? []).map(rowToListing).filter((item): item is Listing => item !== null);
      } catch (cause) {
        throw toCatalogError(cause);
      }
    },
    async get(id) {
      try {
        const { data, error } = await ready()
          .from('listings')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw failure(error);
        const listing = data ? rowToListing(data) : null;
        return listing && listing.status !== 'concluido' ? listing : null;
      } catch (cause) {
        throw toCatalogError(cause);
      }
    },
  };
}
