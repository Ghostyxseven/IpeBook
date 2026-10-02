import type { SecurityRepository } from './SecurityRepository';
import type { Report } from '../entities/Report';
import type { UserBlock } from '../entities/UserBlock';

export function createMemorySecurityRepository(currentUserId: string): SecurityRepository {
  const blocks: UserBlock[] = [];
  const reports: Report[] = [];

  return {
    async blockUser(blockedId: string): Promise<UserBlock> {
      const exists = blocks.find((b) => b.blockerId === currentUserId && b.blockedId === blockedId);
      if (exists) {
        throw new Error('User already blocked');
      }

      const block: UserBlock = {
        id: `block-${blocks.length + 1}`,
        blockerId: currentUserId,
        blockedId,
        createdAt: new Date().toISOString(),
      };
      blocks.push(block);
      return block;
    },
    async createReport(
      target: { userId: string | null; listingId: string | null },
      reason: string,
      details: string | null = null,
    ): Promise<Report> {
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
}
