# 0018 — Transições da negociação no banco

Data: 02/10/2026

## Status

Proposto, implementado na [spec 028](../../specs/028-negociacao/spec.md) (issue #54).

## Contexto

A negociação mínima (#38, PR #84) criou a tabela `book_requests`. O app mudava a situação do pedido e, em seguida, a do anúncio (`reservado`, `concluido` ou de volta a `disponivel`), em duas gravações separadas. A regra de quem pode fazer cada mudança ficava só no app.

Lendo as políticas de RLS, apareceram três problemas:

- A política de `update` de `book_requests` deixava quem pediu gravar qualquer situação. Pela API do Supabase, essa pessoa conseguia aceitar o próprio pedido.
- O [ADR 0008](0008-modelo-de-anuncios-supabase.md) só deixa o dono alterar `listings`. Quando quem pediu cancelava um pedido aceito, a gravação do anúncio falhava e o livro ficava Reservado.
- Sem transação, uma falha entre as duas gravações deixava pedido e anúncio em situações diferentes.

Além disso, o [ADR 0011 de notificações](0011-entrega-de-notificacoes.md) espera que gatilhos da negociação criem os avisos.

## Decisão

Toda mudança de situação passa pela função `public.transition_book_request(request_id, next_status)`, `security definer`, chamada pelo app com `rpc`:

| De         | Para        | Quem pode                   | Efeito no anúncio                                   |
| ---------- | ----------- | --------------------------- | --------------------------------------------------- |
| `pending`  | `accepted`  | quem anunciou               | `reservado`; outros pedidos pendentes são recusados |
| `pending`  | `rejected`  | quem anunciou               | nenhum                                              |
| `pending`  | `canceled`  | quem pediu                  | nenhum                                              |
| `accepted` | `canceled`  | quem pediu ou quem anunciou | volta a `disponivel`                                |
| `accepted` | `completed` | quem anunciou               | `concluido`                                         |

A política de `update` de `book_requests` é removida. A função trava as duas linhas (`for update`) e grava as duas na mesma transação. Os erros usam `42501` (sem permissão), `P0002` (não encontrado) e a mensagem `invalid_transition`.

Também ficam no banco:

- Um pedido ativo (pendente ou aceito) por pessoa e anúncio, com índice único parcial.
- Pedido só para anúncio disponível de outra pessoa, na política de `insert`.
- Leitura do anúncio por quem já pediu o livro, para acompanhar depois de reservado ou concluído. Uma função `security definer` devolve os anúncios pedidos, para evitar recursão entre as políticas de `listings` e `book_requests`.
- Avisos de pedido recebido, aceito, recusado e concluído, criados por gatilho com `create_notification`.

## Alternativas

- **Manter as duas gravações no app e só restringir o RLS:** não resolve o cancelamento por quem pediu, nem a falta de transação.
- **Gatilho em `book_requests` que muda o anúncio:** resolve a atomicidade, mas a regra de quem pode fazer cada mudança continuaria espalhada entre política e gatilho.
- **Edge Function:** outro lugar para publicar e manter, sem ganho sobre uma função SQL para uma regra deste tamanho.

## Consequências

- O app não grava mais em `book_requests` com `update` nem em `listings` para a negociação. `CatalogRepository.updateListingStatus` foi removido.
- As regras de transição existem em dois lugares: no banco (que decide) e em `bookRequestTransitions.ts` (que só melhora a resposta da tela e alimenta o repositório em memória). Mudar uma exige mudar a outra.
- O dono ainda consegue alterar a situação do próprio anúncio pela política de `listings`. A tela de gestão (ADR 0014) não permite isso em `reservado` e `concluido`; travar no banco fica para quando houver necessidade.
- Cancelamento não gera aviso até `notifications.kind` ganhar esse tipo.
