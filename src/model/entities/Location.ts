/** Endereço aproximado devolvido pelo aparelho; só cidade e bairro interessam ao app. */
export type GeoAddress = { city: string | null; district: string | null };

export type LocationErrorCode = 'denied' | 'unavailable' | 'outside_city' | 'not_found';

/** Erro de localização independente do aparelho (expo-location fica só em `src/infra`). */
export class LocationError extends Error {
  readonly code: LocationErrorCode;
  constructor(code: LocationErrorCode, cause?: unknown) {
    super(code);
    this.name = 'LocationError';
    this.code = code;
    this.cause = cause;
  }
}

export function toLocationError(error: unknown): LocationError {
  return error instanceof LocationError ? error : new LocationError('unavailable', error);
}
