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

## Acesso — comparação com o Figma 06 · Android e 07 · iPhone (07/10/2026)

Comparação das 17 telas do fluxo "01 · Acesso" nas páginas `06 · Android` e `07 · iPhone` (01.01 a 01.17) com `src/view/screens/auth`. O que ficou diferente do Figma, e por quê (decisão no [ADR 0028](../adr/0028-google-e-avisos-de-sucesso-no-acesso.md), salvo onde indicado):

| Item                                                    | Situação                                                                                                                                                                                                                                                           |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "Continuar com a Apple" (01.02, 01.03, 01.09 do iPhone) | Fora por enquanto: exige conta paga no Apple Developer Program e `Sign in with Apple` nativo. O Google (nos dois quadros) já entrou (ADR 0028).                                                                                                                    |
| Telas 01.02 "Entrar" (hub social, Android e iPhone)     | O app não tem uma tela à parte só com os botões de login social antes do formulário: o Login (01.10) já mostra e-mail e senha direto, com o Google acima.                                                                                                          |
| "Link" nas telas 01.04, 01.05, 01.08 e 01.12            | O app usa código por e-mail (OTP), decidido no [ADR 0006](../adr/0006-autenticacao-supabase.md). O texto dessas telas no Figma não foi atualizado para "código" depois dessa decisão.                                                                              |
| 01.14 "E-mail já cadastrado" e 01.16 "E-mail inválido"  | Não são telas à parte: o erro aparece no campo de e-mail. Depois do ADR 0028, o erro de e-mail já cadastrado também mostra o atalho "Recuperar senha".                                                                                                             |
| 01.09 e 01.13 como telas de sucesso (iPhone)            | Resolvido pelo ADR 0028 só no iPhone: o app leva direto para a tela seguinte (Início ou Seu bairro) com um aviso por cima. No Android e na Web, o quadro pede tela dedicada com cartão — o app manteve `EmailConfirmedScreen`/`PasswordUpdatedScreen` nesses dois. |
| "Explorar livros sem entrar" (01.01, só no Android)     | Não existe no app: o catálogo exige sessão em `(app)`. Sem decisão ainda (ADR 0028); mudaria a proteção de rotas.                                                                                                                                                  |

## Onde do Combinar encontro e ação do detalhe (07/10/2026)

Decidido com o Micael em 07/10/2026, pelos quadros 06.04 e 03.03 das duas plataformas.

| Item                                  | Situação                                                                                                                                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Locais do "Onde" (06.04)              | O app só tinha campo escrito. Entraram os atalhos de lugar público do quadro mais "Outro local", nas duas plataformas, e o campo continua aberto. O mesmo seletor vale no reagendamento. |
| Nomes dos locais sugeridos            | São atalhos de tipo de lugar, não endereços conferidos: o app não tem cadastro de pontos públicos. Quem combina confirma o ponto exato na conversa.                                      |
| Ação do detalhe (03.01 a 03.03)       | Era sempre "Combinar encontro". Agora diz o que a pessoa pede: "Quero receber" na doação, "Propor troca" na troca, "Combinar encontro" na venda. As três abrem a mesma tela.             |
| "Conversar" na doação (03.03, iPhone) | **Fora.** As mensagens só existem dentro de uma negociação aberta (ADR 0021); conversar antes disso seria recurso novo, com spec e banco. O Figma precisa tirar a ação ou abrir a spec.  |

## Liquid Glass no iPhone (07/10/2026)

Implementado pelo [ADR 0029](../adr/0029-liquid-glass-no-iphone.md), com os tokens da
referência (`glass-fill`, `glass-stroke`, `glass-fill-dark`, `glass-shadow`) copiados para
`design-tokens.json`. O que ficou diferente da receita, e por quê:

| Item               | Situação                                                                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Saturação de 180%  | **Não aplicada.** O `expo-blur` só expõe `intensity` e `tint`; não há como saturar o que está atrás. O desfoque e o preenchimento ficam fiéis.                 |
| Desfoque de 22 pt  | O `intensity` do `expo-blur` vai de 1 a 100 e não é medido em pontos. O token guarda os 22 pt e o componente os usa como intensidade — aproximação a conferir. |
| Onde o vidro entra | Barra de abas, por enquanto. Os botões circulares da barra superior e os controles sobre a capa ainda estão sólidos.                                           |
| Android e Web      | Sem vidro, como manda a referência. Não há token de vidro para essas plataformas, e um teste garante isso.                                                     |

