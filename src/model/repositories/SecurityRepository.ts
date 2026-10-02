import type { Report } from '../entities/Report';
import type { UserBlock } from '../entities/UserBlock';

export interface SecurityRepository {
  blockUser(blockedId: string): Promise<UserBlock>;
  createReport(
    target: { userId: string | null; listingId: string | null },
    reason: string,
    details?: string | null,
  ): Promise<Report>;
}
