/** Validações puras. Retornam a mensagem de erro ou `undefined` quando o valor é válido. */
export type FieldErrors<Field extends string> = Partial<Record<Field | 'form', string>>;

export const PASSWORD_MIN_LENGTH = 8;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeCode(code: string) {
  return code.replace(/\s+/g, '');
}

export function validateName(name: string) {
  const value = name.trim();
  if (!value) return 'Informe seu nome.';
  if (value.length < 2) return 'Use pelo menos 2 letras.';
  return undefined;
}

export function validateEmail(email: string) {
  const value = normalizeEmail(email);
  if (!value) return 'Informe seu e-mail.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Confira o e-mail. Exemplo: nome@email.com';
  return undefined;
}

/** Alterar senha (Figma 07.18): a senha atual só precisa estar preenchida. */
export function validateCurrentPassword(password: string) {
  return password ? undefined : 'Informe sua senha atual.';
}

/** No login só exigimos preenchimento: a regra de força vale para senhas novas. */
export function validateLoginPassword(password: string) {
  return password ? undefined : 'Informe sua senha.';
}

export function validateNewPassword(password: string) {
  if (!password) return 'Crie uma senha.';
  if (
    password.length < PASSWORD_MIN_LENGTH ||
    !/[A-Za-zÀ-ÿ]/.test(password) ||
    !/\d/.test(password)
  )
    return `Use pelo menos ${PASSWORD_MIN_LENGTH} caracteres, com letras e números.`;
  return undefined;
}

/** O cadastro só segue com os Termos de Uso e a Política de Privacidade aceitos. */
export function validateTermsAccepted(accepted: boolean) {
  return accepted
    ? undefined
    : 'Para criar a conta, aceite os termos de uso e a política de privacidade.';
}

export function validatePasswordConfirmation(password: string, confirmation: string) {
  if (!confirmation) return 'Repita a senha.';
  return password === confirmation ? undefined : 'As senhas não são iguais.';
}

/** O Supabase envia códigos de 6 dígitos por padrão; o tamanho pode ser ajustado até 10 no painel. */
export function validateCode(code: string) {
  const value = normalizeCode(code);
  if (!value) return 'Digite o código enviado para o seu e-mail.';
  if (!/^\d{6,10}$/.test(value)) return 'O código tem apenas números. Confira o e-mail recebido.';
  return undefined;
}

export function hasErrors<Field extends string>(errors: FieldErrors<Field>) {
  return Object.values(errors).some(Boolean);
}
