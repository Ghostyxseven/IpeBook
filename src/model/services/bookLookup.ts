import type { BookLookup } from '../entities/BookLookup';
import type { ListingDraft } from '../entities/Listing';

/**
 * O que a leitura de ISBN escreve no rascunho: **só o que está vazio**.
 *
 * Quem digitou já decidiu. A base pública descreve a edição, não o exemplar que
 * está na mão da pessoa — ela pode ter corrigido o título de propósito, ou
 * escrito o nome do autor do jeito que aparece na capa dela. Sobrescrever isso
 * transformaria um atalho em perda de trabalho.
 *
 * Espaço em branco conta como vazio: um campo com três espaços não é escolha.
 */
export function fillFromLookup(draft: ListingDraft, book: BookLookup): ListingDraft {
  return {
    ...draft,
    title: draft.title.trim() ? draft.title : book.title,
    author: draft.author.trim() ? draft.author : book.author,
  };
}
