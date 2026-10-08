# Verificação — conclusão do cadastro Google

Data: 08/10/2026. Implementado localmente; sem commit, push ou publicação.

## Evidências

- `node tests/google-registration.test.mjs`: 5 cenários aprovados. Mapeamento de
  provedor e marca; mesma identidade no login por senha e Google (repositório em
  memória); ordem bairro → Auth; falhas parciais e repetição; validações; contrato
  `updateUser` sem senha nos metadados, sem alteração de e-mail e sem `signUp`.
- `node tests/google-registration-viewmodel.test.mjs`: 3 cenários aprovados.
  Carregamento, validação, envio duplicado, limpeza da senha em memória depois do
  sucesso, erro de rede, nova tentativa, saída e retomada de sessão pendente.
- `npm run verify`: tipos, lint, formatação e 34 arquivos de testes aprovados,
  sem falhas ou testes ignorados na primeira execução desta etapa.
- Prévia Web isolada via Chrome DevTools Protocol, sem Playwright, em 393 × 852 e
  1280 × 1000: formulário visível, sem rolagem horizontal; e-mail somente leitura;
  erros de senha/bairro/termos; digitação, confirmação, falha remota simulada e
  preservação dos valores. Capturas em `/tmp/ipebook-registration-mobile.png` e
  `/tmp/ipebook-registration-desktop.png`. Dados fictícios, fetch Supabase interceptado;
  não houve escrita em conta real. Script em `/tmp/ipebook-registration-preview.mjs`.
- Android por USB: abrir `/completar-cadastro` sem sessão levou corretamente a
  Entrar. Não alterada a conta pessoal do usuário para fabricar uma validação.
- Referências Figma Android e iPhone inspecionadas; reutilizados os componentes e
  tokens existentes. Tela nova registrada em `docs/design-system/divergencias.md`.

## Revisão e limites

Autorrevisão separada do diff: proteção de entrada e deep links, manutenção da
identidade, senha somente no Auth, marca apenas depois do bairro, erro sem perda
dos campos e ausência de dependência nova nesta feature. A marca em metadados
controla onboarding, não autorização de dados.

Pendente: login Google completo no Android com preenchimento e gravação de senha,
seguido de saída e login por e-mail/senha na mesma identidade. Não executado em iPhone
real. A prévia Web não comprova configurações do provedor remoto. Não foi feita
revisão independente. O usuário foi solicitado a entrar no Android para continuar.

Mudanças preexistentes de PKCE/callback foram preservadas. Durante a validação
surgiram também arquivos de outra atividade (`specs/035-validacao-app-web`,
`oauthBrowser.web.ts` e seu teste); não foram alterados por esta tarefa.

Revisão final: `npm run verify` passou novamente, agora com 35 arquivos de teste
(incluindo o teste Web acrescentado pela atividade paralela), sem falhas ou testes
ignorados. `git diff --check` passou. Encerradas somente a prévia Web isolada da
porta 8087 e a instância Chromium criada nesta tarefa; Expo do Android preservado.
