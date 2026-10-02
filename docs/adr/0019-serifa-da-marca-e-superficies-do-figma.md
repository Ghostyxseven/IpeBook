# 0019 — Serifa da marca e superfícies do Figma nas telas do catálogo

Data: 02/10/2026

## Status

Proposto, implementado nas telas Início, Explorar, Detalhe do livro, Notificações e Configurações.

## Contexto

As telas do catálogo foram feitas antes de os quadros 02.01 a 07.13 do Figma (iOS, página 31:2; Android, página 0:1) ficarem prontos. Ao compará-las com o Figma, três diferenças apareceram:

- Os títulos da marca ("Encontre sua próxima história.", "O que vamos ler hoje?", o título do livro na capa e nos cards da lista) usam Source Serif 4 Bold. O app só tinha Roboto, e a [fundação de tipografia](../design-system/foundations.md#tipografia) deixava essa escolha para a equipe.
- O Figma usa os papéis de superfície do Material 3 (`on-surface`, `on-surface-variant`, `outline-variant` e os containers `lowest` a `high`) e o fundo tonal do chip selecionado. `design-tokens.json` não tinha esses papéis, e as telas usavam `text` e `secondaryText`.
- A capa ilustrativa tem lombada, moldura, autor, motivo (estrelas, ondas ou ipê) e título. O app desenhava só um retângulo com um círculo.

## Decisão

1. **Serifa só na marca.** Source Serif 4 Bold (licença OFL, arquivo em `assets/fonts/` com a licença ao lado) entra como `typography.brand` em `design-tokens.json`. O app a usa nos títulos de marca, no título do card da lista e na capa ilustrativa. A interface continua em Roboto no Android e na Web e na fonte do sistema no iOS. A fonte é carregada sem bloquear a abertura: até carregar, o título aparece na fonte do sistema.
2. **Papéis de superfície do Figma viram tokens.** Entram `onSurface`, `onSurfaceVariant`, `outlineVariant`, `container.lowest`, `container.low`, `container.default`, `container.high` e `selected.background`/`selected.text`, com os valores das variáveis do Figma. Os tokens antigos continuam valendo para as telas que ainda não foram revistas.
3. **Capa ilustrativa igual ao componente do Figma.** Os três motivos foram exportados do Figma como SVG (`assets/catalog/capa-motivo-*.svg`). Todas as medidas seguem a capa de 96 × 136 do Figma e escalam pela largura.
4. **Navegação com cinco destinos.** A barra ganha a aba Conversas, que mostra as negociações, como no Figma das duas plataformas.

## Consequências

- O pacote do app cresce cerca de 330 KB com a fonte.
- Ficam divergências conhecidas, registradas em [divergências](../design-system/divergencias.md#tipografia-e-superfícies-02102026): o título de seção 22/28 do Figma contra o `titleLarge` 24/32 dos tokens, e o raio 12 do card do carrossel contra `radius.medium` 14.
- Itens do Figma sem dado real no app ficaram de fora: o seletor de bairro ("Centro"), as distâncias, favoritos, compartilhar e a nota de quem anuncia. A seção "Perto de você" virou "Recém-chegados", porque o app não conhece a localização da pessoa.
- A Web continua só institucional ([ADR 0004](0004-pagina-institucional-web.md) e [ADR 0005](0005-navegacao-expo-router.md)); estas telas não aparecem nela.
