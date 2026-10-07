# Divergências entre `design-tokens.json` e a referência do design system

Comparação de `design-tokens.json` (raiz, usado pelo app) com [`referencia/tokens.json`](referencia/tokens.json) (design system publicado). Nenhum token foi alterado: cada linha abaixo precisa de uma decisão sobre qual lado é a fonte da verdade, e o outro deve ser atualizado junto com Figma e documentação.

## Uso no app

`src/view/theme/nativeTheme.ts` e `src/view/styles/theme.ts` leem `design-tokens.json`. Não há hex fixo fora da pasta de tema em `src/`, então corrigir um valor no JSON basta para o app inteiro.

## Cores (decidido em 02/10/2026)

A referência e o Figma são a fonte da verdade para as cores ([ADR 0016](../adr/0016-cores-do-figma-como-fonte-da-verdade.md)). Os valores abaixo foram copiados para `design-tokens.json`:

| Papel              | Antes (`design-tokens.json`)          | Agora (igual à referência e ao Figma) |
| ------------------ | ------------------------------------- | ------------------------------------- |
| Ação principal     | `action` `#426B55`                    | `#2C5E45` (`primary`)                 |
| Superfície         | `surface` `#FCFAF6`                   | `#FCFAF5` (`surface`)                 |
| Erro               | `error` `#B3382C`                     | `#B3261E` (`error`)                   |
| Tag Venda (fundo)  | `badge.sale.background` `#E7F0EA`     | `#DCE8DE` (`secondary-container`)     |
| Tag Venda (texto)  | `badge.sale.text` `#2F503D`           | `#18291F` (`on-secondary-container`)  |
| Tag Troca (fundo)  | `badge.trade.background` `#F4B942`    | `#F8D88A` (`tertiary-container`)      |
| Tag Troca (texto)  | `badge.trade.text` `#3C302A`          | `#3A2A10` (`on-tertiary-container`)   |
| Tag Doação (fundo) | `badge.donation.background` `#F2E3DA` | `#F4DDD3` (`doacao-container`)        |
| Tag Doação (texto) | `badge.donation.text` `#7A4430`       | `#6E3A28` (`on-doacao-container`)     |
| Capa verde         | `cover.green` `#33584D`               | `#30574A` (`cover-forest`)            |

`state.focus` e `state.error` acompanham `action` e `error`. Os demais tokens de cor (`background`, `text`, `soft`, `border`, `highlight`, Reservado e Concluído) não têm par direto na referência e ficaram como estavam.

Contraste conferido (WCAG, texto normal pede 4,5:1): branco no botão 7,5:1; verde em superfície 7,2:1; erro em superfície 6,3:1; Venda 12,1:1; Troca 10,0:1; Doação 7,0:1.

Iguais nos dois desde antes: `cover.blue`/`cover-navy` `#253C4F` e `cover.brown`/`cover-brown` `#633E36`.

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
| Fundo do campo                   | `surface-container-low` `#F7F3EC`       | `color.surface` `#FCFAF5`                                                     |
| Borda do campo e do contornado   | `outline` `#7E776F`                     | `color.border` `#8F8478`                                                      |
| Cor do botão principal e do erro | `primary` `#2C5E45` e `error` `#B3261E` | `color.action` e `color.error` (iguais desde 02/10/2026)                      |
| Rótulo do botão                  | `m3-label-lg` 14/20, peso 500           | `typography.scale.labelLarge` (**adicionado**, mesmo valor)                   |

## Tipografia e superfícies (02/10/2026)

Decidido no [ADR 0019](../adr/0019-serifa-da-marca-e-superficies-do-figma.md): Source Serif 4 Bold nos títulos de marca (`typography.brand`) e os papéis de superfície do Material 3 em `design-tokens.json` (`onSurface`, `onSurfaceVariant`, `outlineVariant`, `container.*`, `selected.*`). Ainda divergem:

| Item                          | Figma                         | App hoje                                                |
| ----------------------------- | ----------------------------- | ------------------------------------------------------- |
| Título de seção do Início     | `m3-title-lg` 22/28, peso 400 | `titleLarge` 24/32 com tamanho e peso ajustados na tela |
| Raio do card do carrossel     | 12 px                         | `radius.medium` 14 px                                   |
| Seletor de bairro, distâncias | No topo e nos cards           | Fora: o app não conhece a localização da pessoa         |
| Favoritar e compartilhar      | Nos cards e no Detalhe        | Fora: o recurso não existe                              |

## Anunciar livro (03/10/2026)

Refeito pelos quadros Android 04.01, 04.04, 04.05 e 04.07. O que ficou diferente do Figma, e por quê:

