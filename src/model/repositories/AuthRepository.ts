import type { User } from '../entities/User';

/**
 * Contrato de autenticação usado pelas ViewModels.
 * Todas as operações rejeitam com `AuthError` (ver entities/AuthError.ts).
 */
export interface AuthRepository {
  /**
   * Sessão salva no aparelho. Rejeita com `AuthError('network')` quando não dá para
   * confirmá-la sem internet (token vencido): isso não significa que a pessoa saiu.
   */
  getCurrentUser(): Promise<User | null>;
  /** Avisa a cada entrada ou saída. Retorna a função para cancelar a inscrição. */
  onUserChange(listener: (user: User | null) => void): () => void;
  signIn(email: string, password: string): Promise<User>;
  /**
   * Cria a conta e envia o código de confirmação por e-mail. `termsAcceptedAt` registra quando
   * a pessoa aceitou os Termos de Uso e a Política de Privacidade (Figma 01.03).
   */
  signUp(name: string, email: string, password: string, termsAcceptedAt: Date): Promise<void>;
  /** Confirma o e-mail com o código e inicia a sessão. */
  verifySignUp(email: string, code: string): Promise<User>;
  resendSignUpCode(email: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  /**
   * Confirma o código de recuperação e grava a nova senha. A pessoa só passa a constar
   * como autenticada (getCurrentUser/onUserChange) depois que a senha foi gravada.
   * Se a gravação falhar, o código continua confirmado: chamar de novo com o mesmo
   * e-mail tenta só gravar a senha, sem pedir outro código.
   */
  resetPassword(email: string, code: string, newPassword: string): Promise<void>;
  /**
   * Troca a senha de quem está na conta (Figma 07.18). Confere a senha atual antes e rejeita
   * com `AuthError('wrong_current_password')` se ela não conferir.
   */
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  /** Desiste de uma recuperação com código confirmado e senha não gravada. */
  cancelPasswordRecovery(): Promise<void>;
  signOut(): Promise<void>;
}
