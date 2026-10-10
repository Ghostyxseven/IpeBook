# ADR 0037 — Layout responsivo do aplicativo Web

**Data:** 10/10/2026

**Status:** Aceito

**Especificação:** [040 — Aplicativo Web responsivo](../../specs/040-web-responsiva/spec.md)

## Contexto

O app em `/app` reutiliza telas de celular. Em janelas largas, formulários e listas ficam em colunas de até 480 px e a navegação principal continua no rodapé. A referência Web do projeto já define classes de janela e padrões distintos para navegação e conteúdo.

## Decisão

Manter os mesmos Model e ViewModel das três plataformas. Na View, selecionar a composição pela largura da janela somente na Web: navegação inferior compacta, lateral na largura média e cabeçalho na larga. Conter a página em até 1280 px e distribuir listas e painéis por tipo de conteúdo. Formulários mantêm uma medida legível, mesmo quando a página usa duas colunas. Valores vêm de `design-tokens.json`.

## Alternativas consideradas

- Aumentar a largura de todas as telas existentes: cria linhas longas e não resolve navegação ou hierarquia.
- Criar um segundo aplicativo Web independente: duplica fluxos e regras já implementados.

## Consequências

As View compartilhadas passam a conter variações de composição, mas o domínio continua único. Mudanças de breakpoint exigem revisão nas telas afetadas. O comportamento nativo permanece isolado por plataforma. A inspeção do Figma Web e de telas renderizadas permanece necessária para comprovar paridade visual.
