import type { Profile } from '../entities/Profile';

/** Perfil de quem está na conta. Todas as operações rejeitam com `ProfileError`. */
export interface ProfileRepository {
  /** Sem perfil gravado, devolve o bairro vazio e a cidade atendida. */
  getProfile(): Promise<Profile>;
  setNeighborhood(neighborhood: string): Promise<void>;
}
