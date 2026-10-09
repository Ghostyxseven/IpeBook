/** Conta de quem está no app. As operações rejeitam com `AuthError`. */
export interface AccountRepository {
  /**
   * Apaga a conta e tudo o que é dela (anúncios, capas, conversas, perfil) e encerra a sessão.
   * Não pode ser desfeito (Figma 07.09).
   */
  deleteAccount(): Promise<void>;
}