## Selo da troca no detalhe (07/10/2026)

No detalhe do livro (03.01 a 03.03) o selo mostrava "Por outro livro" e o valor grande mostrava
"Troca" — o contrário do componente Tag do Figma, que é a "etiqueta de modalidade e status", e do
que os cards do catálogo já faziam. Corrigido: o selo diz sempre a modalidade escrita (Venda,
Troca, Doação) e o valor grande diz o valor ("R$ 25,00", "Por outro livro", "Gratuito"). O selo da
venda passou de "À venda" para "Venda", pelo mesmo motivo.

O quadro Android 03.02 desenha esse selo em verde; a cor certa é a amarela de Troca
(`tertiary-container`), que o app já usava. O Figma precisa ser corrigido.

## Filtrar livros nas duas plataformas (07/10/2026)

O quadro Android 02.03 (`149:2803`) e o do iPhone 02.03 (`192:2819`) ofereciam filtros diferentes: o
Android tinha modalidade, categoria e o rádio "Somente bom estado"; o iPhone acrescentava as quatro
conservações, preço máximo e distância. O app seguia o Android.

Decidido: **os filtros são os mesmos nas duas plataformas**, com a apresentação nativa de cada uma.
O quadro do iPhone é a referência por ser o mais completo, menos a distância.

| Item                                 | Situação                                                                                                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Conservação                          | Entrou nas duas, como chips de seleção múltipla. Usa as quatro conservações do banco (ADR 0008), não os rótulos de exemplo do Figma ("Com marcas", "Desgastado").          |
| Preço máximo                         | Entrou nas duas, com controle deslizante próprio (ADR 0013): de R$ 5 a R$ 200, de R$ 5 em R$ 5, e o fim da faixa significa "Qualquer preço".                               |
| Preço máximo em troca e doação       | O teto só corta anúncios de venda; troca e doação não guardam valor e continuam na lista. A tela avisa isso abaixo do controle.                                            |
| Distância (1 km, 3 km, 5 km, Cidade) | **Fora.** O app não conhece a localização de quem usa e o anúncio não guarda coordenadas: só bairro e cidade fixa (ADR 0020). Entrar exigiria migração e uma spec própria. |
| Rádio "Somente bom estado" (Android) | Saiu: virou a escolha de conservações, que cobre o mesmo caso e mais.                                                                                                      |

O Figma precisa ser atualizado junto: tirar "Distância" do quadro do iPhone e acrescentar
conservação e preço máximo ao do Android.

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

## Revisão geral das telas do iPhone contra o Figma (09/10/2026)

