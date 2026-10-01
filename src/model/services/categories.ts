/** Categorias fixas do ADR 0007. O texto é gravado no anúncio e mostrado como está. */
export const categories = [
  'Literatura brasileira',
  'Literatura estrangeira',
  'Didáticos',
  'Técnicos e acadêmicos',
  'Infantojuvenil',
  'Quadrinhos',
  'Autoajuda e religião',
  'Outros',
] as const;

export type Category = (typeof categories)[number];

export function isCategory(value: string): value is Category {
  return (categories as readonly string[]).includes(value);
}
