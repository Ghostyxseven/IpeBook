import type { ListingDraft, MyListing } from '../entities/Listing';
import { isEditable } from '../entities/Listing.ts';
import { ListingError } from '../entities/ListingError.ts';
import { isValid, normalizeDraft, validateDraft } from '../services/listingValidation.ts';
import type { CoverFile, ListingsRepository } from './ListingsRepository';

const newestFirst = (a: MyListing, b: MyListing) =>
  b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);

/**
 * Anúncios em memória para teste.
 *
 * `covers` guarda os caminhos que "existem no bucket": é o que permite provar
 * que excluir o anúncio apaga a foto, e que trocar a capa remove a antiga —
 * duas regras da spec que, sem isso, só dariam para conferir no Supabase.
 */
export function createMemoryListingsRepository(initial: MyListing[] = []) {
  const listings = [...initial];
  const covers = new Set<string>(
    initial.map((item) => item.coverPath).filter((p): p is string => !!p),
  );
  const calls: string[] = [];
  let nextError: ListingError | null = null;
  let delay: Promise<void> | null = null;
  let sequence = initial.length;

  const takeError = () => {
    const error = nextError;
    nextError = null;
    if (error) throw error;
  };

  const find = (id: string) => {
    const index = listings.findIndex((item) => item.id === id);
    if (index === -1) throw new ListingError('not_found');
    return index;
  };

  const requireEditable = (listing: MyListing) => {
    if (!isEditable(listing.status)) throw new ListingError('not_allowed');
  };

  const store = (file: CoverFile) => {
    const path = `owner/${++sequence}-${file.filename}`;
    covers.add(path);
    return path;
  };

  const fromDraft = (
    draft: ListingDraft,
  ): Omit<MyListing, 'id' | 'coverPath' | 'coverUrl' | 'status' | 'createdAt'> => {
    const clean = normalizeDraft(draft);
    if (!isValid(validateDraft(clean))) throw new ListingError('invalid');
    return {
      title: clean.title,
      author: clean.author,
      category: clean.category,
      modality: clean.modality,
      priceCents: clean.priceCents,
      tradeTerms: clean.tradeTerms,
      condition: clean.condition,
      neighborhood: clean.neighborhood,
      city: clean.city,
      description: clean.description,
    };
  };

  const repository: ListingsRepository = {
    async listMine() {
      calls.push('listMine');
      if (delay) await delay;
      takeError();
      return [...listings].sort(newestFirst);
    },

    async getMineById(id) {
      calls.push(`getMineById:${id}`);
      if (delay) await delay;
      takeError();
      return listings[find(id)] as MyListing;
    },

    async create(draft, cover) {
      calls.push(`create:${draft.title}`);
      if (delay) await delay;
      takeError();
      const path = cover ? store(cover) : null;
      const listing: MyListing = {
        ...fromDraft(draft),
        id: `listing-${++sequence}`,
        status: 'disponivel',
        coverPath: path,
        coverUrl: path ? `memory://${path}` : null,
        createdAt: new Date().toISOString(),
      };
      listings.push(listing);
      return listing;
    },

    async update(id, draft, cover) {
      calls.push(`update:${id}`);
      if (delay) await delay;
      takeError();
      const index = find(id);
      const current = listings[index] as MyListing;
      requireEditable(current);

      let path = current.coverPath;
      if (cover.kind === 'replace') {
        const next = store(cover.file);
        // A antiga sai DEPOIS que a nova entrou: se a remoção falhar sobra um
        // arquivo sem uso, o que é melhor que um anúncio sem capa.
        if (current.coverPath) covers.delete(current.coverPath);
        path = next;
      } else if (cover.kind === 'clear') {
        if (current.coverPath) covers.delete(current.coverPath);
        path = null;
      }

      const next: MyListing = {
        ...current,
        ...fromDraft(draft),
        coverPath: path,
        coverUrl: path ? `memory://${path}` : null,
      };
      listings[index] = next;
      return next;
    },

    async archive(id) {
      calls.push(`archive:${id}`);
      if (delay) await delay;
      takeError();
      const index = find(id);
      const current = listings[index] as MyListing;
      requireEditable(current);
      const next: MyListing = { ...current, status: 'arquivado' };
      listings[index] = next;
      return next;
    },

    async republish(id) {
      calls.push(`republish:${id}`);
      if (delay) await delay;
      takeError();
      const index = find(id);
      const current = listings[index] as MyListing;
      if (current.status !== 'arquivado') throw new ListingError('not_allowed');
      const next: MyListing = { ...current, status: 'disponivel' };
      listings[index] = next;
      return next;
    },

    async remove(id) {
      calls.push(`remove:${id}`);
      if (delay) await delay;
      takeError();
      const index = find(id);
      const current = listings[index] as MyListing;
      requireEditable(current);
      // A foto primeiro: o bucket é público, e uma capa órfã continua acessível
      // por link para quem já o tinha.
      if (current.coverPath) covers.delete(current.coverPath);
      listings.splice(index, 1);
    },
  };

  return {
    repository,
    calls,
    /** Os caminhos que ainda "existem no bucket". */
    covers,
    all: () => [...listings],
    fail: (code: ListingError['code']) => {
      nextError = new ListingError(code);
    },
    hold: (until: Promise<void> | null) => {
      delay = until;
    },
  };
}
