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
  validateTermsAccepted,
  type FieldErrors,
} from '../model/services/authValidation.ts';
import { useAsyncAction } from './useAsyncAction.ts';

// Sem confirmação de senha, como no Figma 01.03: o campo Senha tem o botão Mostrar.
type Field = 'name' | 'email' | 'password';
type ErrorField = Field | 'terms';

export function useSignUpViewModel(
  repository: AuthRepository,
  { onSignedUp, now = () => new Date() }: { onSignedUp: (email: string) => void; now?: () => Date },
) {
  const [values, setValues] = useState<Record<Field, string>>({
    name: '',
    email: '',
    password: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors<ErrorField>>({});
  const [submitting, run] = useAsyncAction();

  return {
    values,
    acceptedTerms,
    errors,
    toggleTerms: () => {
      setAcceptedTerms((current) => !current);
      setErrors((current) => ({ ...current, terms: undefined, form: undefined }));
    },
    submitting,
    setField: (field: Field, value: string) => {
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    },
    submit: () =>
      run(async () => {
        const next: FieldErrors<ErrorField> = {
          name: validateName(values.name),
          email: validateEmail(values.email),
          password: validateNewPassword(values.password),
          terms: validateTermsAccepted(acceptedTerms),
        };
        setErrors(next);
        if (hasErrors(next)) return;
        const address = normalizeEmail(values.email);
        try {
          await repository.signUp(values.name.trim(), address, values.password, now());
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
