# 0016 — Cores do Figma como fonte da verdade

Data: 02/10/2026

## Status

Aceito.

## Contexto

`design-tokens.json` (usado pelo app) e a referência do design system (`docs/design-system/referencia/tokens.json`, a mesma do Figma oficial `cxEisNRzOQR6krv8Ow7HCa`) tinham valores diferentes para dez cores: ação principal, superfície, erro, fundo e texto das tags Venda, Troca e Doação e a capa verde. A diferença estava registrada em `docs/design-system/divergencias.md`, esperando uma decisão. Enquanto isso, toda tela implementada a partir do Figma saía com o verde e o vermelho do código, não os do desenho.

## Decisão

As cores da referência e do Figma passam a ser a fonte da verdade. Os dez valores de `design-tokens.json` foram trocados pelos da referência, e `state.focus` e `state.error` acompanham `action` e `error`.

Os tokens sem par direto na referência (`background`, `text`, `soft`, `border`, `highlight`, Reservado e Concluído) ficam como estão. Raios e espaçamento continuam em aberto em `divergencias.md`.

## Alternativas

- **Manter os valores do código e atualizar o Figma:** o Figma já tem cerca de 250 telas, modo escuro e componentes ligados às variáveis da referência. Mudar o desenho custaria muito mais que mudar 12 valores no JSON.
- **Decidir linha a linha:** as dez cores formam uma paleta coerente (papéis do Material 3); misturar as duas fontes quebraria os pares de fundo e texto.

## Consequências

- O app inteiro muda de cor de uma vez, porque `src/view/theme` lê só `design-tokens.json` e não há hex fixo fora do tema.
- O verde principal fica mais escuro (`#426B55` para `#2C5E45`) e o contraste melhora em todos os pares conferidos (o menor é 5,8:1, erro no fundo).
- A tag Troca deixa de usar o mesmo amarelo de Reservado (`#F4B942`); as duas passam a ser distinguíveis também pela cor, além do texto.
- Specs antigas (`specs/001`, `specs/003`, `specs/012`) citam os valores anteriores; elas descrevem o que foi feito na época e não foram reescritas.
