export type UserBlock = {
  id: string;
  blockerId: string;
  blockedId: string;
  /** Data ISO 8601. */
  createdAt: string;
};
