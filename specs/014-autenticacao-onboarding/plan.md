# Plano

Depende da [spec 013](../013-base-app-nativo/spec.md). Dependências: `@supabase/supabase-js` e `expo-sqlite` (guia oficial do Expo para Supabase).

## Model

- `entities/User.ts`: `{ id, name, email, emailVerified }`.
- `entities/AuthError.ts`: classe `AuthError` com códigos do domínio (`invalid_credentials`, `email_not_confirmed`, `email_in_use`, `invalid_email`, `weak_password`, `invalid_code`, `same_password`, `rate_limited`, `network`, `not_configured`, `unknown`).
- `services/authValidation.ts`: funções puras para nome, e-mail, senha de login, senha nova, confirmação e código.
- `services/authMessages.ts`: código do domínio → mensagem em português.
- `services/onboarding.ts`: conteúdo das páginas do onboarding.
- `repositories/AuthRepository.ts`: interface usada pelas ViewModels.
- `repositories/supabaseAuthRepository.ts`: implementação com cliente injetado; traduz erros.
- `repositories/memoryAuthRepository.ts`: implementação em memória para testes.
- `repositories/supabaseClient.ts`, `localStore.ts` / `localStore.web.ts`: cliente e armazenamento da sessão.
- `repositories/preferencesRepository.ts`: guarda se o onboarding já foi visto.

## ViewModels (hooks que recebem o repositório)

`useSession`, `useStartViewModel` (abertura; issue #32), `useLoginViewModel`, `useSignUpViewModel`, `useVerifyEmailViewModel`, `usePasswordRecoveryViewModel`, `useOnboardingViewModel`. A navegação é passada pela View como callback, para a ViewModel não depender do roteador. `src/factories/auth.ts` injeta os repositórios reais.

## Views

Telas em `src/view/screens/` (`OnboardingScreen`, `auth/LoginScreen`, `auth/SignUpScreen`, `auth/VerifyEmailScreen`, `auth/PasswordRecoveryScreen`) usando `AuthLayout`, `TextField`, `Button` e `FormMessage`. Rotas em `src/app/(auth)/` só reexportam as telas.

## Decisões

- Verificação e recuperação por código OTP (ADR 0006).
- Na recuperação, a nova senha é validada localmente antes de enviar o código, porque a confirmação do código já inicia a sessão.
- Issue #8: os repositórios distribuem as mudanças de usuário por um portão (`userChangeGate.ts`). Durante a recuperação, os avisos do provedor ficam retidos e `getCurrentUser` devolve `null`; o login só é avisado depois que `updateUser` confirma a senha. Se a gravação falhar, o código continua confirmado e uma nova tentativa grava só a senha. Trocar de e-mail ou sair da tela chama `cancelPasswordRecovery`, que encerra a sessão de recuperação. Nada depende de temporizador.
- Cadastro com e-mail já existente: o Supabase devolve um usuário ofuscado para não revelar contas. O app segue para a verificação da mesma forma.

## Verificação

Testes unitários em Node (`tests/auth-*.test.mjs`), typecheck, exportação dos bundles Android e iOS e registro das pendências (Supabase real, Figma, aparelhos) no `verify.md`.
