import { DraftError, type DraftRecord } from '../entities/Draft.ts';
import type { DraftsRepository } from './DraftsRepository';
import { MAX_DRAFTS } from './localDraftsRepository.ts';

/** O dublê dos testes: mesmas regras de ordem e de teto, sem armazenamento. */
export function createMemoryDraftsRepository(
  seed: readonly DraftRecord[] = [],
  options: { failWith?: DraftError } = {},
): DraftsRepository & { records: DraftRecord[] } {
  let records: DraftRecord[] = [...seed];
  let tick = 0;
  const fail = () => {
    if (options.failWith) throw options.failWith;
  };
  // Relógio próprio: `new Date()` duas vezes no mesmo milissegundo daria a
  // mesma marca, e a ordenação do teste viraria sorteio.
  const now = () => new Date(Date.UTC(2026, 9, 7, 12, 0, (tick += 1))).toISOString();

  return {
    get records() {
      return records;
    },
    async list() {
      fail();
      return [...records].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    },
    async save(draft) {
      fail();
      const record: DraftRecord = { id: `draft-${tick + 1}`, draft, savedAt: now() };
      records = [record, ...records].slice(0, MAX_DRAFTS);
      return record;
    },
    async update(id, draft) {
      fail();
      if (!records.some((record) => record.id === id)) throw new DraftError('not_found');
      const updated: DraftRecord = { id, draft, savedAt: now() };
      records = [updated, ...records.filter((record) => record.id !== id)];
      return updated;
    },
    async remove(id) {
      fail();
      records = records.filter((record) => record.id !== id);
    },
  };
}
