import type { ReputationErrorCode } from '../entities/Rating';

const messages: Record<ReputationErrorCode, string> = {
  not_found: 'Não encontramos esta pessoa.',
  not_allowed: 'Só dá para avaliar uma negociação que vocês concluíram.',
  network: 'Não conseguimos carregar. Confira sua internet e tente de novo.',
  not_configured: 'As avaliações ainda não foram configuradas neste ambiente.',
  unknown: 'Algo deu errado ao carregar. Tente de novo em instantes.',
};

export function reputationErrorMessage(code: ReputationErrorCode) {
  return messages[code];
}