Comparação de 28 capturas reais de um iPhone — acesso, descoberta, catálogo, negociação,
conversa, perfil, configurações e telas de conta — com os quadros atuais da página
"07 · iPhone / iOS 26" do arquivo [IpêBook-Mobile](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook-Mobile).
Cinco achados eram bugs de implementação isolados e foram corrigidos no mesmo PR
([#118](https://github.com/Ghostyxseven/IpeBook/pull/118)); os demais são o Figma já
tendo avançado para um desenho que o app ainda não construiu — ficam registrados aqui
para virarem spec pelo Spec Kit, e não um patch visual avulso.

### Corrigido no PR #118

| Tela (quadro)                      | Correção                                                                                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Criar conta (01.03)                | Faltava o destaque amarelo no título ("e faça parte."); o `AuthLayout` já suportava o prop, só não era passado.                                                    |
| Conversa (06.02)                   | O botão de enviar mensagem definia o círculo mas nunca pintava o fundo; renderizava só o ícone solto.                                                              |
| Pessoas bloqueadas · vazio (07.12) | Texto fora do quadro atual e um botão "Voltar às configurações" que não existe ali — a seta do topo já volta.                                                      |
| Notificações · vazio (07.13)       | Texto fora do quadro atual; faltava o atalho "Ajustar notificações" para `/configuracoes`.                                                                         |
| Privacidade e dados                | Comentário no código apontava o quadro errado (07.09, que é só o diálogo de excluir conta) para a tela inteira, que é 07.07; copy do diálogo também desatualizada. |

### Precisa de spec nova — o Figma já avançou além do app

| Área                                                   | O que o Figma já tem, que o app ainda não                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Meu perfil (07.01)                                     | Cartão único com avatar + stats, seção "Favoritos" e tela "Editar perfil" — nenhum dos dois existe no código (spec 026/031 já registraram isso antes, e o quadro mudou de novo desde então).                                                                                                                                                                                         |
| Configurações (07.05)                                  | Notificações agrupadas em 4 chaves ("Novas propostas", "Mensagens", "Livros dos meus alertas", "Dicas") em vez das 5 granulares atuais; "Pessoas bloqueadas" e "Alterar senha" mudaram para dentro de "Segurança e verificação", no Perfil.                                                                                                                                          |
| Detalhe do livro — venda (03.01)                       | Cartão agrupado de 3 linhas (Conservação/Categoria/Retirada), dois botões no rodapé (Conversar / Tenho interesse) e ícones de compartilhar/favoritar no header. O app usa uma linha de texto e um botão único ("Combinar encontro").                                                                                                                                                 |
| Estante (05.01 a 05.06)                                | O quadro é do iPhone, mas a tela inteira (`MyShelfScreen.tsx`) ainda segue o layout Material 3 do Android (FAB estendido, abas M3, "Minha estante") — nunca ganhou variante nativa iOS, ao contrário de `TextField`, `Button`, `Checkbox` e `RadioListItem`.                                                                                                                         |
| Privacidade e dados (07.07)                            | Virou cartões "O que aparece no perfil", "Localização" e **"Baixar meus dados"** (exportação LGPD) com botão "Excluir conta" cheio no rodapé. O app ainda mostra a versão anterior (perfil público / dados de acesso privados / editar informações / excluir conta em linha).                                                                                                        |
| Ajuda (09.01)                                          | Virou 3 passos numerados (Anuncie/Combine/Encontre) + seção "Segurança" com 3 dicas. O app ainda é o FAQ de 3 perguntas e respostas.                                                                                                                                                                                                                                                 |
| Escolher bairro (11.01)                                | Virou bottom sheet ("Onde você está?") com lista fixa de bairros sobre a tela de Explorar. O app é uma tela cheia com campo de texto livre.                                                                                                                                                                                                                                          |
| Cancelar/Recusar encontro (06.11, 06.12, 06.17, 06.18) | Viraram diálogo modal curto (dois botões lado a lado) seguido de aviso inline dentro do próprio chat, ou toast flutuante (padrão `Snackbar` que o acesso já usa). O app ainda usa telas cheias dedicadas (`OutcomeHero`), compartilhadas por Android/iOS/Web.                                                                                                                        |
| Combinar encontro (06.04)                              | Trocou os chips de "Onde" por mapa com 6 miniaturas e lista de locais com endereço; "Dia"/"Horário" viraram linhas únicas com chevron. Os chips atuais têm justificativa de acessibilidade documentada em `PlacePicker.tsx` (sempre alimentam um campo de texto, para não deixar quem usa teclado/leitor de tela sem saída) — reconciliar exige decisão de design, não só de código. |
| Conversa — menu "•••"                                  | Novo no cabeçalho do chat, sem equivalente no app nem em nenhuma spec; precisa definir o que ele faria antes de implementar.                                                                                                                                                                                                                                                         |

**Histórico**: confirmado de novo que não existe quadro no Figma para essa tela (já registrado
acima, em "Perfil completo (spec 031)") — é tela que o time acrescentou além do kit original, não é bug.

**Risco de processo**: pelo menos três áreas desta revisão (Perfil, Privacidade, Negociação)
mostraram node-id do Figma que já "morreu" ou mudou de quadro desde a última vez que o código
foi conferido contra ele — algumas mais de uma vez. Vale um ADR ou uma rotina de reconferência
periódica para isso não virar surpresa de novo.
