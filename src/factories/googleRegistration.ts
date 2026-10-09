import type { User } from '../model/entities/User';
import { useGoogleRegistrationViewModel } from '../viewmodel/useGoogleRegistrationViewModel';
import { authRepository } from './auth';
import { profileRepository } from './profile';

export const useGoogleRegistration = (user: User) =>
  useGoogleRegistrationViewModel(authRepository, profileRepository, user);
