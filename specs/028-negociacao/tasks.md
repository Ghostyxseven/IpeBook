# Tarefas

## Etapa 1 — negociação mínima (PR #84)

- [x] Entidade `BookRequest`, erros e regras de transição.
- [x] Repositórios em memória e Supabase, ViewModels, telas e rotas.
- [x] Migração `book_requests`.

## Etapa 2 — transições no banco (#54)

- [x] ADR 0018.
- [x] Migração `20261002140000_negociacao_transicoes.sql`.
- [x] `transitionRequest` no lugar de `updateRequestStatus`; remover `updateListingStatus` do catálogo.
- [x] Testes do repositório em memória e do repositório Supabase com cliente falso.
- [x] Migrações aplicadas num Postgres local com os esquemas `auth` e `storage` simulados, conferindo: pedido duplicado recusado, quem pediu não aceita o próprio pedido, atualização direta sem efeito, aceitar reserva e recusa os outros, cancelar devolve o livro, concluir mantém o anúncio visível para quem pediu, avisos criados.
- [ ] Aplicar as migrações `book_requests`, segurança e transições no Supabase da equipe.
- [ ] Conferir no aparelho (Android e iPhone) com duas contas e registrar no `verify.md`.

## Etapa 3 — negociação completa (#54)

- [x] Propor troca: escolher um livro seu para oferecer (Figma 03.05), com a migração `20261003130000_negociacao_completa.sql` e o ADR 0022.
- [x] Reagendar encontro (Figma 06.13 e 06.14) e Não comparecimento (06.15).
- [ ] Contraproposta (Figma 06.19 e 06.20).
- [x] Avaliar a troca ao concluir (o Figma atual não tem o quadro; 07.03 só lista avaliações recebidas). O fim da negociação oferece a avaliação na própria tela, reusando o formulário do Histórico (`RatingForm`) e as regras do ADR 0027: uma por negociação, e nenhuma quando a conta da outra pessoa saiu.
- [x] Telas da negociação conforme o Figma (06.01, 06.03 a 06.08, 06.11, 06.12, 06.17 e 06.18): Conversas, proposta recebida e enviada, combinar encontro com chips de dia e horário, encontro combinado, confirmações e retorno de cada etapa.
- [x] Falha ao aceitar, recusar, cancelar ou concluir aparece na tela (antes virava uma promessa rejeitada sem mensagem).
- [x] Mostrar o nome de quem pediu para quem anunciou (função `listing_owner_first_name`).
- [ ] Aplicar a migração `20261003130000_negociacao_completa.sql` no Supabase (precisa do ok do responsável).
- [ ] Conferir no aparelho os dois lados da negociação com duas contas.
