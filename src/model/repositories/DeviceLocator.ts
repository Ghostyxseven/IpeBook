import type { GeoAddress } from '../entities/Location';

/**
 * Localização do aparelho (Figma 11.02). Pede a permissão de uso com o app aberto, lê a posição
 * aproximada e devolve cidade e bairro. Rejeita com `LocationError('denied' | 'unavailable')`.
 */
export interface DeviceLocator {
  currentAddress(): Promise<GeoAddress>;
}
