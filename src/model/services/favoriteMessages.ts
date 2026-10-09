import type { FavoriteErrorCode } from '../entities/FavoriteError.ts';

const messages: Record<FavoriteErrorCode, string> = {
  network: 'Não conseguimos salvar o favorito. Confira sua internet e tente de novo.',
  not_configured: 'Os favoritos ainda não foram configurados neste ambiente.',
  unknown: 'Algo deu errado ao favoritar. Tente de novo em instantes.',
};

export function favoriteErrorMessage(code: FavoriteErrorCode) {
  return messages[code];
}
