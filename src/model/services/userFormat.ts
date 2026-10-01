/** Primeiro nome para saudações; `null` quando o cadastro não tem nome. */
export function firstName(name: string | null | undefined) {
  const first = name?.trim().split(/\s+/)[0];
  return first || null;
}

/** "Olá, Ana" ou só "Olá" quando não há nome. */
export function greeting(name: string | null | undefined) {
  const first = firstName(name);
  return first ? `Olá, ${first}` : 'Olá';
}
