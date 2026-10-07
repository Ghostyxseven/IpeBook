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
 * "4 ativas, 1 reservada" — o apoio da linha Minhas publicações (Figma 07.01).
 *
 * Só conta o que existe: nada de "0 concluídas" para quem nunca concluiu nada —
 * um perfil cheio de zeros parece um perfil fracassado.
 *
 * Substituiu o `summaryLine` da spec 026, que dizia "2 livros anunciados · 2
 * disponíveis". O quadro 07.01 põe o total num azulejo próprio, então repeti-lo
 * na linha de baixo era dizer a mesma coisa duas vezes.
 */
export function publicationsLine(summary: ProfileSummary): string {
  if (summary.total === 0) return 'Você ainda não anunciou nenhum livro';

  const parts: string[] = [];
  const add = (count: number, one: string, many: string) => {
    if (count > 0) parts.push(`${count} ${count === 1 ? one : many}`);
  };
  add(summary.disponivel, 'ativa', 'ativas');
  add(summary.reservado, 'reservada', 'reservadas');
  add(summary.concluido, 'concluída', 'concluídas');
  add(summary.arquivado, 'arquivada', 'arquivadas');

  return parts.join(', ');
}
