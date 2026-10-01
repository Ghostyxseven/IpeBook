# Divergências entre `design-tokens.json` e a referência do design system

Comparação de `design-tokens.json` (raiz, usado pelo app) com [`referencia/tokens.json`](referencia/tokens.json) (design system publicado). Nenhum token foi alterado: cada linha abaixo precisa de uma decisão sobre qual lado é a fonte da verdade, e o outro deve ser atualizado junto com Figma e documentação.

## Uso no app

`src/view/theme/nativeTheme.ts` e `src/view/styles/theme.ts` leem `design-tokens.json`. Não há hex fixo fora da pasta de tema em `src/`, então corrigir um valor no JSON basta para o app inteiro.

## Cores com valores diferentes

| Papel | `design-tokens.json` | `referencia/tokens.json` (claro) |
| --- | --- | --- |
| Ação principal | `action` `#426B55` | `primary` `#2C5E45` |
| Superfície | `surface` `#FCFAF6` | `surface` `#FCFAF5` |
| Erro | `error` `#B3382C` | `error` `#B3261E` |
| Tag Venda (fundo) | `badge.sale.background` `#E7F0EA` | `secondary-container` `#DCE8DE` |
| Tag Venda (texto) | `badge.sale.text` `#2F503D` | `on-secondary-container` `#18291F` |
| Tag Troca (fundo) | `badge.trade.background` `#F4B942` | `tertiary-container` `#F8D88A` |
| Tag Troca (texto) | `badge.trade.text` `#3C302A` | `on-tertiary-container` `#3A2A10` |
| Tag Doação (fundo) | `badge.donation.background` `#F2E3DA` | `doacao-container` `#F4DDD3` |
| Tag Doação (texto) | `badge.donation.text` `#7A4430` | `on-doacao-container` `#6E3A28` |
| Capa verde | `cover.green` `#33584D` | `cover-forest` `#30574A` |

Iguais nos dois: `cover.blue`/`cover-navy` `#253C4F` e `cover.brown`/`cover-brown` `#633E36`.

## Raios

| Uso | `design-tokens.json` | Referência |
| --- | --- | --- |
| Pequeno | `small` 8px | `radius-sm` 8px (igual) |
| Médio | `medium` 14px | `radius-md` 12px |
| Grande | `large` 18px | `radius-lg` 16px |
| Extra grande | `extraLarge` 24px | `radius-xxl` 28px (`radius-xl` é 20px) |

## Espaçamento

Todos os valores de `design-tokens.json` existem na referência (4, 8, 12, 16, 20, 24, 32, 48, 64), exceto `6px` e `56px`, que só existem na raiz. A referência acrescenta `2px`, `40px` e `80px` (margem lateral da Web).

## Só existe na referência

Tema escuro (todas as cores têm par `dark`), papéis M3 (`primary-container`, `outline-variant`, `surface-container-*`, `inverse-*`), cores do galho de ipê, tokens de iOS e Liquid Glass (`ios-*`, `glass-*`), `scrim`, sombras, breakpoints e estados.

## Só existe na raiz

Tags Reservado e Concluído, `landing`, `app`, `opacity`, `motion`, `accessibility` e `platform`.

## Próximo passo

Decidir, por linha, se vale a raiz ou a referência. Se for a referência, atualizar `design-tokens.json`, conferir contraste (4,5:1 para texto) e checar as telas afetadas no mesmo PR.
