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
  // Diz se o erro do e-mail é especificamente "já cadastrado" (Figma 01.14): a tela mostra
  // também o atalho para recuperar a senha, além do erro inline no campo.
  const [emailInUse, setEmailInUse] = useState(false);
  const [submitting, run] = useAsyncAction();

  return {
    values,
    acceptedTerms,
    errors,
    emailInUse,
    toggleTerms: () => {
      setAcceptedTerms((current) => !current);
      setErrors((current) => ({ ...current, terms: undefined, form: undefined }));
    },
    submitting,
    setField: (field: Field, value: string) => {
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
      if (field === 'email') setEmailInUse(false);
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
        setEmailInUse(false);
        if (hasErrors(next)) return;
        const address = normalizeEmail(values.email);
        try {
          await repository.signUp(values.name.trim(), address, values.password, now());
          onSignedUp(address);
        } catch (failure) {
          const { code } = toAuthError(failure);
          const message = authErrorMessage(code);
          if (code === 'weak_password') setErrors({ password: message });
          else if (code === 'email_in_use') {
            setErrors({ email: message });
            setEmailInUse(true);
          } else if (code === 'invalid_email') setErrors({ email: message });
          else setErrors({ form: message });
        }
      }),
  };
}
