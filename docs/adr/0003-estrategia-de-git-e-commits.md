# 0003 — Estratégia de Git, Branches e Commits

Data: 29/09/2026

## Status

Aceito

## Contexto

Para garantir que o histórico do projeto IpeBook permaneça organizado, rastreável e sem código quebrado na branch principal (produção), precisamos estabelecer um padrão rigoroso para a criação de branches, gestão de fluxo de trabalho e formatação das mensagens de commit.

## Decisão

Adotaremos a seguinte estratégia de versionamento:

1. **Gestão de Branches**:
   - A branch `main` será estritamente protegida. Nenhuma alteração direta (commits) deve ser feita na `main`. Ela servirá apenas para versões estáveis prontas para produção.
   - A branch `develop` servirá como nossa base de desenvolvimento e integração contínua.
   - Novas funcionalidades, correções de bugs ou tarefas isoladas devem ser feitas em **feature branches** (ex: `feature/tela-login`, `fix/botao-voltar`) que sempre partirão de `develop`.
   - As feature branches serão integradas (mergeadas) de volta em `develop` ao fim do seu ciclo e validação.

2. **Mensagens de Commit**:
   - Adotaremos o padrão **Conventional Commits** em português para as mensagens.
   - Exemplos de prefixos:
     - `feat:` (nova funcionalidade)
     - `fix:` (correção de bug)
     - `docs:` (alteração em documentação)
     - `chore:` (manutenção, atualizações de build/configs que não afetam o código fonte)
     - `refactor:` (refatoração de código)
   - Exemplo de mensagem: `feat: adiciona botão de voltar na tela de perfil`.

## Consequências

- Todas as contribuições (sejam de desenvolvedores ou de Agentes IA) seguirão um fluxo previsível e isolado.
- Agentes de IA serão configurados para não modificar a `main` e criar suas branches quando o escopo exigir isolamento.
- O histórico de commits ficará descritivo e fácil de auditar.
- Evitaremos bugs "paralisantes" na `main`.
