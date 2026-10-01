import { CatalogError } from '../entities/CatalogError.ts';
import type { Listing } from '../entities/Listing';
import { effectiveFilters } from '../services/catalogFilters.ts';
import type { CatalogCursor, CatalogRepository } from './CatalogRepository';

const newestFirst = (a: Listing, b: Listing) =>
  b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);

const isAfter = (listing: Listing, cursor: CatalogCursor) =>
  listing.createdAt < cursor.createdAt ||
  (listing.createdAt === cursor.createdAt && listing.id < cursor.id);

/** Catálogo em memória para testes; `fail` simula o próximo erro do servidor. */
export function createMemoryCatalogRepository(initial: Listing[] = []) {
  const listings = [...initial];
  const calls: string[] = [];
  let nextError: CatalogError | null = null;
  let delay: Promise<void> | null = null;

  const takeError = () => {
    const error = nextError;
    nextError = null;
    if (error) throw error;
  };

  const repository: CatalogRepository = {
    async list({ filters, cursor, limit }) {
      calls.push(`list:${JSON.stringify({ filters, cursor, limit })}`);
      if (delay) await delay;
      takeError();
      const { query, modalities, category } = effectiveFilters(filters);
      const text = query.toLocaleLowerCase('pt-BR');
      const matches = listings
        .filter((item) => item.status === 'disponivel' || item.status === 'reservado')
        .filter(
          (item) =>
            !text ||
            item.title.toLocaleLowerCase('pt-BR').includes(text) ||
            item.author.toLocaleLowerCase('pt-BR').includes(text) ||
            item.category.toLocaleLowerCase('pt-BR').includes(text),
        )
        .filter((item) => !modalities.length || modalities.includes(item.modality))
        .filter((item) => !category || item.category === category)
        .sort(newestFirst);
      const total = matches.length;
      const remaining = matches.filter((item) => !cursor || isAfter(item, cursor));
      const items = remaining.slice(0, limit);
      const last = items[items.length - 1];
      return {
        items,
        nextCursor:
          remaining.length > limit && last ? { createdAt: last.createdAt, id: last.id } : null,
        total: cursor ? null : total,
      };
    },
    async getById(id) {
      calls.push(`get:${id}`);
      if (delay) await delay;
      takeError();
      const listing = listings.find((item) => item.id === id);
      if (!listing) throw new CatalogError('not_found');
      return listing;
    },
  };

  return {
    repository,
    calls,
    add: (...items: Listing[]) => listings.push(...items),
    fail: (code: CatalogError['code']) => {
      nextError = new CatalogError(code);
    },
    /** Segura as próximas respostas até a promessa resolver. */
    hold: (until: Promise<void> | null) => {
      delay = until;
    },
  };
}
