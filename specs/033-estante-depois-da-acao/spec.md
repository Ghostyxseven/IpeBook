# 033 — Estante: o que aparece depois da ação

Responsável: Eric Vinícius dos Santos Oliveira. Issue #37 (as telas que faltavam).

## Objetivo

Fechar a seção **05 · Estante**. A spec 026 entregou 05.01 a 05.06 e os conferiu
contra o Figma em 03/10/2026. Faltavam dois quadros, acrescentados depois: o que
a estante mostra **logo após uma exclusão** e o que ela mostra **quando uma
proposta é recusada**.

Os dois respondem à mesma pergunta — "o que aconteceu com o meu livro?" — num
momento em que a pessoa acabou de fazer algo irreversível ou de perder uma
negociação. É o pior momento para a tela ficar calada.

## Fluxos

| Quadro           | Tela                  | O que faz                                                                                                                                                                                          |
| ---------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 05.07 `403:7319` | Estante após exclusão | "Seus livros continuam a circular." · "«Livro» foi removido dos anúncios ativos." · o que sobrou, com a contagem · **Anunciar outro livro**, **Ver negociações concluídas**, **Voltar ao início**  |
| 05.08 `403:7361` | Proposta encerrada    | "Proposta encerrada." · "A proposta ficou registrada como recusada." · "Essa proposta não reserva o anúncio. Seu livro pode receber novas propostas." · **Ver meus anúncios**, **Abrir conversas** |

## Duas divergências, e por quê

**05.07 vira um aviso no topo da estante, não uma tela.** O quadro 04.21
("Anúncio excluído.") já ocupa o momento logo após excluir, e é dele que a pessoa
toca em "Ver minha estante". Repetir a mesma notícia numa segunda tela cheia
seria dizer duas vezes que o livro saiu. O aviso traz o texto do 05.07 — inclusive
a contagem do que restou — e some quando a pessoa confirma que leu.

**05.08 vira um bloco dentro da aba Propostas, não uma tela.** Para ser tela, a
recusa teria de navegar até aqui — e a recusa acontece na negociação, que é
feature de outra pessoa (specs 028 e 029). Mexer lá para servir uma tela minha
seria atravessar fronteira sem necessidade: a lista de propostas que a estante já
carrega contém as recusadas, e o bloco as mostra a partir do que já está em mãos.

**O nome de quem propôs não aparece.** O quadro diz "A proposta de Lucas…". A
lista de propostas carrega o pedido e o livro, não o nome de quem pediu; buscá-lo
exigiria uma chamada por proposta ao repositório da negociação. O texto ficou sem
o nome.

As três estão registradas em `docs/design-system/divergencias.md`.

## Aceite

- Excluir um anúncio e tocar em "Ver minha estante" mostra o aviso com o nome do
  livro removido e quantos sobraram.
- O aviso some ao ser confirmado e não volta na próxima visita.
- Uma proposta recusada aparece na aba Propostas dizendo que não reserva o livro.
- Sem proposta recusada, o bloco não aparece — nem vazio, nem com zero.
- Concordância de número em "1 anúncio restante" e "2 anúncios restantes".
- Alvos de 48 × 48, rótulos acessíveis, texto ampliável, aviso anunciado por
  leitor de tela quando aparece.

## Fora do escopo

Desfazer a exclusão; reabrir uma proposta recusada; avisar a outra pessoa.

## Dependências

- **Spec 026** — a estante e as abas.
- **Spec 032** — é de lá, do quadro 04.21, que se chega ao 05.07.

## Referência de design

Figma `cxEisNRzOQR6krv8Ow7HCa`, seção **05 · Estante** (`206:3600`). Mapa em
[`docs/figma-mapa.md`](../../docs/figma-mapa.md).
