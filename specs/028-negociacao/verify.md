# Verificação da contraproposta — 07/10/2026

## Estado e escopo

Retomada do trabalho interrompido do Claude em `.claude/worktrees/telas-micael`,
branch `feat/liquid-glass-ios`, HEAD inicial `4d832b7` (já integrado em `develop`
por `751db77`). Preservadas as alterações encontradas; nenhum commit, push, PR ou
migração remota foi realizado nesta retomada. A branch principal do workspace
permanece `develop`.

A entrega é a contraproposta da spec 028 / ADR 0030, para quem anuncia e quem pede
livros de troca. A revisão visual usou os quadros 06.19 (`423:24276`) e 06.20
(`423:24520`) do arquivo `cxEisNRzOQR6krv8Ow7HCa`. Adaptações estão em
`docs/design-system/divergencias.md`: modal de tela inteira e resposta no detalhe da
negociação, sem cartões ou mensagens automáticas na conversa.

## Evidências

- Verificação inicial `npm run verify`: aprovada antes das correções da retomada.
  O resultado mostrava 28 arquivos de teste, não 28 casos individuais.
- Cinco regressões foram acrescentadas e falharam antes da correção: reserva do
  segundo livro/recusa de concorrentes, aceite original durante contraproposta,
  filtro da estante, indisponibilidade no aceite e identificação do livro no detalhe.
- `node --test --test-isolation=none tests/negotiation-complete.test.mjs`:
  24 casos aprovados, nenhum ignorado. Inclui contratos RPC, erros de rede e de
  permissão, erro dentro da folha, resposta tardia após fechar e atualização do livro.
  `--test-isolation=none` expõe os casos individuais que o runner padrão deste
  ambiente agrupou por arquivo.
- Banco temporário: 24 verificações aprovadas usando PGlite 0.5.8 (PostgreSQL WASM,
  licença Apache-2.0), instalado exclusivamente em `/tmp`. Nenhuma dependência ou
  lockfile do aplicativo foi alterado. As tabelas, políticas RLS, gatilhos e RPCs
  vieram das migrações do projeto; apenas `auth` e `storage` foram simulados.
- Interface: Chromium isolado via CDP, sem Playwright, com dados fictícios em rota
  temporária removida após o ensaio. Conferidos 375 × 812 e 1280 × 800, sem rolagem
  horizontal; envio desabilitado sem escolha, `aria-checked`, foco visível, seleção
  por Enter, erro de envio dentro do modal, fechar, estante vazia e erro de carga.
  Preferência de movimento reduzido ativada. Capturas inspecionadas em
  `/tmp/ipebook-contra-celular.png` e `/tmp/ipebook-contra-web.png`.
- A inspeção encontrou `accessibilityState.checked` sem refletir em `aria-checked`
  no React Native Web instalado. Corrigido no controle novo e retestado no navegador.
- Build Web da apresentação e do aplicativo: aprovado. Não comprova fluxo remoto
  nem funcionamento nativo em aparelhos.
- Uma execução intermediária de `verify` parou na formatação da rota temporária;
  a rota foi removida antes da verificação final. Nenhum teste foi desativado.

## Reproduzir a validação SQL

Pré-requisito: Node compatível com o projeto e PGlite 0.5.8 em ambiente temporário.
A instalação abaixo exige acesso ao registro npm, mas não modifica o projeto:

```sh
npm install --prefix /tmp/ipebook-sql-validation --no-save --ignore-scripts --no-audit --no-fund @electric-sql/pglite@0.5.8
node scripts/verificar-contraproposta-sql.mjs /tmp/ipebook-sql-validation/node_modules/@electric-sql/pglite/dist/index.js
```

O comando executa as sete migrações necessárias à contraproposta (catálogo,
notificações, pedidos, segurança, transições, negociação completa e contraproposta).
Confere participantes, modalidades e livros inválidos, inserção forjada, atualização
direta sem efeito, contraproposta duplicada, bloqueio do aceite original, reserva dos
dois livros, original disponível, recusa dos concorrentes, cancelamento, conclusão,
indisponibilidade sem gravação parcial e ausência de autenticação. Falhas propagam
código de saída diferente de zero. Não testa concorrência entre conexões, nem o
servidor PostgREST real.

Este ensaio é separado de `npm run verify`; requer o pacote temporário indicado.
A CI existente não ganhou esse pré-requisito nesta retomada.

## Bloqueio preexistente da cadeia completa

```sh
node scripts/verificar-contraproposta-sql.mjs /tmp/ipebook-sql-validation/node_modules/@electric-sql/pglite/dist/index.js --todas
```

**Falha reproduzida, código de saída 1:** migração
`20261007120000_avaliacoes_e_perfil_publico.sql`, erro PostgreSQL `42883`,
`operator does not exist: uuid = text`. Em `can_rate(request_id uuid, author uuid,
subject uuid)`, a expressão `r.requester_id = author` resolve `author` como a coluna
textual de `listings`, em vez do parâmetro UUID. O arquivo é preexistente e não foi
alterado: precisa de correção na entrega de avaliações. A aprovação do teste SQL
focado **não** representa aprovação dessa cadeia completa.

## Pendências e continuidade

- Testar o fluxo integrado em Android e iPhone com duas contas reais de teste:
  contrapropor, conferir os dois títulos, aceitar/recusar, cancelar e concluir.
  Também validar leitores de tela, texto ampliado e safe areas nativas.
- Resolver o bloqueio da migração de avaliações em escopo próprio antes de aplicar
  toda a cadeia num banco novo. O estado do Supabase da equipe não foi consultado.
- Aplicar migrações remotas somente no escopo autorizado pelo responsável. Sem a
  coluna `counter_listing_id`, o novo cliente não pode consultar negociações.
- Só houve autorrevisão, com testes e inspeção visual; não houve revisão independente.
