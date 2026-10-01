import type { CatalogErrorCode } from '../entities/CatalogError';

const messages: Record<CatalogErrorCode, string> = {
  not_found: 'Este anúncio não está mais disponível.',
  network: 'Não conseguimos carregar os livros. Confira sua internet e tente de novo.',
  not_configured: 'O catálogo ainda não foi configurado neste ambiente.',
  unknown: 'Algo deu errado ao carregar os livros. Tente de novo em instantes.',
};

export function catalogErrorMessage(code: CatalogErrorCode) {
  return messages[code];
}
