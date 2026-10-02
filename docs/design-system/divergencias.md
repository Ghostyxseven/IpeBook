# Divergências entre `design-tokens.json` e a referência do design system

Comparação de `design-tokens.json` (raiz, usado pelo app) com [`referencia/tokens.json`](referencia/tokens.json) (design system publicado). Nenhum token foi alterado: cada linha abaixo precisa de uma decisão sobre qual lado é a fonte da verdade, e o outro deve ser atualizado junto com Figma e documentação.

## Uso no app

`src/view/theme/nativeTheme.ts` e `src/view/styles/theme.ts` leem `design-tokens.json`. Não há hex fixo fora da pasta de tema em `src/`, então corrigir um valor no JSON basta para o app inteiro.

## Cores com valores diferentes

| Papel              | `design-tokens.json`                  | `referencia/tokens.json` (claro)   |
| ------------------ | ------------------------------------- | ---------------------------------- |
| Ação principal     | `action` `#426B55`                    | `primary` `#2C5E45`                |
| Superfície         | `surface` `#FCFAF6`                   | `surface` `#FCFAF5`                |
| Erro               | `error` `#B3382C`                     | `error` `#B3261E`                  |
| Tag Venda (fundo)  | `badge.sale.background` `#E7F0EA`     | `secondary-container` `#DCE8DE`    |
| Tag Venda (texto)  | `badge.sale.text` `#2F503D`           | `on-secondary-container` `#18291F` |
| Tag Troca (fundo)  | `badge.trade.background` `#F4B942`    | `tertiary-container` `#F8D88A`     |
| Tag Troca (texto)  | `badge.trade.text` `#3C302A`          | `on-tertiary-container` `#3A2A10`  |
| Tag Doação (fundo) | `badge.donation.background` `#F2E3DA` | `doacao-container` `#F4DDD3`       |
| Tag Doação (texto) | `badge.donation.text` `#7A4430`       | `on-doacao-container` `#6E3A28`    |
| Capa verde         | `cover.green` `#33584D`               | `cover-forest` `#30574A`           |

Iguais nos dois: `cover.blue`/`cover-navy` `#253C4F` e `cover.brown`/`cover-brown` `#633E36`.

## Raios

| Uso          | `design-tokens.json` | Referência                             |
| ------------ | -------------------- | -------------------------------------- |
| Pequeno      | `small` 8px          | `radius-sm` 8px (igual)                |
| Médio        | `medium` 14px        | `radius-md` 12px                       |
| Grande       | `large` 18px         | `radius-lg` 16px                       |
| Extra grande | `extraLarge` 24px    | `radius-xxl` 28px (`radius-xl` é 20px) |

## Espaçamento

Todos os valores de `design-tokens.json` existem na referência (4, 8, 12, 16, 20, 24, 32, 48, 64), exceto `6px` e `56px`, que só existem na raiz. A referência acrescenta `2px`, `40px` e `80px` (margem lateral da Web).

## Só existe na referência

Tema escuro (todas as cores têm par `dark`), papéis M3 (`primary-container`, `outline-variant`, `surface-container-*`, `inverse-*`), cores do galho de ipê, tokens de iOS e Liquid Glass (`ios-*`, `glass-*`), `scrim`, sombras, breakpoints e estados.

## Só existe na raiz

Tags Reservado e Concluído, `landing`, `app`, `opacity`, `motion`, `accessibility` e `platform`.

## Componentes do Figma IpêBook-Mobile × tokens (01/10/2026, issue #9)

O arquivo [IpêBook-Mobile](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook-Mobile?node-id=0-1), página "05 · Componentes", usa as variáveis da referência. Os componentes `Button` e `TextField` foram ajustados à forma do Figma com os tokens atuais; seguem os valores que só mudam quando o token mudar:

| Item                             | Figma                                   | Token usado hoje                                                              |
| -------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------- |
| Altura do botão                  | 52 px (texto: 48 px)                    | `platform.*.controlHeight` (Android 56, iOS 52, Web 48); o de texto já usa 48 |
| Raio do campo                    | `radius-md` 12 px                       | `radius.medium` 14 px                                                         |
| Fundo do campo                   | `surface-container-low` `#F7F3EC`       | `color.surface` `#FCFAF6`                                                     |
| Borda do campo e do contornado   | `outline` `#7E776F`                     | `color.border` `#8F8478`                                                      |
| Cor do botão principal e do erro | `primary` `#2C5E45` e `error` `#B3261E` | ver "Cores com valores diferentes"                                            |
| Rótulo do botão                  | `m3-label-lg` 14/20, peso 500           | `typography.scale.labelLarge` (**adicionado**, mesmo valor)                   |

## Próximo passo

Decidir, por linha, se vale a raiz ou a referência. Se for a referência, atualizar `design-tokens.json`, conferir contraste (4,5:1 para texto) e checar as telas afetadas no mesmo PR.

## Padrões do app sem quadro no Figma (02/10/2026)

Itens criados pela spec [024](../../specs/024-configuracoes-notificacoes/spec.md) que não têm quadro no arquivo `IpêBook Mobile` visto até agora. Cada um usa só tokens e componentes existentes; precisam de uma decisão de design antes de virarem padrão.

| Item                                                            | Situação                                                                                                                                                                                                      |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sino de Notificações com contador no topo do Início             | Sem quadro. Contador em `radius.full`, fundo `color.error`, texto `labelMedium`, 16 px de altura mínima (`spacing.md`). O rótulo acessível diz "3 avisos não lidos". Provisório até o Perfil existir (#37).   |
| Engrenagem de Configurações no topo do Início                   | Sem quadro. Provisória: o acesso definitivo é pelo Perfil (#37).                                                                                                                                              |
| Tela de Configurações (chaves por tipo de aviso, versão e Sair) | Sem quadro visto (seção F do Figma não foi acessada). Usa a chave nativa (`Switch`) e o botão `danger`.                                                                                                       |
| Barra superior das telas de Notificações e Configurações        | A referência [`TopAppBar`](referencia/components/TopAppBar/README.md) tem 64 px e título `m3-title-lg`. O app usa o cabeçalho padrão do Expo Router com o título à esquerda; a altura ainda não foi igualada. |
