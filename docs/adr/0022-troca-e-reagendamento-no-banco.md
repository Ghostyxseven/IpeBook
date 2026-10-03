# 0022 — Livro oferecido na troca e reagendamento no banco

Data: 03/10/2026

## Status

Proposto, implementado na etapa 3 da [spec 028](../../specs/028-negociacao/spec.md) (issue #54).

## Contexto

O Figma tem a tela Propor troca (03.05), em que quem pede escolhe um livro seu para oferecer, e as telas Reagendar encontro (06.13 e 06.14). O [ADR 0018](0018-transicoes-da-negociacao-no-banco.md) tirou do app a permissão de atualizar `book_requests`: toda mudança passa por função `security definer`. A troca e o reagendamento precisam seguir a mesma regra.

## Decisão

- **Livro oferecido:** coluna `book_requests.offered_listing_id`, opcional. A política de `insert` só aceita um anúncio `disponivel` de quem pede, diferente do livro pedido, e só quando o livro pedido é de troca.
- **Transições:** `transition_book_request` passa a mover o livro oferecido junto com o pedido. Aceitar reserva os dois e falha se o oferecido não estiver mais disponível; concluir conclui os dois; cancelar um encontro aceito devolve os dois a `disponivel`.
- **Leitura:** quem anunciou lê o livro oferecido mesmo depois de reservado ou concluído (função `offered_to_me_listing_ids` e política em `listings`, como `my_requested_listing_ids` no ADR 0018).
- **Reagendar:** função `reschedule_book_request(request_id, new_location, new_date, new_time)`. Qualquer um dos dois muda local, dia e horário enquanto a negociação está aceita. A mudança vale na hora, sem pedir confirmação ao outro lado.
- **Nome de quem pediu:** o app usa a função `listing_owner_first_name`, que já devolve o primeiro nome de qualquer pessoa, sem migração nova.

## Consequências

- Trocar só um livro por outro: não há oferta de vários livros nem de dinheiro junto.
- O mesmo livro pode ser oferecido em mais de um pedido; o primeiro aceito reserva o livro e os outros falham ao serem aceitos.
- O reagendamento não gera aviso: `notifications.kind` não tem esse tipo. A outra pessoa vê o novo horário ao abrir a negociação ou a conversa.
- Contraproposta (Figma 06.19 e 06.20) e avaliação ficam para depois; podem usar a mesma coluna e uma função nova.
