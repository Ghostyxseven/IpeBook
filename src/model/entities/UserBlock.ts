export type UserBlock = {
  id: string;
  blockerId: string;
  blockedId: string;
  /** Data ISO 8601. */
  createdAt: string;
};

/** Uma pessoa da lista "Pessoas bloqueadas" (Figma 07.10): só o primeiro nome aparece. */
export type BlockedPerson = {
  blockedId: string;
  firstName: string | null;
  /** Data ISO 8601. */
  createdAt: string;
};
