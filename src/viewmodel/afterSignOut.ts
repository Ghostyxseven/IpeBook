/**
 * Recuperar o acesso a partir de Alterar senha (Figma 07.18 e 07.19): a pessoa sai da conta e
 * a recuperação abre com o e-mail dela. O layout da área logada redireciona assim que a sessão
 * acaba, então o destino é marcado antes de sair; a recuperação limpa a marca ao abrir.
 */
let recoveryEmail: string | null = null;
/** Conta excluída (Figma 07.17): depois de sair, mostra a confirmação em vez de Entrar. */
let accountDeleted = false;

export const afterSignOut = {
  markRecovery(email: string) {
    recoveryEmail = email;
  },
  recoveryEmail(): string | null {
    return recoveryEmail;
  },
  markAccountDeleted() {
    recoveryEmail = null;
    accountDeleted = true;
  },
  accountDeleted(): boolean {
    return accountDeleted;
  },
  clear() {
    recoveryEmail = null;
    accountDeleted = false;
  },
};
