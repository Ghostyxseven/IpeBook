import type { AuthErrorCode } from '../entities/AuthError';

const messages: Record<AuthErrorCode, string> = {
  invalid_credentials: 'E-mail ou senha incorretos. Confira e tente de novo.',
  email_not_confirmed: 'Confirme seu e-mail para entrar. Enviamos um novo código.',
  email_in_use: 'Já existe uma conta com este e-mail. Tente entrar ou recuperar a senha.',
  invalid_email: 'Confira o e-mail informado.',
  weak_password: 'Escolha uma senha mais forte, com letras e números.',
  invalid_code: 'Código inválido ou expirado. Confira o e-mail ou peça um novo código.',
  same_password: 'A nova senha precisa ser diferente da anterior.',
  rate_limited: 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.',
  network: 'Não conseguimos falar com o servidor. Confira sua internet e tente de novo.',
  not_configured: 'A autenticação ainda não foi configurada neste ambiente.',
  unknown: 'Algo deu errado. Tente de novo em instantes.',
};

export function authErrorMessage(code: AuthErrorCode) {
  return messages[code];
}
