import type { SecurityRepository } from './SecurityRepository';
import type { Report } from '../entities/Report';
import type { BlockedPerson, UserBlock } from '../entities/UserBlock';
import { SecurityError, type SecurityErrorCode } from '../entities/SecurityError.ts';

/** Repositório em memória para testes e prévias; `names` faz o papel do primeiro nome do banco. */
export function createMemorySecurityRepository(
  currentUserId: string,
  names: Record<string, string> = {},
) {
  let blocks: UserBlock[] = [];
  const reports: Report[] = [];
  let failure: SecurityErrorCode | null = null;
  let clock = 0;

  const guard = () => {
    if (failure) throw new SecurityError(failure);
  };

  const repository: SecurityRepository = {
    async blockUser(blockedId) {
      guard();
      const exists = blocks.find((b) => b.blockedId === blockedId);
      if (exists) return exists;
      clock += 1;
      const block: UserBlock = {
        id: `block-${clock}`,
        blockerId: currentUserId,
        blockedId,
        createdAt: new Date(Date.UTC(2026, 9, 1) + clock * 1000).toISOString(),
      };
      blocks.push(block);
      return block;
    },
    async unblockUser(blockedId) {
      guard();
      blocks = blocks.filter((b) => b.blockedId !== blockedId);
    },
    async listBlocked(): Promise<BlockedPerson[]> {
      guard();
      return [...blocks]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((b) => ({
          blockedId: b.blockedId,
          firstName: names[b.blockedId] ?? null,
          createdAt: b.createdAt,
        }));
    },
    async createReport(target, reason, details = null) {
      guard();
      if (!reason.trim() || (!target.userId && !target.listingId))
        throw new SecurityError('invalid');
      const report: Report = {
        id: `report-${reports.length + 1}`,
        reporterId: currentUserId,
        reportedUserId: target.userId,
        reportedListingId: target.listingId,
        reason,
        details,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      reports.push(report);
      return report;
    },
  };

  return {
    repository,
    reports: () => [...reports],
    blocks: () => [...blocks],
    fail: (code: SecurityErrorCode | null) => {
      failure = code;
    },
  };
}
