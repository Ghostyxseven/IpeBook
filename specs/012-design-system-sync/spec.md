# Especificação 012 — Sincronização do Design System

## Contexto

O Design System do Figma evoluiu e o contrato visual do repositório ficou defasado. A atualização deve manter compatibilidade com a implementação existente e alinhar tokens, documentação, acessibilidade, componentes de produto e regras para agentes de IA.

## Objetivo

Sincronizar a branch de desenvolvimento com o Design System atual do IpêBook, preservando os nomes de variáveis CSS já consumidos pela Web e evitando alterações na branch `main`.

## Requisitos funcionais

1. `design-tokens.json` deve representar os tokens atuais de cores, tipografia, espaçamento, plataforma, layout, borda, opacidade, acessibilidade e motion.
2. Tokens já consumidos pelo código devem manter os mesmos caminhos para não quebrar as variáveis CSS geradas por `theme.ts`.
3. O sistema deve documentar as modalidades Venda, Troca e Doação e os estados Reservado e Concluído.
4. A documentação deve separar fundamentos globais de decisões específicas da página institucional.
5. Android deve seguir Material 3; iOS deve seguir componentes e padrões nativos; Web deve seguir grid responsivo e acessibilidade de teclado.
6. A documentação para IA deve proibir criação arbitrária de cores, medidas e componentes equivalentes quando já existir token ou componente de biblioteca.
7. O código Web deve usar tokens de motion, opacidade e borda quando houver equivalentes globais.

## Requisitos de qualidade

- Alvo de toque mínimo: 48 × 48 px.
- Foco visível na Web.
- Estados não dependem somente de cor.
- Preferência por movimento reduzido deve ser respeitada.
- Mudanças de Design System devem atualizar Figma, tokens, documentação e implementação no mesmo fluxo.

## Compatibilidade

A atualização deve preservar as variáveis CSS atualmente geradas, como `--color-text`, `--platform-web-controlHeight`, `--spacing-24` e `--landing-*`.

## Fora de escopo

- Recriar as telas do aplicativo.
- Alterar a arquitetura MVVM.
- Migrar a aplicação para outra biblioteca de UI.
- Alterar a branch `main`.
