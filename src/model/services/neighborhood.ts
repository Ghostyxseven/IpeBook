import { LocationError, type GeoAddress, type LocationErrorCode } from '../entities/Location.ts';
import type { ProfileErrorCode } from '../entities/Profile.ts';

export const SERVICE_CITY = { name: 'Piripiri', label: 'Piripiri, PI' } as const;

/**
 * Bairros sugeridos nas telas Seu bairro e Escolher bairro: os três do Figma 01.17,
 * na ordem do quadro, seguidos do restante dos bairros de Piripiri (PI) — fonte:
 * seção "Bairros" de https://pt.wikipedia.org/wiki/Piripiri_(Piau%C3%A1), conferida
 * em 10/10/2026. Lista fixa para a pessoa escolher sem digitar; "Outro bairro…"
 * continua existindo para quem mora num bairro fora dela.
 */
export const SUGGESTED_NEIGHBORHOODS = [
  'Centro',
  'Bairro Piauí',
  'Fonte dos Matos',
  'Prado',
  'Floresta',
  'Vista Alegre',
  "Caixa d'Água",
  'Paciência',
  'Recreio',
  'Germano',
  'Santa Maria',
  'Anajás',
  'São João',
  'Estação',
  'Matadouro',
  'Petecas',
  'Ytacoatiara',
  'Conjunto Expedito Rezende',
  'Crioli',
  'Morro da Ana',
  'Flor dos Campos',
  'Russinha',
  'Garibaldi',
  'Morro de Saudade',
  'Barcelona',
  'Conceição',
  'Residencial Parque Recreio',
  'Morada dos Alpes',
  'Residencial Petecas',
  'Conjunto Jenipapeiro',
  'Pedreiras',
  'Villa São Francisco',
  'Esperança Garcia',
] as const;

export const NEIGHBORHOOD_MAX_LENGTH = 60;

export function normalizeNeighborhood(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

export function validateNeighborhood(name: string) {
  const value = normalizeNeighborhood(name);
  if (!value) return 'Escolha ou digite o seu bairro.';
  if (value.length < 2) return 'Digite o nome do bairro com pelo menos 2 letras.';
  if (value.length > NEIGHBORHOOD_MAX_LENGTH)
    return `Use no máximo ${NEIGHBORHOOD_MAX_LENGTH} caracteres.`;
  return undefined;
}

const messages: Record<ProfileErrorCode, string> = {
  network: 'Não conseguimos falar com o servidor. Confira sua internet e tente de novo.',
  not_configured: 'O perfil ainda não foi configurado neste ambiente.',
  unknown: 'Algo deu errado. Tente de novo em instantes.',
};

export function profileErrorMessage(code: ProfileErrorCode) {
  return messages[code];
}

const plain = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

/**
 * Bairro a partir do endereço aproximado. Fora de Piripiri ou sem bairro, rejeita para a pessoa
 * escolher manualmente (Figma 11.02, "Escolher bairro").
 */
export function neighborhoodFromAddress(address: GeoAddress): string {
  if (!address.city || plain(address.city) !== plain(SERVICE_CITY.name))
    throw new LocationError('outside_city');
  const district = address.district ? normalizeNeighborhood(address.district) : '';
  if (validateNeighborhood(district)) throw new LocationError('not_found');
  return district;
}

const locationMessages: Record<LocationErrorCode, string> = {
  denied: 'Sem a permissão de localização, escolha seu bairro manualmente.',
  unavailable: 'Não conseguimos obter sua localização. Confira se ela está ligada e tente de novo.',
  outside_city: 'Sua localização fica fora de Piripiri. Escolha seu bairro manualmente.',
  not_found: 'Não encontramos o bairro desta localização. Escolha seu bairro manualmente.',
};

export function locationErrorMessage(code: LocationErrorCode) {
  return locationMessages[code];
}
