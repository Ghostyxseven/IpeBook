import type { MyListing, MyListingStatus } from '../entities/Listing';

export type ProfileSummary = Record<MyListingStatus, number> & { total: number };

/** Quantos anúncios em cada situação — o resumo do Meu perfil (spec 026). */
export function summarize(listings: readonly MyListing[]): ProfileSummary {
  const summary: ProfileSummary = {
    disponivel: 0,
    reservado: 0,
    concluido: 0,
    arquivado: 0,
    total: listings.length,
  };
  for (const listing of listings) summary[listing.status] += 1;
  return summary;
}

/**
 * O resumo em uma frase.
 *
 * Só conta o que existe: nada de "0 concluídos" para quem nunca concluiu nada —
 * um perfil cheio de zeros parece um perfil fracassado.
 */
export function summaryLine(summary: ProfileSummary): string {
  if (summary.total === 0) return 'Você ainda não anunciou nenhum livro.';

  const parts: string[] = [];
  const add = (count: number, one: string, many: string) => {
    if (count > 0) parts.push(`${count} ${count === 1 ? one : many}`);
  };
  add(summary.disponivel, 'disponível', 'disponíveis');
  add(summary.reservado, 'reservado', 'reservados');
  add(summary.concluido, 'concluído', 'concluídos');
  add(summary.arquivado, 'arquivado', 'arquivados');

  const books = summary.total === 1 ? '1 livro anunciado' : `${summary.total} livros anunciados`;
  return `${books} · ${parts.join(', ')}`;
}
