import type { HistoryEntry, PublicProfile, ReceivedRating } from '../entities/Rating';

/** Quando o cadastro não tem nome, a comunidade ainda precisa chamar a pessoa de algo. */
export const ANONYMOUS = 'Pessoa da comunidade';

export function personName(firstName: string | null | undefined): string {
  return firstName?.trim() || ANONYMOUS;
}

/**
 * O monograma do avatar do Figma: "Ana Paula" → "AP", "Bruno" → "BR".
 *
 * Duas letras sempre, porque uma só fica perdida dentro do círculo de 80 px.
 * Sem nome, devolve `null` e a tela desenha o ícone de pessoa.
 */
export function initials(name: string | null | undefined): string | null {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return null;
  const first = parts[0] as string;
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  return `${first[0]}${(parts[parts.length - 1] as string)[0]}`.toUpperCase();
}

/**
 * "4,8 de 5", ou `null` para quem ainda não recebeu nota.
 *
 * `null` e não "0,0 de 5": numa escala de 1 a 5, zero é uma nota — e péssima —
 * atribuída a quem nunca fez nada de errado (ADR 0027).
 */
export function averageLabel(average: number | null | undefined): string | null {
  if (average === null || average === undefined) return null;
  return `${average.toFixed(1).replace('.', ',')} de 5`;
}

/** "8 trocas concluídas", "1 troca concluída", "Nenhuma troca concluída ainda". */
export function completedLabel(count: number): string {
  if (count <= 0) return 'Nenhuma troca concluída ainda';
  return count === 1 ? '1 troca concluída' : `${count} trocas concluídas`;
}

/** A linha de apoio do cartão "Histórico na comunidade" da 03.04. */
export function reputationLine(profile: PublicProfile): string {
  const average = averageLabel(profile.ratingAverage);
  const completed = completedLabel(profile.completedCount);
  return average ? `${completed} · avaliação ${average}` : `${completed} · ainda sem avaliações`;
}

/** "Na comunidade desde 2024" — só o ano: mês e dia não ajudam e expõem mais. */
export function memberSinceLabel(iso: string): string | null {
  const year = new Date(iso).getFullYear();
  return Number.isFinite(year) ? `Na comunidade desde ${year}` : null;
}

/** "Ana Paula · 5 de 5", o rótulo de cada item da lista da 07.03. */
export function ratingLabel(rating: ReceivedRating): string {
  return `${personName(rating.authorFirstName)} · ${rating.score} de 5`;
}

const historyVerbs: Record<HistoryEntry['modality'], { owner: string; other: string }> = {
  sale: { owner: 'Vendido para', other: 'Comprado de' },
  trade: { owner: 'Trocado com', other: 'Trocado com' },
  donation: { owner: 'Doado para', other: 'Recebido de' },
};

/** "Vendido para Ana Paula" — o verbo muda conforme o lado em que a pessoa estava. */
export function historyLine(entry: HistoryEntry): string {
  const verbs = historyVerbs[entry.modality];
  return `${entry.iWasOwner ? verbs.owner : verbs.other} ${personName(entry.otherFirstName)}`;
}

/**
 * "4,8 de 5 em 8 trocas concluídas" — o apoio da linha Avaliações recebidas
 * (Figma 07.01). Quem ainda não tem nota recebe o convite, não um número.
 */
export function ratingsLine(profile: {
  ratingAverage: number | null;
  completedCount: number;
}): string {
  const average = averageLabel(profile.ratingAverage);
  if (!average) return 'Ainda sem avaliações';
  return `${average} em ${completedLabel(profile.completedCount).toLocaleLowerCase('pt-BR')}`;
}
