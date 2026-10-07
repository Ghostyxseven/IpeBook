import type { BookLookupErrorCode } from '../entities/BookLookup';

const messages: Record<BookLookupErrorCode, string> = {
  // A tela 04.18 já diz "Não encontramos esse ISBN" no título; a frase aqui é a
  // que explica o que fazer, e vale para código torto e para código desconhecido.
  invalid_isbn: 'Confira o código ou informe o título e o autor do seu exemplar.',
  not_found: 'Confira o código ou informe o título e o autor do seu exemplar.',
  network: 'Não conseguimos consultar agora. Confira sua internet e tente de novo.',
  unknown: 'Algo deu errado na consulta. Tente de novo ou preencha manualmente.',
};

export function bookLookupErrorMessage(code: BookLookupErrorCode) {
  return messages[code];
}
