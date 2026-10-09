/**
 * Tela de sucesso que deve aparecer quando a sessão começar (Figma 01.09 e 01.13).
 *
 * Confirmar o código já inicia a sessão, e o layout das telas de entrada redireciona assim
 * que isso acontece, antes de a ViewModel receber a resposta. Por isso a ViewModel marca o
 * destino antes de chamar o provedor e desmarca se a chamada falhar; a tela de sucesso limpa
 * a marca ao abrir.
 */
export type AfterSignIn = 'emailConfirmed' | 'passwordUpdated';

let pending: AfterSignIn | null = null;

export const afterSignIn = {
  mark(outcome: AfterSignIn) {
    pending = outcome;
  },
  peek(): AfterSignIn | null {
    return pending;
  },
  clear() {
    pending = null;
  },
};
