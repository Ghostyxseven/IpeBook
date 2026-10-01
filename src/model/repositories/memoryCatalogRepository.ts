import { CatalogError, type Listing } from '../entities/Listing.ts';
import type { CatalogRepository } from './CatalogRepository';

/** Implementação em memória para testes e desenvolvimento; não traz dados de exemplo próprios. */
export function createMemoryCatalogRepository(
  initial: Listing[] = [],
  options: { failWith?: CatalogError; delayMs?: number } = {},
): CatalogRepository & { set(listings: Listing[]): void } {
  let listings = [...initial];
  const wait = () =>
    options.delayMs
      ? new Promise((resolve) => setTimeout(resolve, options.delayMs))
      : Promise.resolve();
  return {
    set(next) {
      listings = [...next];
    },
    async list() {
      await wait();
      if (options.failWith) throw options.failWith;
      return [...listings];
    },
    async get(id) {
      await wait();
      if (options.failWith) throw options.failWith;
      return listings.find((listing) => listing.id === id) ?? null;
    },
  };
}
