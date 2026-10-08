import { useCallback, useEffect, useState } from 'react';
import { toAuthError } from '../model/entities/AuthError.ts';
import { ProfileError, toProfileError } from '../model/entities/Profile.ts';
import type { User } from '../model/entities/User';
import type { AuthRepository } from '../model/repositories/AuthRepository';
import type { ProfileRepository } from '../model/repositories/ProfileRepository';
import { authErrorMessage } from '../model/services/authMessages.ts';
import { hasErrors } from '../model/services/authValidation.ts';
import {
  completeGoogleRegistration,
  validateGoogleRegistration,
  type GoogleRegistrationErrors,
  type GoogleRegistrationValues,
} from '../model/services/googleRegistration.ts';
import { profileErrorMessage, SERVICE_CITY } from '../model/services/neighborhood.ts';
import { useAsyncAction } from './useAsyncAction.ts';

export function useGoogleRegistrationViewModel(
  auth: AuthRepository,
  profile: ProfileRepository,
  user: User,
) {
  const [values, setValues] = useState<GoogleRegistrationValues>({
    name: user.name,
    password: '',
    confirmation: '',
    neighborhood: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<GoogleRegistrationErrors>({});
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const [busy, run] = useAsyncAction();
  useEffect(() => {
    let active = true;
    setStatus('loading');
    profile.getProfile().then(
      (data) => {
        if (!active) return;
        setValues((current) => ({ ...current, neighborhood: data.neighborhood ?? '' }));
        setStatus('ready');
      },
      (failure) => {
        if (!active) return;
        setLoadError(profileErrorMessage(toProfileError(failure).code));
        setStatus('error');
      },
    );
    return () => {
      active = false;
    };
  }, [profile, attempt]);
  const setField = useCallback((field: keyof GoogleRegistrationValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }, []);
  return {
    values,
    errors,
    status,
    loadError,
    busy,
    acceptedTerms,
    email: user.email,
    city: SERVICE_CITY.label,
    setField,
    retry: () => setAttempt((value) => value + 1),
    toggleTerms: () => {
      setAcceptedTerms((value) => !value);
      setErrors((current) => ({ ...current, terms: undefined }));
    },
    submit: () =>
      run(async () => {
        if (status !== 'ready') return;
        const next = validateGoogleRegistration(values, acceptedTerms);
        setErrors(next);
        if (hasErrors(next)) return;
        try {
          await completeGoogleRegistration(auth, profile, values, acceptedTerms, new Date());
          setValues((current) => ({ ...current, password: '', confirmation: '' }));
        } catch (failure) {
          const message =
            failure instanceof ProfileError
              ? profileErrorMessage(failure.code)
              : authErrorMessage(toAuthError(failure).code);
          setErrors({ form: message });
        }
      }),
    signOut: () =>
      run(async () => {
        try {
          await auth.signOut();
        } catch (failure) {
          setErrors({ form: authErrorMessage(toAuthError(failure).code) });
        }
      }),
  };
}
