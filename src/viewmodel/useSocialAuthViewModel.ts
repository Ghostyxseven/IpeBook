import { useState } from 'react';
import { toAuthError } from '../model/entities/AuthError.ts';
import type { AuthRepository } from '../model/repositories/AuthRepository';
import { authErrorMessage } from '../model/services/authMessages.ts';
import { useAsyncAction } from './useAsyncAction.ts';

/** Botão "Continuar com o Google" do Entrar e do Criar conta (Figma 01.02 e 01.03). */
export function useSocialAuthViewModel(repository: AuthRepository) {
  const [error, setError] = useState<string | undefined>();
  const [loading, run] = useAsyncAction();

  return {
    error,
    loading,
    continueWithGoogle: () =>
      run(async () => {
        setError(undefined);
        try {
          await repository.signInWithGoogle();
          // A sessão muda e a proteção de rotas leva à área autenticada.
        } catch (failure) {
          const { code } = toAuthError(failure);
          // Fechar o navegador sem concluir não é erro: a pessoa só desistiu.
          if (code === 'oauth_cancelled') return;
          setError(authErrorMessage(code));
        }
      }),
  };
}
