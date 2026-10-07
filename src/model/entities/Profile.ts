/** Dados do perfil usados pelo app. O IpêBook atende só Piripiri (PI). */
export type Profile = { neighborhood: string | null; city: string };

export type ProfileErrorCode = 'network' | 'not_configured' | 'unknown';

/** Erro do perfil independente do provedor (Supabase fica só no repositório). */
export class ProfileError extends Error {
  readonly code: ProfileErrorCode;
  constructor(code: ProfileErrorCode, cause?: unknown) {
    super(code);
    this.name = 'ProfileError';
    this.code = code;
    this.cause = cause;
  }
}

export function toProfileError(error: unknown): ProfileError {
  return error instanceof ProfileError ? error : new ProfileError('unknown', error);
}
