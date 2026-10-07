import type { Report } from '../entities/Report';
import type { BlockedPerson, UserBlock } from '../entities/UserBlock';

export interface SecurityRepository {
  /** Bloquear quem já está bloqueado não é erro: devolve o bloqueio que existe. */
  blockUser(blockedId: string): Promise<UserBlock>;
  unblockUser(blockedId: string): Promise<void>;
  /** Quem a pessoa logada bloqueou, mais recente primeiro. */
  listBlocked(): Promise<BlockedPerson[]>;
  createReport(
    target: { userId: string | null; listingId: string | null },
    reason: string,
    details?: string | null,
  ): Promise<Report>;
}
