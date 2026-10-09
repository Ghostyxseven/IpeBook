import { useState } from 'react';
import { toAuthError } from '../model/entities/AuthError.ts';
import type { AuthRepository } from '../model/repositories/AuthRepository';
import { authErrorMessage } from '../model/services/authMessages.ts';
import {
  hasErrors,
  validateCurrentPassword,
  validateNewPassword,
  validatePasswordConfirmation,
  type FieldErrors,
} from '../model/services/authValidation.ts';
import { afterSignOut } from './afterSignOut.ts';
import { useAsyncAction } from './useAsyncAction.ts';

type Field = 'current' | 'password' | 'confirmation';

/**
 * Estados de Alterar senha no Figma: formulário (07.18), senha atual incorreta (07.19),
 * nova senha inválida (07.21) e senha alterada (07.20).
 */
export type ChangePasswordState = 'form' | 'wrongCurrent' | 'invalidNew' | 'done';

export function useChangePasswordViewModel(
  repository: AuthRepository,
  { email }: { email: string | null },
) {
  const [state, setState] = useState<ChangePasswordState>('form');
  const [values, setValues] = useState<Record<Field, string>>({
    current: '',
    password: '',
    confirmation: '',
  });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [submitting, run] = useAsyncAction();
  const [leaving, runLeave] = useAsyncAction();

  return {
    state,
    values,
    errors,
    submitting,
    leaving,
    setField: (field: Field, value: string) => {
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    },
    submit: () =>
      run(async () => {
        const current = validateCurrentPassword(values.current);
        const fresh: FieldErrors<Field> = {
          password: validateNewPassword(values.password),
          confirmation: validatePasswordConfirmation(values.password, values.confirmation),
        };
        if (current) {
          setErrors({ current });
          return;
        }
        if (hasErrors(fresh)) {
          setErrors(fresh);
          setState('invalidNew');
          return;
        }
        setErrors({});
        try {
          await repository.changePassword(values.current, values.password);
          setState('done');
        } catch (failure) {
          const { code } = toAuthError(failure);
          const message = authErrorMessage(code);
          if (code === 'wrong_current_password') {
            setValues((v) => ({ ...v, current: '' }));
            setErrors({ current: message });
            setState('wrongCurrent');
          } else if (code === 'weak_password' || code === 'same_password') {
            setErrors({ password: message });
            setState('invalidNew');
          } else setErrors({ form: message });
        }
      }),
    /** "Esqueci a senha atual" e "Recuperar acesso": sai da conta e abre a recuperação. */
    recoverAccess: () =>
      runLeave(async () => {
        if (email) afterSignOut.markRecovery(email);
        try {
          await repository.signOut();
        } catch (failure) {
          afterSignOut.clear();
          setErrors({ form: authErrorMessage(toAuthError(failure).code) });
        }
      }),
  };
}
