import { useState } from 'react';
import { toAuthError } from '../model/entities/AuthError.ts';
import type { AuthRepository } from '../model/repositories/AuthRepository';
import { authErrorMessage } from '../model/services/authMessages.ts';
import { normalizeCode, validateCode } from '../model/services/authValidation.ts';
import { useAsyncAction } from './useAsyncAction.ts';
import { useResendCooldown } from './useResendCooldown.ts';

export function useVerifyEmailViewModel(repository: AuthRepository, email: string) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [notice, setNotice] = useState<string | undefined>();
  const [submitting, runVerify] = useAsyncAction();
  const [resending, runResend] = useAsyncAction();
  const cooldown = useResendCooldown();

  return {
    email,
    missingEmail: !email,
    code,
    error,
    formError,
    notice,
    submitting,
    resending,
    resendSeconds: cooldown.seconds,
    setCode: (value: string) => {
      setCode(value);
      setError(undefined);
      setFormError(undefined);
    },
    verify: () =>
      runVerify(async () => {
        const invalid = validateCode(code);
        setError(invalid);
        setNotice(undefined);
        if (invalid) return;
        try {
          await repository.verifySignUp(email, normalizeCode(code));
        } catch (failure) {
          const { code: reason } = toAuthError(failure);
          if (reason === 'invalid_code') setError(authErrorMessage(reason));
          else setFormError(authErrorMessage(reason));
        }
      }),
    resend: () =>
      runResend(async () => {
        if (cooldown.seconds > 0) return;
        setFormError(undefined);
        try {
          await repository.resendSignUpCode(email);
          setNotice(`Enviamos um novo código para ${email}.`);
          cooldown.restart();
        } catch (failure) {
          setFormError(authErrorMessage(toAuthError(failure).code));
        }
      }),
  };
}
