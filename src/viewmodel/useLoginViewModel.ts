import { useState } from 'react';
import { toAuthError } from '../model/entities/AuthError.ts';
import type { AuthRepository } from '../model/repositories/AuthRepository';
import { authErrorMessage } from '../model/services/authMessages.ts';
import {
  hasErrors,
  normalizeEmail,
  validateEmail,
  validateLoginPassword,
  type FieldErrors,
} from '../model/services/authValidation.ts';
import { useAsyncAction } from './useAsyncAction.ts';

type Field = 'email' | 'password';

export function useLoginViewModel(
  repository: AuthRepository,
  { onNeedsVerification }: { onNeedsVerification: (email: string) => void },
) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [submitting, run] = useAsyncAction();

  const clear = (field: Field) =>
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));

  return {
    email,
    password,
    errors,
    submitting,
    setEmail: (value: string) => {
      setEmail(value);
      clear('email');
    },
    setPassword: (value: string) => {
      setPassword(value);
      clear('password');
    },
    submit: () =>
      run(async () => {
        const next = { email: validateEmail(email), password: validateLoginPassword(password) };
        setErrors(next);
        if (hasErrors(next)) return;
        const address = normalizeEmail(email);
        try {
          await repository.signIn(address, password);
          // A sessão muda e a proteção de rotas leva à área autenticada.
        } catch (failure) {
          const { code } = toAuthError(failure);
          if (code === 'email_not_confirmed') {
            await repository.resendSignUpCode(address).catch(() => undefined);
            onNeedsVerification(address);
            return;
          }
          setErrors({ form: authErrorMessage(code) });
        }
      }),
  };
}
