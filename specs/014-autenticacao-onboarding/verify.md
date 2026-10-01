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
- `npm test`: 35 testes aprovados.
- `npx expo export --platform android --platform ios`: bundles gerados sem erros.
- `npm run build:web`: aprovado, sem mudança de tamanho na Web.

## Pendências antes de divulgar o cadastro

1. Criar o projeto Supabase, preencher o `.env` e configurar os modelos de e-mail com `{{ .Token }}` (ADR 0006). Depois, testar no Expo Go: criar conta, receber o código, confirmar, sair, entrar, recuperar a senha e entrar com e-mail não confirmado.
2. Comparar as telas com os quadros do Figma (Android `0:1`, iPhone `33:94`) e registrar as divergências.
3. Definir o controlador dos dados, o canal de atendimento, a região do projeto Supabase e o prazo de conservação, e completar a Política de Privacidade.
4. Oferecer a exclusão de conta (feature de Perfil) e avaliar a verificação de idade.

## Correção da issue #8: redirecionamento prematuro na recuperação (30/09/2026)

**Defeito:** `verifyOtp({ type: 'recovery' })` cria a sessão antes de `updateUser` gravar a senha. O repositório repassava esse aviso, `useSession` passava a `signedIn` e o layout `(auth)` redirecionava para `/inicio`. Se a gravação falhasse, a pessoa saía do formulário sem ver o erro e sem ter trocado a senha.

**Correção:**

- `userChangeGate.ts` retém os avisos do provedor durante a recuperação.
- `getCurrentUser` devolve `null` até a senha ser gravada; o login é avisado só depois.
- A falha mantém o formulário com o erro, e a nova tentativa não pede outro código.
- `cancelPasswordRecovery` encerra a sessão de recuperação ao trocar de e-mail ou sair da tela.
- O layout `(auth)` não mudou: ele só redireciona quando a sessão é avisada, o que agora acontece depois da gravação.

**Testes de regressão** (`npm test`, 67 aprovados):

- `tests/auth-model.test.mjs`: cliente Supabase falso que avisa `PASSWORD_RECOVERY` dentro de `verifyOtp`, antes de `updateUser` resolver. Cobre a falha de rede (nenhum aviso de login, `getCurrentUser` nulo), a nova tentativa sem novo `verifyOtp`, o cancelamento com `signOut` e o código inválido, que não chama `updateUser` e reabre o portão.
- `tests/auth-viewmodel.test.mjs`: o repositório em memória passou a emitir a sessão antes da gravação (`beforePasswordUpdate`). Cobre carregamento mantido e sessão `signedOut` com a gravação pendente; erro de rede visível e etapa preservada; nova tentativa autenticando só depois de gravar; `same_password` mantendo a tela; trocar de e-mail e sair da tela encerrando a recuperação.
- Login e confirmação de cadastro continuam cobertos pelos testes existentes, todos aprovados.

**Comandos:** `npm run typecheck` aprovado; `npm test` com 67 aprovados. ESLint e Prettier aprovados com fim de linha automático: neste Windows, `core.autocrlf=true` converte os arquivos para CRLF e o `npm run verify` acusa só `␍`. O CI, no Linux, recebe LF.

**Limitação:** comportamento validado com cliente simulado. O teste com Supabase real e aparelho fica na issue #12.

## Documentos legais

A Política de Privacidade dizia que o site não usava ferramentas de análise de visitas, mas o código já inclui Vercel Web Analytics e Speed Insights (PRs #4 e #5). O texto foi corrigido junto com a descrição do cadastro no aplicativo, conforme a constituição ("descrever o funcionamento efetivo nos documentos legais").
