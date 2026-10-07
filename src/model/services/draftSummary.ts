import type { ListingDraft } from '../entities/Listing';
import type { DraftRecord } from '../entities/Draft';
import { modalityLabels } from './catalogFormat.ts';
import { validateDraft, type ListingField } from './listingValidation.ts';

/** O que a lista de rascunhos chama cada campo que ainda falta (Figma 04.11). */
const fieldLabels: Record<ListingField | 'neighborhood', string> = {
  title: 'título',
  author: 'autor',
  category: 'categoria',
  condition: 'estado',
  modality: 'modalidade',
  priceCents: 'preço',
  tradeTerms: 'o que aceita em troca',
  neighborhood: 'localização',
};

/** A ordem em que os campos aparecem na frase: a mesma do formulário. */
const order: readonly (ListingField | 'neighborhood')[] = [
  'title',
  'author',
  'modality',
  'priceCents',
  'tradeTerms',
  'category',
  'condition',
  'neighborhood',
];

/**
 * O que falta para este rascunho virar anúncio.
 *
 * Sai da mesma `validateDraft` que o formulário usa — duas noções de "incompleto"
 * acabariam discordando, e a lista diria que falta algo que a tela aceita.
 *
 * O bairro entra por fora porque a validação não o exige (um anúncio publica sem
 * ele), mas o formulário o pede e a pessoa percebe a ausência. Dizer que falta é
 * mais útil do que estar certo quanto à regra.
 */
export function missingFields(draft: ListingDraft): (ListingField | 'neighborhood')[] {
  const errors = validateDraft(draft);
  const missing = order.filter((field) => field !== 'neighborhood' && field in errors);
  if (!draft.neighborhood?.trim()) missing.push('neighborhood');
  return missing;
}

/** "título e categoria" · "título, categoria e localização" — vírgulas e um "e". */
function join(parts: readonly string[]): string {
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}`;
}

/** "faltam estado e localização", "falta o título", ou "pronto para publicar". */
export function missingPhrase(draft: ListingDraft): string {
  const missing = missingFields(draft);
  if (missing.length === 0) return 'pronto para publicar';
  const labels = missing.map((field) => fieldLabels[field]);
  return missing.length === 1 ? `falta ${labels[0]}` : `faltam ${join(labels)}`;
}

/** O nome do rascunho na lista. Sem título, o rascunho ainda precisa se chamar algo. */
export function draftTitle(record: DraftRecord): string {
  return record.draft.title.trim() || 'Sem título';
}

/** A linha de apoio: "Venda · faltam estado e localização" (Figma 04.11). */
export function draftSupporting(record: DraftRecord): string {
  return `${modalityLabels[record.draft.modality]} · ${missingPhrase(record.draft)}`;
}
