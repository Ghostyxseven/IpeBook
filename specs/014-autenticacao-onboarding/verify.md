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

## Issue #34: sessão que cai ao reiniciar o app (01/10/2026)

**Investigação** com o supabase-js real (2.117) e armazenamento em memória, simulando um app reaberto:

| Situação ao reabrir                | Supabase                                                  | App antes                                     | App depois                                 |
| ---------------------------------- | --------------------------------------------------------- | --------------------------------------------- | ------------------------------------------ |
| Token válido                       | devolve a sessão                                          | Início                                        | Início                                     |
| Token vencido e sem internet       | mantém a sessão salva e devolve `AuthRetryableFetchError` | **Entrar** (tratava o erro como "sem sessão") | aviso "Sem conexão" com "Tentar novamente" |
| Token vencido e renovação recusada | apaga a sessão                                            | Entrar                                        | Entrar                                     |

**Conclusão:** o `userChangeGate` da issue #8 não derruba a sessão. A troca de inscrição entre a abertura e a área logada recebe a sessão salva normalmente (teste com supabase-js real). A causa é anterior: `getCurrentUser` ignorava o erro de `getSession`. O token de acesso vale 1 hora; num emulador reiniciado sem rede pronta, a sessão salva era descartada pela tela.

**Correção:**

- `getCurrentUser` rejeita com `AuthError('network')` quando não consegue confirmar a sessão.
- `useSession` mantém `loading` com `restoreError` e oferece `retryRestore`; outros erros continuam levando para Entrar.
- `SessionPendingScreen` mostra "Sem conexão" na abertura e na área logada. Quando o provedor confirma a sessão, a pessoa segue para a Início.

**Testes:** 6 novos (86 aprovados).

- `tests/auth-model.test.mjs`: restauração com supabase-js real e troca de inscrições; token vencido sem internet (retorno simulado, porque o supabase-js real leva cerca de 25 s tentando renovar); renovação recusada com supabase-js real.
- `tests/auth-viewmodel.test.mjs`: aguarda conexão em vez de ir para Entrar; nova tentativa; confirmação tardia do provedor; erro que não é de rede; reabertura com sessão salva.

**Limitação:** falta reproduzir num aparelho real (fechar o app por completo, reabrir e reiniciar o aparelho), o que fica na issue #12. No Waydroid, a perda dos dados do app ao reiniciar não foi descartada.

## Issue #31: código em vez de link nos e-mails (02/10/2026)

**Configuração do projeto conferida** pelo endpoint público `/auth/v1/settings`, com a chave publicável:

| Configuração                                             | Valor         | ADR 0006 |
| -------------------------------------------------------- | ------------- | -------- |
| Login por e-mail                                         | ativo         | ✅       |
| Cadastro aberto                                          | sim           | ✅       |
| Confirmação de e-mail obrigatória (`mailer_autoconfirm`) | sim (`false`) | ✅       |

**Modelos de e-mail** preparados em `supabase/templates/` (`confirmar-cadastro.html` e `recuperar-senha.html`, com `{{ .Token }}`), com o passo a passo em `supabase/README.md`.

**Concluído (09/10/2026):** SMTP próprio configurado com **Resend** (Authentication → Emails → SMTP Settings), os dois modelos colados no painel, e o cadastro e a recuperação de senha testados recebendo o código por e-mail. Issue #31 fechada.

## Documentos legais

