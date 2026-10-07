import { DraftError, type DraftRecord } from '../entities/Draft.ts';
import type { ListingDraft } from '../entities/Listing';
import type { DraftsRepository } from './DraftsRepository';

export const DRAFTS_KEY = 'ipebook:rascunhos';

/**
 * Teto de rascunhos guardados (ADR 0028): alto o bastante para ninguém esbarrar
 * por uso normal, baixo o bastante para o armazenamento não crescer sem fim.
 * Passando disso, o mais antigo sai.
 */
export const MAX_DRAFTS = 20;

/** Lê e descarta o que não for uma lista de rascunhos — dado velho não derruba a tela. */
function read(storage: Storage): DraftRecord[] {
  const raw = storage.getItem(DRAFTS_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is DraftRecord =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as DraftRecord).id === 'string' &&
        typeof (item as DraftRecord).savedAt === 'string' &&
        typeof (item as DraftRecord).draft === 'object',
    );
  } catch {
    // JSON corrompido é o mesmo que não ter rascunho: melhor começar limpo do
    // que impedir a pessoa de anunciar por causa de dado antigo.
    return [];
  }
}

function write(storage: Storage, records: readonly DraftRecord[]): void {
  try {
    storage.setItem(DRAFTS_KEY, JSON.stringify(records.slice(0, MAX_DRAFTS)));
  } catch (cause) {
    // Armazenamento cheio ou indisponível. Quem chamou avisa; o formulário
    // continua preenchido e a pessoa pode publicar assim mesmo.
    throw new DraftError('storage', cause);
  }
}

/** Identificador curto e único o bastante para uma lista de 20 no mesmo aparelho. */
function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createLocalDraftsRepository(storage: Storage | null): DraftsRepository {
  const requireStorage = () => {
    if (!storage) throw new DraftError('storage');
    return storage;
  };

  return {
    async list() {
      const store = requireStorage();
      return read(store).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    },

    async save(draft: ListingDraft) {
      const store = requireStorage();
      const record: DraftRecord = { id: newId(), draft, savedAt: new Date().toISOString() };
      write(store, [record, ...read(store)]);
      return record;
    },

    async update(id, draft) {
      const store = requireStorage();
      const records = read(store);
      const at = records.findIndex((record) => record.id === id);
      if (at < 0) throw new DraftError('not_found');
      const updated: DraftRecord = { id, draft, savedAt: new Date().toISOString() };
      // Sai de onde estava e volta para o topo: foi o último em que se mexeu.
      write(store, [updated, ...records.filter((record) => record.id !== id)]);
      return updated;
    },

    async remove(id) {
      const store = requireStorage();
      write(
        store,
        read(store).filter((record) => record.id !== id),
      );
    },
  };
}
