/**
 * Monta as dependências reais da autenticação (padrão Factory da disciplina).
 * As telas usam estes hooks e não conhecem o Supabase.
 */
import * as WebBrowser from 'expo-web-browser';
import { localStore } from '../infra/localStore';
import { oauthBrowser } from '../infra/oauthBrowser';
import { bindSessionRefreshToAppState } from '../infra/sessionRefresh';
import { supabase } from '../infra/supabaseClient';
import { createPreferencesRepository } from '../model/repositories/preferencesRepository';
import { createSupabaseAuthRepository } from '../model/repositories/supabaseAuthRepository';
import { useChangePasswordViewModel } from '../viewmodel/useChangePasswordViewModel';
import { useLoginViewModel } from '../viewmodel/useLoginViewModel';
import { useOnboardingViewModel } from '../viewmodel/useOnboardingViewModel';
import { usePasswordRecoveryViewModel } from '../viewmodel/usePasswordRecoveryViewModel';
import { useSession } from '../viewmodel/useSession';
import { useSignUpViewModel } from '../viewmodel/useSignUpViewModel';
import { useSocialAuthViewModel } from '../viewmodel/useSocialAuthViewModel';
import { useStartViewModel } from '../viewmodel/useStartViewModel';
import { useVerifyEmailViewModel } from '../viewmodel/useVerifyEmailViewModel';

bindSessionRefreshToAppState(supabase);
// Fecha a aba auxiliar do login com o Google quando o navegador volta para a Web (sem efeito
// no Android e no iOS, que fecham a sessão do sistema sozinhos).
WebBrowser.maybeCompleteAuthSession();

export const authRepository = createSupabaseAuthRepository(supabase, oauthBrowser);
export const preferencesRepository = createPreferencesRepository(localStore);

export const useAppSession = () => useSession(authRepository);
export const useStart = () => useStartViewModel(authRepository, preferencesRepository);
export const useLogin = (options: Parameters<typeof useLoginViewModel>[1]) =>
  useLoginViewModel(authRepository, options);
export const useSignUp = (options: Parameters<typeof useSignUpViewModel>[1]) =>
  useSignUpViewModel(authRepository, options);
export const useSocialAuth = () => useSocialAuthViewModel(authRepository);
export const useVerifyEmail = (email: string) => useVerifyEmailViewModel(authRepository, email);
export const usePasswordRecovery = (initialEmail?: string) =>
  usePasswordRecoveryViewModel(authRepository, initialEmail);
export const useChangePassword = (options: Parameters<typeof useChangePasswordViewModel>[1]) =>
  useChangePasswordViewModel(authRepository, options);
export const useOnboarding = (options: Parameters<typeof useOnboardingViewModel>[1]) =>
  useOnboardingViewModel(preferencesRepository, options);
