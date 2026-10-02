import type { ListingErrorCode } from '../entities/ListingError';

const messages: Record<ListingErrorCode, string> = {
  invalid: 'Confira os campos destacados e tente de novo.',
  not_found: 'Este anúncio não existe mais.',
  not_allowed: 'Este anúncio não pode ser alterado agora.',
  network: 'Não conseguimos salvar. Confira sua internet e tente de novo.',
  not_configured: 'Os anúncios ainda não foram configurados neste ambiente.',
  unknown: 'Algo deu errado ao salvar. Tente de novo em instantes.',
};

export function listingErrorMessage(code: ListingErrorCode) {
  return messages[code];
}
