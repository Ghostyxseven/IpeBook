import { AuthError } from '../entities/AuthError.ts';
import type { AuthRepository } from '../repositories/AuthRepository';
import type { ProfileRepository } from '../repositories/ProfileRepository';
import {
  hasErrors,
  validateName,
  validateNewPassword,
  validatePasswordConfirmation,
  validateTermsAccepted,
  type FieldErrors,
} from './authValidation.ts';
import { normalizeNeighborhood, validateNeighborhood } from './neighborhood.ts';

export type GoogleRegistrationValues = {
  name: string;
  password: string;
  confirmation: string;
  neighborhood: string;
};
export type GoogleRegistrationErrors = FieldErrors<keyof GoogleRegistrationValues | 'terms'>;

export function validateGoogleRegistration(
  values: GoogleRegistrationValues,
  accepted: boolean,
): GoogleRegistrationErrors {
  return {
    name: validateName(values.name),
    password: validateNewPassword(values.password),
    confirmation: validatePasswordConfirmation(values.password, values.confirmation),
    neighborhood: validateNeighborhood(values.neighborhood),
    terms: validateTermsAccepted(accepted),
  };
}

/** Perfil primeiro: falha parcial não libera o cadastro e o upsert permite repetir. */
export async function completeGoogleRegistration(
  auth: AuthRepository,
  profile: ProfileRepository,
  values: GoogleRegistrationValues,
  accepted: boolean,
  now: Date,
) {
  if (hasErrors(validateGoogleRegistration(values, accepted))) throw new AuthError('unknown');
  const current = await auth.getCurrentUser();
  if (!current?.needsRegistration) throw new AuthError('unknown');
  await profile.setNeighborhood(normalizeNeighborhood(values.neighborhood));
  return auth.completeGoogleRegistration(values.name.trim(), values.password, now);
}
