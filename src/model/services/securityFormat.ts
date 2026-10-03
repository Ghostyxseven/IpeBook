import type { SecurityErrorCode } from '../entities/SecurityError';

/** Motivos da denúncia de anúncio, na ordem do Figma 09.03. */
export const listingReportReasons = [
  'O livro não corresponde à descrição',
  'Golpe ou cobrança indevida',
  'Conteúdo ofensivo',
  'Outro motivo',
] as const;

/** Motivos da denúncia de uma pessoa, sem anúncio no meio. */
export const userReportReasons = [
  'Golpe ou cobrança indevida',
  'Mensagem ou atitude ofensiva',
  'Perfil falso',
  'Outro motivo',
] as const;

/** Até onde os detalhes da denúncia vão; o resto não ajuda quem analisa. */
export const REPORT_DETAILS_MAX = 500;

/** Nome que aparece nos textos de bloqueio; sem nome, "esta pessoa". */
export function personName(firstName: string | null | undefined): string {
  const name = firstName?.trim();
  return name ? name : 'esta pessoa';
}

/** Rótulo de botão: "Bloquear Ana" ou "Bloquear pessoa". */
export function blockLabel(firstName: string | null | undefined): string {
  const name = firstName?.trim();
  return name ? `Bloquear ${name}` : 'Bloquear pessoa';
}

export function unblockLabel(firstName: string | null | undefined): string {
  const name = firstName?.trim();
  return name ? `Desbloquear ${name}` : 'Desbloquear pessoa';
}

export function securityErrorMessage(code: SecurityErrorCode): string {
  switch (code) {
    case 'invalid':
      return 'Escolha um motivo para enviar a denúncia.';
    case 'network':
      return 'Sem conexão com a internet. Tente de novo quando a conexão voltar.';
    case 'not_configured':
      return 'O serviço de segurança não foi configurado neste aparelho.';
    default:
      return 'Não conseguimos concluir agora. Tente de novo em instantes.';
  }
}
