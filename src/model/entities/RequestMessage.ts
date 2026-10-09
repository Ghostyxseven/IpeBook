/** Uma mensagem da conversa de uma negociação (spec 029, ADR 0021). */
export type RequestMessage = {
  id: string;
  requestId: string;
  senderId: string;
  body: string;
  /** Data ISO 8601. */
  createdAt: string;
};
