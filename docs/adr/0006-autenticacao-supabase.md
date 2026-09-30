# 0006 — Autenticação com Supabase Auth

Data: 30/09/2026

## Status

Aceito (decisão da equipe informada em 30/09/2026).

## Contexto

A feature de autenticação precisa de: criar conta com e-mail e senha, verificar o e-mail, entrar, recuperar a senha e manter a sessão entre aberturas do app, no Android, no iOS e na Web. As outras features (catálogo, negociação, perfil) vão precisar de banco de dados e de regras de acesso por usuário.

## Decisão

Usar o **Supabase Auth** com `@supabase/supabase-js`, seguindo o guia oficial do Expo.

- **Configuração por variáveis de ambiente:** `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ver `.env.example`). A chave publicável pode ir para o app; a chave `service_role` nunca pode.
- **Sessão persistida:** no Android e no iOS, em `localStorage` do `expo-sqlite`; na Web, no `localStorage` do navegador. A renovação automática do token acompanha o `AppState` no celular.
- **Verificação e recuperação por código (OTP) enviado por e-mail**, em vez de link: `verifyOtp` com `type: 'signup'` e `type: 'recovery'`. Assim o fluxo funciona igual no app e na Web, sem configurar deep links nem URLs de redirecionamento.
- **Nome da pessoa** fica em `user_metadata.name` no cadastro. A tabela de perfis é da feature de Perfil.
- **Isolamento:** a interface `AuthRepository` (Model) esconde o Supabase. A implementação `supabaseAuthRepository` traduz os erros do Supabase para códigos do domínio; ViewModels e telas nunca importam o Supabase. Os testes usam `memoryAuthRepository`.
- **Sem configuração, o app não finge autenticar:** se as variáveis faltarem, as ações de autenticação falham com a mensagem "A autenticação ainda não foi configurada neste ambiente."

### Configuração necessária no painel do Supabase

1. Authentication → Providers → Email: manter **Confirm email** ligado.
2. Authentication → Email Templates → **Confirm signup** e **Reset password**: incluir `{{ .Token }}` no corpo, para o e-mail trazer o código. Sem isso, o e-mail só traz um link.
3. Opcional: configurar SMTP próprio. O SMTP padrão do Supabase tem limite baixo de envios por hora.

## Alternativas

- **Firebase Auth:** também atende, mas o banco (Firestore) é NoSQL. O Supabase oferece Postgres com Row Level Security, mais adequado para anúncios, pedidos e avaliações relacionais.
- **Backend próprio:** fora do alcance do prazo da disciplina e com mais risco de segurança.
- **Link mágico ou confirmação por link:** exigiria deep links e URLs de redirecionamento diferentes para cada plataforma e para o Expo Go.

## Consequências

- Cada pessoa da equipe precisa de um `.env` com as variáveis. O arquivo `.env` não é versionado.
- O cadastro passa a tratar nome, e-mail e senha. A Política de Privacidade e os Termos foram atualizados. **O controlador e o canal de atendimento continuam pendentes e precisam ser definidos antes de divulgar o cadastro publicamente.**
- O Supabase processa os dados como operador. A região do projeto precisa ser escolhida e informada na política.

Referências: [Expo — Using Supabase](https://docs.expo.dev/guides/using-supabase/), [Supabase — Email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless), [Supabase — Email templates](https://supabase.com/docs/guides/auth/auth-email-templates).
