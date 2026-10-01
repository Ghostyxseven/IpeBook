# Foundations — IpêBook

## Princípios

1. **Clareza antes de decoração.**
2. **Conteúdo é protagonista.**
3. **Nativo por plataforma.**
4. **Confiança no encontro presencial.**
5. **Acessibilidade por padrão.**

## Cores

Use os tokens em `design-tokens.json`. Não copie hexadecimais para componentes.

- Marca: `color.action`, `color.actionDeep`, `color.highlight`.
- Superfícies: `color.background`, `color.surface`, `color.soft`.
- Texto: `color.text`, `color.secondaryText`.
- Estados: `color.state.*`, `color.success`, `color.error`.
- Produto: `color.badge.sale`, `trade`, `donation`, `reserved`, `completed`.
- Capas ilustrativas (anúncio sem foto): `color.cover.blue`, `brown`, `green` e `color.cover.text`, vindas do Figma (quadros 02, 03 e 04).

Nunca comunique modalidade ou estado somente pela cor.

## Tipografia

Roboto é a família de marca. Componentes nativos podem usar a tipografia do sistema quando exigido pela plataforma.

Escala preferencial:

| Estilo        | Peso | Tamanho / entrelinha |
| ------------- | ---: | -------------------- |
| Display Large |  700 | 32 / 40 px           |
| Title Large   |  500 | 24 / 32 px           |
| Title Medium  |  700 | 16 / 24 px           |
| Body Large    |  400 | 16 / 24 px           |
| Body Medium   |  400 | 14 / 20 px           |
| Label Medium  |  500 | 12 / 16 px           |

Os caminhos legados `typography.caption/body/action/section/title` continuam disponíveis por compatibilidade. Novas interfaces devem preferir `typography.scale.*`.

## Spacing, radius e borda

Escala de spacing: 0, 4, 6, 8, 12, 16, 20, 24, 32, 48, 56 e 64 px.

- Raio global: `radius.small/medium/large/extraLarge/full`.
- Borda: `border.thin` e `border.strong`.
- Use borda e contraste de superfície antes de sombras pesadas.

## Layout

| Plataforma | Colunas | Gutter |              Referência |
| ---------- | ------: | -----: | ----------------------: |
| Android    |       4 |  16 px |                  393 px |
| iOS        |       4 |  16 px |                  393 px |
| Web        |      12 |  24 px | conteúdo máximo 1280 px |

As margens e alturas de controle específicas permanecem em `platform.*`.

## Motion

Durações globais:

- micro: 100 ms
- fast: 150 ms
- standard: 250 ms
- slow: 300 ms
- emphasized: 500 ms

Curvas ficam em `motion.easing.*`. Respeite `prefers-reduced-motion` na Web e preferências equivalentes nas plataformas nativas.

## Acessibilidade

- Alvo interativo mínimo: `accessibility.touchTarget` = 48 px.
- Foco Web: largura e offset definidos em `accessibility.focusWidth` e `focusOffset`.
- Não dependa só de cor.
- Permita ampliação de texto sem esconder ações críticas.