| Item                                           | Situação                                                                                                                               |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| "Ler ISBN com a câmera" (04.01 a 04.03)        | O app não lê ISBN; título e autor são digitados. A linha e o "ou" não aparecem.                                                        |
| Até 3 fotos: Lombada e Páginas (04.04)         | O anúncio guarda uma foto só; a etapa mostra a capa e o botão para escolher. Os botões dizem "Usar esta foto" ou "Continuar sem foto". |
| "Salvar rascunho" (04.05)                      | O app não salva rascunho; fica só "Publicar anúncio".                                                                                  |
| Opções de Conservação e Categoria (04.05)      | O Figma mostra exemplos; o app usa as quatro conservações e as oito categorias que o banco aceita.                                     |
| Revise o anúncio (04.06)                       | Não há etapa de revisão; a publicação sai da etapa 3, como no 04.05.                                                                   |
| Coração na prévia do anúncio publicado (04.07) | O app não tem favoritos; não aparece. A segunda linha mostra o autor.                                                                  |
| Doação na etapa 1 (04.01)                      | Na doação, a nota da etapa 1 avisa que é gratuita, porque não há campo de preço.                                                       |

## Próximo passo

As cores já seguem a referência. Falta decidir raios e espaçamento, por linha, se vale a raiz ou a referência. Se for a referência, atualizar `design-tokens.json`, conferir contraste (4,5:1 para texto) e checar as telas afetadas no mesmo PR.

## Negociação completa (03/10/2026)

Feito pelos quadros Android 03.05, 06.13, 06.14 e 06.15. O que ficou diferente do Figma, e por quê:

| Item                                                    | Situação                                                                                        |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| "Na sua estante" como origem do livro oferecido (03.05) | Só anúncios publicados e disponíveis entram; o app não tem estante de livros fora dos anúncios. |
| "Oferecer outro livro" (03.05)                          | Abre Anunciar livro; depois de publicar, o livro aparece na lista.                              |
| Campos de data e horário no reagendamento (06.13)       | Usa os chips de dia e horário do Combinar encontro (06.04), que já evitam data inválida.        |
| "Nova sugestão enviada. Aguarde a confirmação" (06.14)  | O novo horário vale na hora, sem confirmação; o título diz "Novo horário combinado."            |
| Aviso do reagendamento                                  | Não existe: o tipo de aviso não está no banco.                                                  |
| Contraproposta (06.19 e 06.20)                          | Ainda não feita.                                                                                |

## Conversa (03/10/2026)

Feito pelos quadros Android 06.01, 06.02, 06.09, 06.10 e 06.16. O que ficou diferente do Figma, e por quê:

| Item                                                             | Situação                                                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Mensagem chegando na hora                                        | Sem Realtime nesta etapa; a conversa aberta busca mensagens a cada 10 segundos.                  |
| Tela própria de "Mensagem não enviada" (06.10)                   | O aviso aparece acima do campo e o texto continua nele para tentar de novo.                      |
| Aviso de mensagem nova em Notificações                           | Não existe ainda; fica para depois do Realtime.                                                  |
| Chip de modalidade e botão "Combinar" no cartão do livro (06.02) | O cartão usa o Status Badge e o botão "Negociação", que abre o pedido com local, data e horário. |
| Foto de perfil no avatar (06.01)                                 | O app não tem foto de perfil; o avatar mostra as iniciais.                                       |
| Negociação encerrada                                             | Sem quadro; a conversa fica só para leitura, com um aviso no lugar do campo.                     |

## Padrões do app sem quadro no Figma (02/10/2026)

Itens criados pela spec [024](../../specs/024-configuracoes-notificacoes/spec.md) que não têm quadro no arquivo `IpêBook Mobile` visto até agora. Cada um usa só tokens e componentes existentes; precisam de uma decisão de design antes de virarem padrão.

