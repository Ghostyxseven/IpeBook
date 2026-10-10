import type { SecurityRepository } from './SecurityRepository';
import type { Report, ReportModerationItem, ReportStatus } from '../entities/Report';
import type { BlockedPerson, UserBlock } from '../entities/UserBlock';
import { SecurityError, type SecurityErrorCode } from '../entities/SecurityError.ts';

/** Repositório em memória para testes e prévias; `names` faz o papel do primeiro nome do banco. */
export function createMemorySecurityRepository(
  currentUserId: string,
  names: Record<string, string> = {},
  listingTitles: Record<string, string> = {},
  isModerator = false,
) {
  let blocks: UserBlock[] = [];
  const reports: Report[] = [];
  let failure: SecurityErrorCode | null = null;
  let moderatorState = isModerator;
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
    async isModerator() {
      guard();
      return moderatorState;
    },
    async listModerationReports(status?: ReportStatus): Promise<ReportModerationItem[]> {
      guard();
      if (!moderatorState) throw new SecurityError('unauthorized');
      const filtered = status ? reports.filter((r) => r.status === status) : reports;
      return [...filtered]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((r) => ({
          id: r.id,
          reporterId: r.reporterId,
          reporterFirstName: names[r.reporterId] ?? null,
          reportedUserId: r.reportedUserId,
          reportedUserFirstName: r.reportedUserId ? (names[r.reportedUserId] ?? null) : null,
          reportedListingId: r.reportedListingId,
          reportedListingTitle: r.reportedListingId
            ? (listingTitles[r.reportedListingId] ?? null)
            : null,
          reason: r.reason,
          details: r.details,
          status: r.status,
          createdAt: r.createdAt,
        }));
    },
    async resolveReport(reportId: string): Promise<void> {
      guard();
      if (!moderatorState) throw new SecurityError('unauthorized');
      const report = reports.find((r) => r.id === reportId);
      if (!report) throw new SecurityError('not_found');
      report.status = 'resolved';
    },
  };

  return {
    repository,
    reports: () => [...reports],
    blocks: () => [...blocks],
    setModerator: (state: boolean) => {
      moderatorState = state;
    },
    seedReport: (report: Report) => {
      reports.push(report);
    },
    fail: (code: SecurityErrorCode | null) => {
      failure = code;
    },
  };
}
