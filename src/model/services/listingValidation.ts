import type { ListingCondition, ListingDraft, Modality } from '../entities/Listing';
import { isCategory } from './categories.ts';

/** Os campos que podem receber uma mensagem de erro no formulário. */
export type ListingField =
  'title' | 'author' | 'category' | 'condition' | 'modality' | 'priceCents' | 'tradeTerms';

/** O IpêBook atende só Piripiri (ADR 0017): a cidade não é pedida no formulário. */
export const SERVED_CITY = 'Piripiri';

export type ListingErrors = Partial<Record<ListingField, string>>;

export const conditions: readonly ListingCondition[] = [
  'novo',
  'como_novo',
  'bom',
  'marcas_de_uso',
] as const;

export const modalities: readonly Modality[] = ['sale', 'trade', 'donation'] as const;

const TITLE_MAX = 120;
const AUTHOR_MAX = 120;
const TERMS_MAX = 280;
const DESCRIPTION_MAX = 1000;
/** R$ 9.999,00 — acima disso é quase sempre dedo escorregado na vírgula. */
const PRICE_MAX_CENTS = 999_900;

const blank = (value: string | null | undefined) => !value || value.trim().length === 0;

/**
 * Os dados do livro — o primeiro passo do fluxo.
 *
 * Separado da modalidade porque o passo avança sozinho: travar o primeiro passo
 * por causa de um preço que ainda não foi digitado deixaria a pessoa presa sem
 * entender o motivo.
 */
export function validateBookStep(
  draft: Pick<ListingDraft, 'title' | 'author' | 'category' | 'condition' | 'description'>,
): ListingErrors {
  const errors: ListingErrors = {};
  if (blank(draft.title)) errors.title = 'Informe o título do livro.';
  else if (draft.title.trim().length > TITLE_MAX)
    errors.title = `O título pode ter até ${TITLE_MAX} caracteres.`;

  if (blank(draft.author)) errors.author = 'Informe quem escreveu.';
  else if (draft.author.trim().length > AUTHOR_MAX)
    errors.author = `O nome pode ter até ${AUTHOR_MAX} caracteres.`;

  if (blank(draft.category)) errors.category = 'Escolha uma categoria.';
  else if (!isCategory(draft.category.trim()))
    errors.category = 'Escolha uma das categorias da lista.';

  if (!conditions.includes(draft.condition))
    errors.condition = 'Diga em que estado está o exemplar.';
  return errors;
}

/**
 * A modalidade e o campo que vem com ela — o segundo passo.
 *
 * As mesmas três regras estão como `check` na tabela (ADR 0008). Repetir aqui
 * não é desconfiança do banco: é o que permite dizer o que está errado NO campo
 * certo, em vez de devolver um erro de constraint que ninguém entende.
 */
export function validateModalityStep(
  draft: Pick<ListingDraft, 'modality' | 'priceCents' | 'tradeTerms'>,
): ListingErrors {
  const errors: ListingErrors = {};
  if (!modalities.includes(draft.modality)) {
    errors.modality = 'Escolha se é venda, troca ou doação.';
    return errors;
  }

  if (draft.modality === 'sale') {
    if (draft.priceCents === null) errors.priceCents = 'Informe o preço.';
    else if (!Number.isInteger(draft.priceCents) || draft.priceCents <= 0)
      errors.priceCents = 'O preço precisa ser maior que zero.';
    else if (draft.priceCents > PRICE_MAX_CENTS)
      errors.priceCents = 'Confira o preço: está acima de R$ 9.999,00.';
  }

  if (draft.modality === 'trade') {
    if (blank(draft.tradeTerms)) errors.tradeTerms = 'Diga o que você aceita em troca.';
    else if ((draft.tradeTerms as string).trim().length > TERMS_MAX)
      errors.tradeTerms = `As condições podem ter até ${TERMS_MAX} caracteres.`;
  }

  return errors;
}

/** O rascunho inteiro, como última conferência antes de gravar. */
export function validateDraft(draft: ListingDraft): ListingErrors {
  return { ...validateBookStep(draft), ...validateModalityStep(draft) };
}

export function isValid(errors: ListingErrors): boolean {
  return Object.keys(errors).length === 0;
}

/**
 * O rascunho pronto para o banco.
 *
 * Zera o campo da modalidade que não vale mais. Isto é o que impede o erro da
 * edição: trocar venda por doação mandando só `modality` viola a constraint
 * `listings_price_only_on_sale`, porque ela olha a LINHA inteira. Os três
 * campos têm de viajar juntos, sempre.
 */
export function normalizeDraft(draft: ListingDraft): ListingDraft {
  const text = (value: string | null) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  };
  return {
    ...draft,
    title: draft.title.trim(),
    author: draft.author.trim(),
    category: draft.category.trim(),
    priceCents: draft.modality === 'sale' ? draft.priceCents : null,
    tradeTerms: draft.modality === 'trade' ? text(draft.tradeTerms) : null,
    neighborhood: text(draft.neighborhood),
    city: SERVED_CITY,
    description: text(draft.description)?.slice(0, DESCRIPTION_MAX) ?? null,
  };
}

/** Um rascunho vazio, para o formulário abrir em branco. */
export function emptyDraft(): ListingDraft {
  return {
    title: '',
    author: '',
    category: '',
    modality: 'sale',
    priceCents: null,
    tradeTerms: null,
    condition: 'bom',
    neighborhood: null,
    city: SERVED_CITY,
    description: null,
  };
}
