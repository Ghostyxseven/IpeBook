import { useEffect, useState } from 'react';
import { toAuthError } from '../model/entities/AuthError.ts';
import type { AuthRepository } from '../model/repositories/AuthRepository';
import { authErrorMessage } from '../model/services/authMessages.ts';
import {
  hasErrors,
  normalizeCode,
  normalizeEmail,
  validateCode,
  validateEmail,
  validateNewPassword,
  validatePasswordConfirmation,
  type FieldErrors,
} from '../model/services/authValidation.ts';
import { afterSignIn } from './afterSignIn.ts';
import { afterSignOut } from './afterSignOut.ts';
import { useAsyncAction } from './useAsyncAction.ts';
import { useResendCooldown } from './useResendCooldown.ts';

type Field = 'email' | 'code' | 'password' | 'confirmation';
export type RecoveryStep = 'request' | 'reset';

export function usePasswordRecoveryViewModel(repository: AuthRepository, initialEmail = '') {
  const [step, setStep] = useState<RecoveryStep>('request');
  const [values, setValues] = useState<Record<Field, string>>({
    email: initialEmail,
    code: '',
    password: '',
    confirmation: '',
  });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [notice, setNotice] = useState<string | undefined>();
  const [submitting, run] = useAsyncAction();
  const [resending, runResend] = useAsyncAction();
  const cooldown = useResendCooldown(0);
  const address = normalizeEmail(values.email);

  // Sair da tela com o código confirmado e a senha não gravada encerra a sessão de
  // recuperação, para ninguém ficar autenticado sem ter trocado a senha (issue #8).
  useEffect(() => {
    // Veio de Alterar senha: a marca já cumpriu o papel de abrir esta tela.
    afterSignOut.clear();
    return () => void repository.cancelPasswordRecovery().catch(() => undefined);
  }, [repository]);

  // A resposta é a mesma com ou sem conta, para não revelar quem está cadastrado.
  const sentNotice = () =>
    `Se houver uma conta com ${address}, você vai receber um código em instantes. Confira também o spam.`;

  return {
    step,
    values,
    errors,
    notice,
    submitting,
    resending,
    resendSeconds: cooldown.seconds,
    setField: (field: Field, value: string) => {
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    },
    requestCode: () =>
      run(async () => {
        const invalid = validateEmail(values.email);
        setErrors({ email: invalid });
        if (invalid) return;
        try {
          await repository.requestPasswordReset(address);
          setNotice(sentNotice());
          setStep('reset');
          cooldown.restart();
        } catch (failure) {
          setErrors({ form: authErrorMessage(toAuthError(failure).code) });
        }
      }),
    resend: () =>
      runResend(async () => {
        if (cooldown.seconds > 0) return;
        try {
          await repository.requestPasswordReset(address);
          setNotice(sentNotice());
          cooldown.restart();
        } catch (failure) {
          setErrors({ form: authErrorMessage(toAuthError(failure).code) });
        }
      }),
    changeEmail: () => {
      void repository.cancelPasswordRecovery().catch(() => undefined);
      setStep('request');
      setNotice(undefined);
      setErrors({});
      setValues((current) => ({ ...current, code: '' }));
    },
    resetPassword: () =>
      run(async () => {
        // A senha é validada antes: confirmar o código já inicia a sessão.
        const next: FieldErrors<Field> = {
          code: validateCode(values.code),
          password: validateNewPassword(values.password),
          confirmation: validatePasswordConfirmation(values.password, values.confirmation),
        };
        setErrors(next);
        if (hasErrors(next)) return;
        afterSignIn.mark('passwordUpdated');
        try {
          await repository.resetPassword(address, normalizeCode(values.code), values.password);
        } catch (failure) {
          afterSignIn.clear();
          const { code } = toAuthError(failure);
          const message = authErrorMessage(code);
          if (code === 'invalid_code') setErrors({ code: message });
          else if (code === 'weak_password' || code === 'same_password')
            setErrors({ password: message });
          else setErrors({ form: message });
        }
      }),
  };
}
