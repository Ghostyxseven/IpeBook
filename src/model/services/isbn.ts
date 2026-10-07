/**
 * ISBN: normalizar e validar, sem rede nenhuma.
 *
 * Existe para que um código torto morra aqui — antes de virar requisição e
 * antes de a pessoa esperar por uma resposta que já se sabe que será "não
 * encontrado". É também o que deixa testar o caso difícil sem câmera.
 */

/** Tira hífen, espaço e ponto; o `X` do dígito verificador vira maiúsculo. */
export function normalizeIsbn(input: string): string {
  return input.replace(/[\s.-]/g, '').toUpperCase();
}

/**
 * ISBN-10: a soma de cada dígito pelo peso 10..1 é múltipla de 11.
 * O último dígito pode ser `X`, que vale 10 — é o único jeito de representar
 * o resto 10 numa casa só.
 */
function isValidIsbn10(value: string): boolean {
  if (!/^\d{9}[\dX]$/.test(value)) return false;
  let sum = 0;
  for (let index = 0; index < 10; index += 1) {
    const char = value[index] as string;
    sum += (char === 'X' ? 10 : Number(char)) * (10 - index);
  }
  return sum % 11 === 0;
}

/** ISBN-13 (EAN-13): pesos 1 e 3 alternados, soma múltipla de 10. */
function isValidIsbn13(value: string): boolean {
  if (!/^\d{13}$/.test(value)) return false;
  let sum = 0;
  for (let index = 0; index < 13; index += 1) {
    sum += Number(value[index]) * (index % 2 === 0 ? 1 : 3);
  }
  return sum % 10 === 0;
}

/** Aceita ISBN-10 e ISBN-13, já normalizados ou com hífen. */
export function isValidIsbn(input: string): boolean {
  const value = normalizeIsbn(input);
  return value.length === 10 ? isValidIsbn10(value) : isValidIsbn13(value);
}

/**
 * Um EAN-13 de livro ("Bookland"): prefixo 978 ou 979.
 *
 * O leitor da câmera devolve qualquer EAN-13 que entre no quadro, inclusive o
 * da embalagem de plástico ao lado. Este teste é o que impede consultar a base
 * com o código de barras de um pacote de biscoito.
 */
export function isBooklandEan(input: string): boolean {
  const value = normalizeIsbn(input);
  return /^97[89]\d{10}$/.test(value) && isValidIsbn13(value);
}

/** O dígito verificador de um ISBN-13 a partir dos 12 primeiros dígitos. */
function checkDigit13(twelve: string): string {
  let sum = 0;
  for (let index = 0; index < 12; index += 1) {
    sum += Number(twelve[index]) * (index % 2 === 0 ? 1 : 3);
  }
  return String((10 - (sum % 10)) % 10);
}

/**
 * O mesmo livro em ISBN-13. Um ISBN-10 vira `978` + os 9 primeiros dígitos +
 * um dígito verificador novo — o do ISBN-10 não serve, porque a conta é outra.
 *
 * Devolve `null` para entrada inválida: converter um código torto só produziria
 * um código torto de 13 dígitos.
 */
export function toIsbn13(input: string): string | null {
  const value = normalizeIsbn(input);
  if (!isValidIsbn(value)) return null;
  if (value.length === 13) return value;
  const body = `978${value.slice(0, 9)}`;
  return `${body}${checkDigit13(body)}`;
}
