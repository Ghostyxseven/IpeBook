export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'email_in_use'
  | 'invalid_email'
  | 'weak_password'
  | 'invalid_code'
  | 'same_password'
  | 'rate_limited'
  | 'network'
  | 'not_configured'
  | 'unknown';

/** Erro de autenticação independente do provedor (Supabase fica só no repositório). */
export class AuthError extends Error {
  readonly code: AuthErrorCode;
  constructor(code: AuthErrorCode, cause?: unknown) {
    super(code);
    this.name = 'AuthError';
    this.code = code;
    this.cause = cause;
  }
}

export function toAuthError(error: unknown): AuthError {
  return error instanceof AuthError ? error : new AuthError('unknown', error);
}
