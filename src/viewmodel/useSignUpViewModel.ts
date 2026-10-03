import { useState } from 'react';
import { toAuthError } from '../model/entities/AuthError.ts';
import type { AuthRepository } from '../model/repositories/AuthRepository';
import { authErrorMessage } from '../model/services/authMessages.ts';
import {
  hasErrors,
  normalizeEmail,
  validateEmail,
  validateName,
  validateNewPassword,
  type FieldErrors,
} from '../model/services/authValidation.ts';
import { useAsyncAction } from './useAsyncAction.ts';

// Sem confirmação de senha, como no Figma 01.03: o campo Senha tem o botão Mostrar.
type Field = 'name' | 'email' | 'password';

export function useSignUpViewModel(
  repository: AuthRepository,
  { onSignedUp }: { onSignedUp: (email: string) => void },
) {
  const [values, setValues] = useState<Record<Field, string>>({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [submitting, run] = useAsyncAction();

  return {
    values,
    errors,
    submitting,
    setField: (field: Field, value: string) => {
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    },
    submit: () =>
      run(async () => {
        const next: FieldErrors<Field> = {
          name: validateName(values.name),
          email: validateEmail(values.email),
          password: validateNewPassword(values.password),
        };
        setErrors(next);
        if (hasErrors(next)) return;
        const address = normalizeEmail(values.email);
        try {
          await repository.signUp(values.name.trim(), address, values.password);
          onSignedUp(address);
        } catch (failure) {
          const { code } = toAuthError(failure);
          const message = authErrorMessage(code);
          if (code === 'weak_password') setErrors({ password: message });
          else if (code === 'invalid_email' || code === 'email_in_use')
            setErrors({ email: message });
          else setErrors({ form: message });
        }
      }),
  };
}
