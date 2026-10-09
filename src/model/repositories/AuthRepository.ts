import type { User } from '../entities/User';

/**
 * Abre o navegador do sistema para o OAuth (Google) e volta pelo esquema do app. A
 * implementação fica em `src/infra/` (`expo-linking` e `expo-web-browser`): o Model não
 * depende de Expo (ADR 0002 e ADR 0012).
 */
export interface OAuthBrowser {
  /** Monta a URL de retorno do app para o caminho dado (ex.: "ipebook://auth/callback"). */
  createRedirectUrl(path: string): string;
  /** Abre `url` e espera a pessoa concluir ou fechar; `result.url` traz o retorno. */
  openAuthSession(url: string, redirectUrl: string): Promise<{ type: string; url?: string }>;
}

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
   * Entra ou cria a conta com o Google (Figma 01.02, 01.03 e 01.09). Abre o navegador do
   * sistema; a sessão começa com o retorno. Rejeita com `AuthError('oauth_cancelled')` se a
   * pessoa fechar o navegador sem concluir.
   */
  signInWithGoogle(): Promise<User>;
  /** Define senha do IpêBook e dados na identidade Google atual, sem criar outra conta. */
  completeGoogleRegistration(name: string, password: string, termsAcceptedAt: Date): Promise<User>;
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
