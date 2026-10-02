# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Português Obrigatório

- Todos os agentes devem se comunicar e documentar (ADRs, Spec Kit, READMEs) estritamente em Português.

## Spec Kit

- O desenvolvimento deve seguir o GitHub Spec Kit obrigatoriamente (https://github.com/github/spec-kit).
- O fluxo orientado por especificações (specify -> plan -> tasks -> implement -> verify) deve ser sempre utilizado.

## Architecture Decision Records (ADRs)

- Este projeto adota ADRs (https://github.com/architecture-decision-record/architecture-decision-record).
- Decisões importantes devem ser registradas em `docs/adr/`.

## Design System — IpêBook

O contrato visual é composto por:

- [Figma](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook-Mobile?node-id=20-207): decisão visual e bibliotecas.
- [`design-tokens.json`](design-tokens.json): contrato de implementação.
- [`docs/design-system.md`](docs/design-system.md): visão geral.
- [`docs/design-system/`](docs/design-system/): foundations, components, platforms, acessibilidade, IA e governança.
- [`docs/design-system/referencia/`](docs/design-system/referencia/LEIA-ME.md): cópia do design system publicado (voz, tipografia, iOS, Web, movimento, acessibilidade, README de cada componente e `tokens.json`). Todo agente de IA e toda pessoa devem seguir.

Antes de implementar interface, leia essas fontes.

## Ao escrever ou revisar interface

1. Identifique a plataforma: Android, iOS ou Web.
2. Consulte o quadro correspondente no Figma.
3. Consuma `design-tokens.json` por meio de tema, constantes ou CSS variables. Não duplique hex, radius, spacing, motion ou opacidade quando houver token.
4. Android segue Material 3 e Material Symbols. iOS usa componentes nativos e SF Symbols. Web usa layout responsivo, foco visível e navegação por teclado.
5. Antes de criar um controle, procure na biblioteca da plataforma. Componentes próprios do IpêBook existem para domínio do produto, como Status Badge, Book Card e Empty State.
6. Preserve a semântica de **Venda**, **Troca**, **Doação**, **Reservado** e **Concluído**. Preço em BRL aparece em venda; doação indica gratuidade; troca explicita condições.
7. Reutilize os patterns documentados: descobrir livro, publicar anúncio, combinar encontro e concluir negociação.
8. Use português do Brasil. Dados de exemplo, vendedores, avaliações, disponibilidade, preços e bairros não devem ser apresentados como dados reais sem fonte.
9. Garanta alvo interativo mínimo de 48 × 48 px, rótulos acessíveis para ícones, foco visível na Web, ordem de leitura coerente, texto ampliável e estados que não dependam apenas de cor.
10. Respeite preferência por movimento reduzido. Use `motion.*` para durações e easing globais.
11. Ao alterar um padrão visual global, atualize Figma, tokens e documentação no mesmo fluxo e registre divergências no PR.
12. Antes de concluir, verifique celular e Web, além de loading, vazio, erro, offline, disabled e focus quando aplicáveis.

## Regra para IA

Não invente uma nova cor, medida, radius, família de ícones ou componente equivalente apenas para resolver uma tela isolada. Primeiro procure o token, componente ou pattern existente. Se houver uma lacuna real, documente a necessidade antes de criar um novo padrão.

A documentação do repositório não substitui a inspeção do quadro correspondente quando a tarefa depende de detalhes visuais da tela.
