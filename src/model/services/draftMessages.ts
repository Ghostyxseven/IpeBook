import type { DraftErrorCode } from '../entities/Draft';

const messages: Record<DraftErrorCode, string> = {
  storage: 'Não conseguimos guardar o rascunho neste aparelho.',
  not_found: 'Este rascunho não existe mais.',
  unknown: 'Algo deu errado com os rascunhos. Tente de novo em instantes.',
};

export function draftErrorMessage(code: DraftErrorCode) {
  return messages[code];
}
