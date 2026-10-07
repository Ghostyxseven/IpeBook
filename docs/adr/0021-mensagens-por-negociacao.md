# 0021 — Mensagens guardadas por negociação

Data: 03/10/2026

## Status

Proposto, implementado na [spec 029](../../specs/029-conversa/spec.md) (issue #39).

## Contexto

O Figma (seção 06) tem a aba Conversas e a conversa com quem anunciou o livro. O app já tinha a negociação (`book_requests`, [ADR 0018](0018-transicoes-da-negociacao-no-banco.md)), mas nenhum lugar para mensagens. Toda conversa do Figma é sobre um livro e acontece entre quem pediu e quem anunciou.

## Decisão

Cada mensagem pertence a uma negociação, na tabela `public.request_messages` (`request_id`, `sender_id`, `body`, `created_at`). Não existe tabela de conversas: a conversa é a negociação.

- **Leitura:** só quem pediu ou quem anunciou o livro (função `is_request_participant`, `security definer`, para não encadear as políticas de `listings` e `book_requests`).
- **Envio:** `sender_id` é sempre quem está logado, a pessoa participa da negociação e ela está pendente ou aceita (`is_request_open`).
- **Sem `update` nem `delete`:** a conversa é o histórico da negociação.
- O texto tem de 1 a 1.000 caracteres, checado no banco e no app.
- Sem Realtime nesta etapa: a tela aberta busca mensagens a cada 10 segundos.

## Consequências

- Uma pessoa que pediu o mesmo livro duas vezes (depois de cancelar) tem duas conversas, uma por pedido.
- Negociação encerrada mantém as mensagens para consulta, sem aceitar novas.
- Apagar o pedido apaga as mensagens (`on delete cascade`).
- O bloqueio (spec 027) continua só escondendo anúncios; não impede mensagens numa negociação já aberta.
- Realtime, aviso de mensagem nova e contador de não lidas ficam para depois e podem ser somados sem mudar a tabela.
