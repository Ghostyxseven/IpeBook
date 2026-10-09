/**
 * Aviso mostrado sobre Conversas quando uma proposta é recusada (Figma 06.18), em vez de uma
 * tela de desfecho própria. A tela de Conversas lê a marca ao abrir e limpa em seguida.
 */
export type NegotiationOutcome = 'rejected';

let pending: { outcome: NegotiationOutcome; title: string; message: string } | null = null;

export const afterNegotiationOutcome = {
  mark(outcome: NegotiationOutcome, title: string, message: string) {
    pending = { outcome, title, message };
  },
  peek() {
    return pending;
  },
  clear() {
    pending = null;
  },
};
