import type { Profile } from '../entities/Profile';
import { SERVICE_CITY } from '../services/neighborhood.ts';
import type { ProfileRepository } from './ProfileRepository';

/** Implementação em memória para os testes das ViewModels. */
export function createMemoryProfileRepository(initial: Partial<Profile> = {}) {
  let profile: Profile = { neighborhood: null, city: SERVICE_CITY.name, ...initial };
  let failure: Error | null = null;
  const repository: ProfileRepository = {
    async getProfile() {
      if (failure) throw failure;
      return { ...profile };
    },
    async setNeighborhood(neighborhood) {
      if (failure) throw failure;
      profile = { ...profile, neighborhood };
    },
  };
  return {
    repository,
    current: () => ({ ...profile }),
    /** Faz as próximas chamadas falharem (ou volta ao normal com `null`). */
    fail(error: Error | null) {
      failure = error;
    },
  };
}