A Política de Privacidade dizia que o site não usava ferramentas de análise de visitas, mas o código já inclui Vercel Web Analytics e Speed Insights (PRs #4 e #5). O texto foi corrigido junto com a descrição do cadastro no aplicativo, conforme a constituição ("descrever o funcionamento efetivo nos documentos legais").

## Issue #11: telas de acesso comparadas com o Figma (03/10/2026)

**Fonte:** arquivo IpêBook (`cxEisNRzOQR6krv8Ow7HCa`), página 06 · Android, seção 01 · Acesso (`206:3560`), com os quadros 01.01 a 01.17. As telas do iPhone (seção `206:6868`) ficam para a issue #10. As referências antigas (`qSTmNLUhC6PwJlbyUmytbe`, `0:1` e `33:94`) foram substituídas.

**Padrão visual corrigido em todas as telas de acesso** (`AuthLayout`):

| Item            | App antes                         | Figma e app depois                                                |
| --------------- | --------------------------------- | ----------------------------------------------------------------- |
| Marca           | não aparecia                      | logotipo "IpêBook" marrom com traço âmbar (`Wordmark`)            |
| Título          | `brandHeadline` 30/36             | `brandDisplay` 36/41 em Source Serif 4 Bold                       |
| Destaque        | não existia                       | trecho final com marca-texto `tertiaryContainer` (ex.: "acesso.") |
| Descrição       | texto secundário pequeno          | `bodyLarge` em `onSurfaceVariant`                                 |
| Alinhamento     | conteúdo centralizado na vertical | conteúdo alinhado ao topo, fundo `surface`                        |
| Ações de rodapé | links soltos                      | botão contornado em largura total e nota de apoio centralizada    |

**Comparação por tela:**

| Tela do app         | Quadro                                | Resultado                                                                                    |
| ------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------- |
| Entrar              | 01.10 Entrar com e-mail, 01.02 Entrar | título "Sua próxima leitura começa aqui.", campos, "Esqueci minha senha" e "Criar uma conta" |
| Criar conta         | 01.03 Criar conta                     | "Crie sua conta", "Nome completo", "Já tenho conta" contornado                               |
| Recuperar senha     | 01.04 Recuperar acesso                | "Recupere seu acesso." com destaque, "Voltar ao login" e nota                                |
| Nova senha          | 01.06 Nova senha                      | "Um novo começo.", dica de senha e "Salvar nova senha"                                       |
| Confirmar e-mail    | 01.05 Confira seu e-mail, 01.12       | "Confirme seu e-mail.", "Corrigir e-mail" e nota sobre a caixa de spam                       |
| Erros de formulário | 01.07, 01.11, 01.14, 01.16            | já cobertos por `FormMessage` e pelas mensagens do Model; textos mantidos                    |

**Evidência:** prévia Web das telas Recuperar senha e Entrar, exportada com `expo export` e comparada com a captura do quadro 01.04. A prévia não carrega a Source Serif; o app carrega a fonte no layout raiz.

**Divergências funcionais mantidas para decisão da equipe** (não foram implementadas porque mudam regra de negócio ou contrariam ADR):

1. O Figma usa **link** por e-mail ("Enviar link", 01.08 Link expirado). O app usa **código** (ADR 0006); os textos dizem "código".
2. "Continuar com Google" (01.01 e 01.02): não há provedor social configurado nem ADR.
3. Caixa de aceite dos Termos no cadastro (01.03): exige decidir como registrar o aceite.
4. "Explorar livros sem entrar" (01.01): as rotas da área logada exigem sessão.
5. 01.17 Seu bairro: depende do perfil e da localização (outra feature).
6. Boas-vindas numa tela só (01.01), contra o onboarding de 3 páginas do app.
7. Cadastro sem confirmação de senha no Figma; o app mantém o campo para evitar erro de digitação.
8. 01.09 Senha atualizada e 01.13 E-mail confirmado: o app entra direto na Início após o sucesso.

**Validação:** `npm run typecheck`, `npm test` (209 aprovados), eslint e prettier sem erros e exportação nativa (Android e iOS).

## Divergências do Figma aplicadas (03/10/2026)

A equipe decidiu seguir o Figma nos itens abaixo. Cada item foi feito num commit próprio.

1. **Boas-vindas numa tela só** (01.01): `OnboardingScreen` com logotipo sem traço, selo "Piripiri · Piauí", título `brandLargeTitle` (34/41, novo token `typography.brand.largeTitle`) com destaque, ilustração exportada do Figma (`assets/images/boas-vindas-classicos.png`), modalidades e as ações Começar (Criar conta) e Já tenho conta (Entrar). As três páginas, Pular, Voltar e Próxima saíram. A página "Combine com cuidado" saiu junto: o pedido de encontro já pede um local público e a página institucional mantém os conselhos de segurança. "Explorar livros sem entrar" não foi incluído, porque a área logada exige sessão.
2. **Cadastro sem "Confirmar senha"** (01.03): o `SignUpScreen` tem só Nome completo, E-mail e Senha, com o botão Mostrar no campo de senha. A `useSignUpViewModel` não guarda nem valida mais a confirmação. O título do cadastro usa `brandHeadline` (30/36), como no quadro, pela nova opção `titleSize` do `AuthLayout`. A Nova senha da recuperação mantém a confirmação, como no quadro 01.06.
3. **Aceite dos Termos no cadastro** (01.03): novo componente `Checkbox` (item de lista do Material 3 com `check_box` ou `square` no iPhone, linha inteira tocável, estado anunciado). Sem a caixa marcada, a `useSignUpViewModel` mostra "Para criar a conta, aceite os termos de uso e a política de privacidade." e não chama o cadastro. A data do aceite segue no `signUp` e fica em `terms_accepted_at`, nos metadados da conta no Supabase (`auth.users.raw_user_meta_data`), sem tabela nova. O aviso de privacidade que ficava abaixo da senha saiu, porque o aceite o substitui. **Lacuna:** o quadro não tem link para ler os termos antes de aceitar. Os documentos estão no site e nas Configurações; um link no cadastro fica para a revisão do grupo (issue #49).
4. **Telas de sucesso** (01.09 Senha atualizada e 01.13 E-mail confirmado): rotas `/senha-atualizada` e `/email-confirmado` na área logada, desenhadas pelo `AuthSuccessScreen`, com barra e voltar, título `brandHeadline`, explicação, cartão preenchido em `selected` e ações. Confirmar o código já inicia a sessão, e o layout das telas de entrada redireciona antes de a ViewModel receber a resposta. Por isso a ViewModel marca o destino em `afterSignIn` antes de chamar o provedor, desmarca se falhar, e o layout usa essa marca em vez da Início. Os testes cobrem o código errado (sem marca) e o certo (com marca). **Divergência de texto:** o Figma diz "Entre novamente para continuar", mas a sessão já está aberta depois da troca (issue #8). O texto ficou "Sua nova senha foi salva e você já está na sua conta.", e "Entrar na minha conta" leva à Início.
5. **Alterar senha nas Configurações** (07.18 a 07.21): item "Alterar senha" em Configurações › Conta (ícone `lock`), rota `/alterar-senha` com barra "Alterar senha" e `ChangePasswordScreen`. A `useChangePasswordViewModel` controla os quatro estados do Figma:
   - formulário (07.18);
   - senha atual incorreta (07.19), só com o campo da senha atual, "Tentar novamente" e "Recuperar acesso";
   - nova senha inválida (07.21), só com a nova senha e a confirmação, "Corrigir nova senha" e "Cancelar";
   - senha alterada (07.20), com "Voltar à segurança" e "Voltar às configurações".

   O repositório ganhou `changePassword`: no Supabase, ele confere a senha atual entrando de novo com ela (`signInWithPassword`) e só então grava a nova (`updateUser`). O erro novo `wrong_current_password` mostra "A senha atual não confere.". "Esqueci a senha atual" e "Recuperar acesso" saem da conta e abrem a recuperação já com o e-mail (`afterSignOut`, usado pelo layout da área logada). **Divergência:** o quadro 07.05 não tem a entrada "Alterar senha"; ela foi posta em Conta, junto de Pessoas bloqueadas. A nota cita "letras e números", que é a regra real do app.

6. **Seu bairro e Escolher bairro** (01.17 e 11.01):
   - **Banco:** migration `20261003140000_perfil_bairro.sql` cria `profiles` (bairro, cidade fixa em Piripiri, RLS só da própria pessoa, o app grava só `neighborhood`).
   - **Model:** `ProfileRepository` (Supabase e memória), `Profile`/`ProfileError` e `neighborhood.ts`, com os bairros sugeridos do Figma e a validação.
   - **ViewModel:** `useNeighborhoodViewModel`, compartilhada pelas duas telas.
   - **Seu bairro (`/seu-bairro`):** lista com rádio (`RadioListItem`) e "Outro bairro…" com campo de texto; abre a partir de "Explorar livros" no E-mail confirmado e, ao salvar, segue para Explorar.
   - **Escolher bairro (`/escolher-bairro`):** cidade desabilitada e campo Bairro; abre por Configurações › Conta › Seu bairro.

   **Divergências:** o texto de apoio "Mais anúncios agora" do Centro saiu, porque é uma afirmação sem fonte (regra 8 do AGENTS.md). Os testes estão em `tests/neighborhood.test.mjs`. A migration precisa ser aplicada no Supabase do grupo.

7. **Permitir localização** (11.02): rota `/permitir-localizacao`, aberta por "Usar localização" em Escolher bairro.
   - **"Usar minha localização":** pede a permissão só com o app aberto, lê a posição aproximada (`Accuracy.Balanced`, cerca de 100 m), converte em endereço e volta para Escolher bairro com o campo Bairro preenchido. O bairro só é gravado quando a pessoa toca em "Salvar localização".
   - **Organização:** o `expo-location` fica só em `src/infra/deviceLocator.ts`, atrás do contrato `DeviceLocator` do Model. A regra que extrai o bairro e confere se a cidade é Piripiri é pura (`neighborhoodFromAddress`) e testada.
   - **Mensagens próprias:** permissão negada, localização indisponível, fora de Piripiri e bairro não encontrado, todas oferecendo "Escolher bairro".
   - **Configuração:** `app.json` ganhou o plugin com o texto da permissão no iOS, sem localização em segundo plano.

   **Pendências:** a posição não é guardada nem enviada, mas a Política de Privacidade precisa citar o uso da localização aproximada (issue #49). Testar num aparelho real (issue #12), porque o endereço depende do serviço de geocodificação do sistema.

8. **Excluir conta** (07.09 e 07.17, issue #47, [ADR 0023](../../docs/adr/0023-excluir-conta-pelo-app.md)):
   - **Telas e entradas:** Configurações ganhou "Privacidade e dados" e "Excluir conta" em vermelho. A tela Privacidade e dados tem os cartões do que fica visível, "Editar informações" (bairro) e "Excluir conta", com o diálogo "Excluir sua conta?" e o botão "Excluir" vermelho (opção `destructive` do `ConfirmDialog`). Depois da exclusão, aparece Conta excluída (`/conta-excluida`) com "Voltar ao início".
   - **Banco e repositório:** `supabaseAccountRepository` remove as capas da pasta da pessoa, chama `delete_own_account()` (migration `20261003150000_excluir_conta.sql`) e sai da sessão no aparelho.
   - **Política de Privacidade:** passou a descrever a exclusão pelo app.
   - **Testes:** `tests/account.test.mjs`.

   **Divergências de texto:** os cartões citam só o que o app guarda (sem telefone nem avaliações), e "Editar informações" edita o bairro, porque o app não muda o nome. **Pendente:** aplicar a migration e testar com uma conta descartável.

## Correção do login Google — 08/10/2026

Escopo: alinhar a configuração do cliente ao fluxo PKCE já decidido no ADR 0028,
sem modificar telas, provedores remotos ou contratos de cadastro e recuperação por OTP.
A correção anterior extraía o código, mas o cliente ainda iniciava o fluxo implícito.

Critérios e plano de validação:

- Gerar autorização Google com desafio PKCE usando a configuração real do cliente.
- Trocar somente o código retornado, enviando o verificador correspondente ao desafio.
- Restaurar a sessão resultante; cancelar ou receber retorno sem código não troca sessão.
- Propagar falhas do provedor com os erros de domínio existentes.
- Reproduzir a falha antes da correção; executar tipos, testes e formatação depois.
- Validar o retorno real do Google no dispositivo depende de acesso ao app e da
  configuração do provedor e dos redirects no Supabase; a simulação não substitui isso.

Estado inicial: `develop`, commit `2a92825`, sem alterações rastreadas; worktree do
Claude preservado. Superpowers indisponível nas skills compartilhadas consultadas.

Resultado local:

- `node tests/google-auth.test.mjs`: antes da correção, 5 cenários passaram e o
  cenário de integração falhou porque `code_challenge_method` era `null`; depois,
  os 6 cenários passaram. Usa SDK e configuração reais, armazenamento isolado e
  transporte simulado com dados fictícios, sem chamadas de rede.
- `npm run verify`: aprovado (tipos, lint, formatação e 31 arquivos de testes,
  sem falhas nem testes ignorados). A saída agregada conta arquivos; o novo arquivo
  contém seis cenários executados também diretamente.
- `git diff --check`: aprovado. Revisão do diff: configuração restrita a
  `flowType: 'pkce'`, conforme ADR 0028; sem dependências novas, logs sensíveis ou
  mudanças visuais. Os testes existentes de cadastro e recuperação continuam passando.
- Implementação e validação local concluídas; validação real Android/iOS/Web e
  configuração remota não verificadas. Não houve commit, push nem publicação nesta correção.

### Retorno do dispositivo: WebCrypto indisponível

O usuário observou o aviso de fallback para PKCE `plain` após ativar o fluxo.
O teste anterior usava WebCrypto do Node e não representava essa limitação nativa.
Correção prevista: fornecer somente as operações criptográficas necessárias ao
PKCE com `expo-crypto` compatível com SDK 57, antes de criar o cliente Supabase;
preservar APIs existentes e manter a Web no WebCrypto do navegador. Critérios:
ausência de WebCrypto deve produzir desafio S256, sem aviso de fallback; verificar
hash conhecido, aleatoriedade delegada ao módulo nativo e preservação das APIs.
`expo-crypto` é mantido pelo Expo, licença MIT, incluído no Expo Go, sem serviço
ou custo externo; substitui a ausência de implementação nativa de digest.

Resultado da correção de WebCrypto:

- Sem o adaptador, uma reprodução isolada com `globalThis.crypto` ausente emitiu
  exatamente o aviso relatado e gerou `code_challenge_method=plain`.
- `node tests/pkce-crypto.test.mjs`: aprovado; simula ausência de WebCrypto,
  substitui somente o módulo Expo por primitivas do Node, confere vetor SHA-256
  conhecido, geração S256 sem aviso e preservação de WebCrypto existente.
  Não executa a implementação nativa num aparelho.
- `node tests/google-auth.test.mjs`: seis cenários aprovados.
- `npm run typecheck`, `npm run lint`, `npm run format:check` e `npm test`:
  aprovados; 32 arquivos de teste, sem falhas ou testes ignorados.
- Instalado somente `expo-crypto@57.0.3`; lock atualizado. O npm informou 33
  vulnerabilidades na árvore (11 moderadas, 21 altas, 1 crítica), sem análise de
  origem nesta tarefa; nenhuma atualização automática de outras dependências.
- O login real e a execução da ponte criptográfica no aparelho seguem pendentes.
  Reabrir o app após a instalação; builds próprios precisam incorporar o módulo
  nativo. Expo Go já inclui esse módulo.
- `npx expo export --platform ios --output-dir /tmp/ipebook-pkce-ios --no-bytecode --max-workers 2`:
  aprovado; Metro gerou o pacote iOS com a nova dependência. Exportação de JavaScript
  não comprova execução no aparelho nem autenticação no provedor.

### Reconexão Android por USB — 08/10/2026

Após aviso "Cannot connect to Expo CLI", o servidor existente respondeu
`packager-status:running` na porta 8081. Configurado `adb reverse tcp:8081 tcp:8081`
e reaberto o projeto por `exp://127.0.0.1:8081`, reiniciando apenas o Expo Go,
sem limpar dados. O pacote Android retornou HTTP 200. A captura final mostrou a
seleção de contas do Google; não houve seleção de conta pelo agente nem confirmação
de sessão autenticada. Manter o cabo conectado enquanto usar esse endereço.

### Retorno Android em rota inexistente — 08/10/2026

Reprodução no aparelho: após escolher a conta Google, o Expo Router apresentou
"Unmatched Route" para `/auth/callback`. O retorno continha um código, que não foi
copiado para logs ou documentação. Faltava o arquivo da rota.

Correção: `/auth/callback` reutiliza `StartScreen`, sua ViewModel e a decisão de
navegação existente por sessão. A troca do código permanece exclusivamente na
operação `signInWithGoogle` já aberta; o callback não repete a troca nem propaga
parâmetros sensíveis ao destino. Sem tela ou padrão visual novo.
Critério: abrir o retorno sem página inexistente e encaminhar conforme a sessão.

Validação da rota: tipos, formatação e seis cenários de OAuth aprovados.
Após abrir `/auth/callback` sem código no Android, a captura posterior mostrou
Entrar, sem "Unmatched Route". Isso comprova o encaminhamento sem sessão, mas
não comprova conclusão do login Google: falta nova tentativa completa pelo usuário.
