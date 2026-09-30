# Verificação — 30/09/2026

## Resultado

Implementado na branch `feature/autenticacao` para Android e iOS: abertura, onboarding, entrar, criar conta, confirmar e-mail por código, recuperar senha por código, Início provisória e sair, com Supabase Auth atrás da interface `AuthRepository`. **Falta o teste ponta a ponta com um projeto Supabase real**, que depende do `.env` da equipe.

## Critérios de aceite

| Critério                                                               | Situação           | Evidência                                                                            |
| ---------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------ |
| Validação local com erro abaixo do campo e dados preservados           | Atendido           | `tests/auth-viewmodel.test.mjs` ("entrar valida localmente…", "criar conta valida…") |
| Mensagens em português, sem códigos técnicos                           | Atendido           | `tests/auth-model.test.mjs` (mensagens e mapeamento de erros do Supabase)            |
| Carregamento e bloqueio de envio duplo                                 | Atendido           | teste "envio duplo é ignorado…"                                                      |
| Recuperação não revela se o e-mail tem conta                           | Atendido           | mesma mensagem para qualquer e-mail; teste "recuperar senha não revela contas…"      |
| Sem `.env`, o app não simula autenticação                              | Atendido           | teste "sem configuração do Supabase…"; mensagem exibida na tela Entrar               |
| Nova senha validada antes de confirmar o código                        | Atendido           | teste confirma que `resetPassword` não é chamado com senha inválida                  |
| Reenvio de código com espera de 60 s                                   | Atendido           | teste de verificação de e-mail                                                       |
| Teclado, `autoComplete`, `textContentType`, alvos de 48 px, cabeçalhos | Atendido no código | conferido na renderização com react-native-web; falta conferir no aparelho           |
| Web mantém o aviso de Entrar/Criar conta                               | Atendido           | Chrome via CDP: o diálogo abre na exportação final                                   |
| Documentos legais descrevem cadastro, Supabase e medição da Vercel     | Atendido           | `tests/institutional.test.mjs`                                                       |

## Evidências gerais

- `npm run typecheck`: aprovado.
- `npm test`: 31 testes aprovados.
- `npx expo export --platform android --platform ios`: bundles gerados sem erros.
- `npm run build:web`: aprovado, sem mudança de tamanho na Web.

## Pendências antes de divulgar o cadastro

1. Criar o projeto Supabase, preencher o `.env` e configurar os modelos de e-mail com `{{ .Token }}` (ADR 0006). Depois, testar no Expo Go: criar conta, receber o código, confirmar, sair, entrar, recuperar a senha e entrar com e-mail não confirmado.
2. Comparar as telas com os quadros do Figma (Android `0:1`, iPhone `33:94`) e registrar as divergências.
3. Definir o controlador dos dados, o canal de atendimento, a região do projeto Supabase e o prazo de conservação, e completar a Política de Privacidade.
4. Oferecer a exclusão de conta (feature de Perfil) e avaliar a verificação de idade.

## Documentos legais

A Política de Privacidade dizia que o site não usava ferramentas de análise de visitas, mas o código já inclui Vercel Web Analytics e Speed Insights (PRs #4 e #5). O texto foi corrigido junto com a descrição do cadastro no aplicativo, conforme a constituição ("descrever o funcionamento efetivo nos documentos legais").
