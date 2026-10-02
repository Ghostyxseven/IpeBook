export type ReportStatus = 'pending' | 'resolved';

export type Report = {
  id: string;
  reporterId: string;
  reportedUserId: string | null;
  reportedListingId: string | null;
  reason: string;
  details: string | null;
  status: ReportStatus;
  /** Data ISO 8601. */
  createdAt: string;
};
