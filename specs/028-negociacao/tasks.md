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

- [ ] Ponto de encontro com as telas próprias de cada modalidade (Figma 05, 15, 16 e 42).
- [ ] Propostas de troca e de retirada (Figma 17 e 18).
- [ ] Avaliar a troca ao concluir (Figma 62).
- [x] Telas da negociação conforme o Figma (06.01, 06.03 a 06.08, 06.11, 06.12, 06.17 e 06.18): Conversas, proposta recebida e enviada, combinar encontro com chips de dia e horário, encontro combinado, confirmações e retorno de cada etapa.
- [x] Falha ao aceitar, recusar, cancelar ou concluir aparece na tela (antes virava uma promessa rejeitada sem mensagem).
- [ ] Mostrar o nome de quem pediu para quem anunciou (o banco ainda não expõe esse nome; hoje a tela diz "quem pediu").
- [ ] Conferir no aparelho os dois lados da negociação com duas contas.