| Item                                                            | Situação                                                                                                                                                                                                                |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sino de Notificações com contador no topo do Início             | Sem quadro. Contador em `radius.full`, fundo `color.error`, texto `labelMedium`, 16 px de altura mínima (`spacing.md`). O rótulo acessível diz "3 avisos não lidos". No topo do Início, como no Figma 02.01 (ADR 0019). |
| Engrenagem de Configurações no topo do Início                   | Sem quadro. Provisória: o acesso definitivo é pelo Perfil (#37).                                                                                                                                                        |
| Tela de Configurações (chaves por tipo de aviso, versão e Sair) | Sem quadro visto (seção F do Figma não foi acessada). Usa a chave nativa (`Switch`) e o botão `danger`.                                                                                                                 |
| Barra superior das telas de Notificações e Configurações        | A referência [`TopAppBar`](referencia/components/TopAppBar/README.md) tem 64 px e título `m3-title-lg`. O app usa o cabeçalho padrão do Expo Router com o título à esquerda; a altura ainda não foi igualada.           |

## Denunciar e bloquear (03/10/2026)

Refeito pelos quadros Android 09.02, 09.03, 09.04 e 07.10 a 07.12. O que ficou diferente do Figma, e por quê:

| Item                                                                   | Situação                                                                                                  |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Diálogo de bloqueio sobre o Perfil público (09.02)                     | O app não tem perfil público; o diálogo abre no detalhe do livro e na denúncia enviada.                   |
| "Ela não poderá enviar mensagens nem propostas" (09.02, 07.10 e 07.11) | O banco só esconde os anúncios da pessoa bloqueada no catálogo de quem bloqueou; os textos dizem só isso. |
| "A equipe analisa em até 24 horas" (09.03)                             | Não há prazo combinado de moderação; o texto diz que cada relato é analisado.                             |
| Linha da pessoa com seta (07.10)                                       | Sem perfil público para abrir; a linha não tem seta.                                                      |
| "Voltar à segurança" (07.12)                                           | A lista abre por Configurações; o botão diz "Voltar às configurações".                                    |
| Tela "Segurança e verificação" (07.06)                                 | É da feature de Perfil; a entrada fica em Configurações, em "Pessoas bloqueadas".                         |

## Minha estante (03/10/2026)

Refeita pelos quadros Android 05.01 a 05.06. O que ficou diferente do Figma, e por quê:

| Item                                               | Situação                                                                                                                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Rascunhos" no fim da lista (05.01)                | O app não salva rascunho de anúncio; a linha não aparece.                                                                                                                 |
| Menu de três pontos na barra superior (05.01)      | Sem ações para ele no app; não aparece.                                                                                                                                   |
| "Como funciona" na estante vazia (05.02)           | O app não tem essa página; fica só "Anunciar livro".                                                                                                                      |
| Nome de quem fez a proposta (05.03)                | O banco não expõe o nome de quem pediu; a linha diz "Nova solicitação de encontro" ou a situação.                                                                         |
| Telas 05.07 e 05.08 (depois de excluir ou recusar) | Não existem; a lista se atualiza no lugar.                                                                                                                                |
| Folha de opções ao tocar em um livro               | Sem quadro. Segue a folha inferior do M3: `container.low`, cantos `radius.extraLarge`, itens de 56 px. O véu usa preto a 32% (o valor do M3), porque não há token de véu. |
| Subtítulo de Concluídos                            | O Figma diz "trocas e doações"; o app diz "vendas, trocas e doações", porque venda também conclui.                                                                        |

## Explorar e Filtrar livros (03/10/2026)

Refeitos pelos quadros Android 02.02 a 02.04. Diferenças que ficaram:

| Item                                           | Situação                                                                                           |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Seletor de bairro ("Centro") no topo (02.02)   | O app não guarda o bairro de quem usa e atende só Piripiri (ADR 0020); fica só o botão de filtros. |
| Coração de favoritos nos cards (02.02 e 02.04) | O app não tem favoritos.                                                                           |
| Categorias dos chips                           | O Figma mostra "Ficção", "Não ficção" e "Infantil"; o app usa as categorias fixas do ADR 0008.     |
| "Mais recentes" em verde no resumo (02.04)     | A lista só tem essa ordem; o resumo diz a ordem ou os filtros, sem botão.                          |
| Lista compacta com filtro (02.04)              | O app mantém os cards do 02.02 também com filtro.                                                  |

## Visor da leitura de ISBN (spec 030, Figma 04.02 e 04.03)

O quadro usa `#1F2B25` no fundo do visor, `white` no texto sobre ele e
`rgba(20,24,22,0.5)` no véu que escurece o visor quando a folha "Livro
identificado" sobe. Nenhum dos três existia nos tokens, e nenhum papel do
Material 3 já definido serve: `inverseSurface` (`#322F2B`) é marrom e
`cover.green` (`#30574A`) é claro demais para funcionar como fundo de câmera.

Entraram como `color.scanner.surface`, `color.scanner.onSurface` e
`color.scanner.veil`. São de uso restrito a esta tela: é o único lugar do app
onde a interface fica por cima de imagem ao vivo, e é isso que exige um fundo
escuro próprio. Se outra tela precisar de superfície escura, o caminho é
discutir um papel de verdade, não reaproveitar estes.

## Perfil completo (spec 031, 07/10/2026)

**Telas sem quadro no Figma.** Duas telas desta spec não têm quadro:

- **Histórico** das negociações concluídas. A issue #53 pede "histórico de trocas
  e doações" e a seção 07 não tem quadro para ele.
- **Avaliar**, que vive dentro do histórico. Avaliar ao lado da negociação que
  acabou é o que evita pedir à pessoa que lembre qual foi.

As duas foram desenhadas com os componentes da biblioteca (cartão, chips de
escolha, campo e botões) e com os títulos de marca do mesmo tom das outras. Se a
equipe de design desenhar os quadros, vale reconferir.

**Textos ajustados ao produto:**

- 03.04 diz "Telefone confirmado"; o app diz **"E-mail confirmado"**. O IpêBook
  confirma por e-mail e nunca pede telefone (ADR 0020).
- 07.01 traz o número "4,8" direto; o app mostra **"—"** para quem ainda não tem
  nota. Um 0,0 numa escala de 1 a 5 é uma nota ruim dada a quem não fez nada.

## Gestão de anúncios × Figma (reconferência de 07/10/2026)

A comparação da spec 025 estava marcada como bloqueada desde 02/10/2026 por causa
dos links quebrados. Feita agora, apontou cinco divergências — a maior é a
ausência completa do fluxo de **rascunhos** (quadros 04.11 a 04.16). A lista está
em [`specs/025-anuncios-gestao/verify.md`](../../specs/025-anuncios-gestao/verify.md).
