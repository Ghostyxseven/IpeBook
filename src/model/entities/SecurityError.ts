export type SecurityErrorCode = 'invalid' | 'network' | 'not_configured' | 'unknown';

/** Erro de denúncia e bloqueio independente do provedor (Supabase fica só no repositório). */
export class SecurityError extends Error {
  readonly code: SecurityErrorCode;
  constructor(code: SecurityErrorCode, cause?: unknown) {
    super(code);
    this.name = 'SecurityError';
    this.code = code;
    this.cause = cause;
  }
}

export function toSecurityError(error: unknown): SecurityError {
  return error instanceof SecurityError ? error : new SecurityError('unknown', error);
}
