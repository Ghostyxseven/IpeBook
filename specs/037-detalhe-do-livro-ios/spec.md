# 037 — Detalhe do livro: cartão agrupado e cabeçalho com ações

Issue relacionada: divergência registrada em `docs/design-system/divergencias.md`
(revisão do iPhone, 09/10/2026), quadro **03.01** do Figma.

## Objetivo

O Detalhe do livro (`ListingDetailScreen.tsx`) já mostra tudo o que existe, mas
numa única linha de texto corrida ("Bom estado · Autoajuda e religião") e com o
favoritar apertado ao lado do título. O Figma 03.01 agrupa essa informação num
cartão de três linhas e dá ao cabeçalho duas ações rápidas (compartilhar e
favoritar). Esta spec fecha essa distância visual sem mudar o que a tela faz.

## Fluxo

| Antes                                                                    | Depois                                                                                                                                                                 |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta`: uma linha "Bom estado · Autoajuda e religião"                    | Cartão com três linhas: **Conservação** (Bom estado), **Categoria** (Autoajuda e religião), **Retirada** (bairro/cidade do anúncio, igual ao `locationLabel` já usado) |
| Favoritar ao lado do título, só quando a pessoa está logada e não é dona | Favoritar e **Compartilhar** juntos, perto do topo da tela (acima da capa, como um par de ações)                                                                       |

O compartilhar usa `Share.share`, igual ao que `PublishListingScreen.tsx` já faz
para o anúncio recém-publicado — mesma API, mesmo padrão de mensagem, sem lib
nova.

## Decisão: o botão "Conversar" fica de fora

O Figma 03.01 mostra dois botões no rodapé — "Conversar" e "Tenho interesse" —
em vez do botão único atual. "Tenho interesse" é o que a tela já faz
(`detailActionLabel`, que abre Combinar encontro/Propor troca): isso **não**
muda.

"Conversar" pressupõe abrir uma conversa com quem anunciou **antes** de existir
uma negociação (`book_requests`) — hoje `request_messages` sempre pertence a uma
negociação (spec 029, ADR 0021), não existe conversa solta. Criar esse caminho
exigiria decidir o que uma "conversa sem negociação" é no banco (uma negociação
rascunho? mensagens sem `request_id`?), o que é uma decisão de modelo de dados,
não um ajuste de layout.

**Por isso, "Conversar" fica fora desta spec.** Fica registrado como
continuação natural, numa spec própria, quando houver decisão de banco para
isso. Nada aqui bloqueia essa spec futura.

## Aceite

- O Detalhe mostra Conservação, Categoria e Retirada como três linhas de um
  cartão, não mais uma linha corrida. Testável lendo o texto de cada linha.
- Quando não há bairro/cidade no anúncio, a linha de Retirada não aparece (seguindo
  o que `locationLabel` já faz: `undefined` quando falta os dois).
- Compartilhar aparece sempre, para quem é dona do anúncio e para quem não é —
  inclusive sem estar logada. O favoritar continua só para quem está logada e
  não é dona (regra que já existia).
- Compartilhar abre a folha nativa de compartilhamento com título e o nome do
  livro; falha (dispositivo sem suporte) não quebra a tela — mesmo padrão de
  `.catch` do `PublishListingScreen`.
- O botão principal do rodapé continua exatamente como hoje (texto por
  modalidade, dono vê "Ver solicitações", visitante vê o texto de entrar).
- Alvos de toque de 48 × 48 nos dois ícones do cabeçalho.
- Testes do Model para a função que monta as três linhas do cartão.

## Fora do escopo

- Botão "Conversar" (ver decisão acima).
- Mudar a capa ilustrativa (`ListingCover`), que já segue o Figma 03.01
  (comentário em `ListingCover.tsx`).
- Variante iOS nativa de ícone de compartilhar (SF Symbol específico) além do
  que `AppIcon` já mapeia — se faltar o ícone, entra como ajuste pontual no
  `AppIcon`, não como spec nova.

## Dependências

- Nenhuma migração nova. Usa dados que `useListingDetail` já carrega.
- `AppIcon` precisa ter (ou ganhar) um ícone de compartilhar.

## Referência de design

Figma `cxEisNRzOQR6krv8Ow7HCa`, quadro 03.01 (ver
`docs/design-system/divergencias.md`, linha "Detalhe do livro — venda (03.01)").
