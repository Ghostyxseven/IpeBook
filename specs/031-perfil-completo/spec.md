# 031 — Perfil completo: avaliações, histórico, perfil de outras pessoas e ajuda

Responsável: Eric Vinícius dos Santos Oliveira. Issue #53 (extra), depois da #37.

## Objetivo

A spec 026 deu à pessoa um lugar seu. Esta dá à comunidade um jeito de se
reconhecer: quem é a pessoa do outro lado do anúncio, o que já aconteceu entre
vocês, e onde pedir ajuda quando algo sai do combinado.

É o que falta para alguém decidir se vai encontrar um desconhecido para trocar
um livro.

## Fluxos

| #   | Tela                   | Figma              | O que faz                                                                                                                                                                                                                             |
| --- | ---------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Perfil de outra pessoa | `19:21` (03.04)    | Abre pelo nome de quem anunciou, no detalhe do livro. Mostra avatar com as iniciais, o primeiro nome, "Perfil confirmado", "Histórico na comunidade" e "Encontre com segurança", e leva a **Conversar** e a **Denunciar ou bloquear** |
| 2   | Avaliações recebidas   | `145:2486` (07.03) | "Confiança que circula." — a média, quantas negociações concluídas, e as avaliações recentes com nome, nota e comentário                                                                                                              |
| 3   | Histórico              | seção 05 · Estante | As negociações concluídas de quem está na conta, com o livro, a modalidade e a data                                                                                                                                                   |
| 4   | Ajuda                  | `145:2702` (09.01) | "Vamos ajudar." — como funciona a troca, onde acontece a entrega, e o que fazer quando algo não sai como combinado                                                                                                                    |
| 5   | Meu perfil             | `25:524` (07.01)   | Ganha as entradas para Avaliações, Histórico e Ajuda                                                                                                                                                                                  |

## Avaliar

Quem avalia quem, e quando:

- **Só depois de concluir.** A avaliação nasce de uma negociação com situação
  `completed` — é a prova de que o encontro aconteceu.
- **Só os dois envolvidos**, e cada um avalia o outro uma única vez por
  negociação. Duas pessoas, duas avaliações possíveis, nunca mais.
- **Nota de 1 a 5 e um comentário opcional** de até 280 caracteres.
- **Não dá para apagar nem editar.** Uma reputação que a pessoa avaliada
  consegue limpar não é reputação. Comentário abusivo sai pela denúncia, que já
  existe (spec 027).

## O que o perfil de outra pessoa mostra, e o que ele nunca mostra

Mostra: primeiro nome, iniciais, desde quando está na comunidade, quantas
negociações concluiu, a média das avaliações e os comentários recebidos.

**Nunca mostra e-mail, telefone, bairro, sobrenome nem a lista de anúncios.** O
bairro só aparece no anúncio, que é onde ele serve para combinar a entrega.

## Números que não existem

Um perfil novo não tem média. A tela diz **"Ainda sem avaliações"** em vez de
mostrar "0,0 de 5" — um zero numa escala de 1 a 5 é uma nota, e uma nota péssima,
para quem nunca fez nada de errado. Mesma regra do `profileSummary` da spec 026.

## Aceite

- O nome de quem anunciou, no detalhe do livro, abre o perfil daquela pessoa.
- O perfil de outra pessoa mostra o que a lista acima permite, e nada além.
- Avaliações recebidas mostra média, total de concluídas e os comentários.
- Perfil sem avaliação nenhuma diz "Ainda sem avaliações", não "0 de 5".
- Histórico lista as negociações concluídas, mais recente primeiro, com o livro
  e a modalidade.
- A estante continua mostrando o que foi vendido, trocado e doado, com a situação
  por extenso.
- Ajuda mostra os três cartões do quadro 09.01 e leva às conversas.
- Só quem participou de uma negociação concluída consegue avaliar, uma vez só, e
  o banco recusa o resto — não só a tela.
- Estados: carregando, vazio, erro com "Tentar de novo", e offline.
- Alvos de 48 × 48, rótulos acessíveis, texto ampliável, nada que dependa só de
  cor.
- ViewModels testadas com repositório em memória.

## Fora do escopo

Responder a uma avaliação; nota por critério (pontualidade, conservação);
reputação que afeta a ordem do catálogo; editar o próprio nome ou foto;
mensagem direta fora da negociação.

## Dependências

- **Spec 026** (Meu perfil) — é onde as três entradas novas aparecem.
- **Spec 027** (denúncias e bloqueios) — o perfil de outra pessoa leva para lá.
- **Spec 028** (negociação) — a avaliação só existe depois de `completed`.
- Migração `20261007120000_avaliacoes_e_perfil_publico.sql` e ADR 0027.

## Referência de design

Figma `cxEisNRzOQR6krv8Ow7HCa`, seções **03**, **05**, **07** e **09**. Os
`node-id` da issue #53 apontam para o arquivo antigo, que hoje só tem a capa. O
mapa novo está em [`docs/figma-mapa.md`](../../docs/figma-mapa.md).
