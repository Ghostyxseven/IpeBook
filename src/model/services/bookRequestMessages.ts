import type { BookRequestErrorCode } from '../entities/BookRequestError';

const messages: Record<BookRequestErrorCode, string> = {
  not_found: 'Esta solicitação não foi encontrada.',
  invalid_transition:
    'Não foi possível alterar a situação da solicitação no momento. Tente de novo.',
  forbidden: 'Você não tem permissão para fazer esta ação.',
  already_exists: 'Você já tem uma solicitação em andamento para este livro.',
  network: 'Não conseguimos processar a solicitação. Confira sua internet e tente de novo.',
  not_configured: 'A negociação ainda não foi configurada neste ambiente.',
  unknown: 'Algo deu errado. Tente de novo em instantes.',
};

export function bookRequestErrorMessage(code: BookRequestErrorCode): string {
  return messages[code];
}
