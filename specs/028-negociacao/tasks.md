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
- [x] Contraproposta (Figma 06.19 e 06.20). Coluna `counter_listing_id`, funções `counter_offer`, `answer_counter_offer` e `shelf_of_requester` (ADR 0030); a folha de escolha e a resposta ficam na tela da negociação.
- [ ] Avaliar a troca ao concluir (o Figma atual não tem o quadro; 07.03 só lista avaliações recebidas).
- [x] Telas da negociação conforme o Figma (06.01, 06.03 a 06.08, 06.11, 06.12, 06.17 e 06.18): Conversas, proposta recebida e enviada, combinar encontro com chips de dia e horário, encontro combinado, confirmações e retorno de cada etapa.
- [x] Falha ao aceitar, recusar, cancelar ou concluir aparece na tela (antes virava uma promessa rejeitada sem mensagem).
- [x] Mostrar o nome de quem pediu para quem anunciou (função `listing_owner_first_name`).
- [ ] Aplicar a migração `20261003130000_negociacao_completa.sql` no Supabase (precisa do ok do responsável).
- [ ] Aplicar a migração `20261007130000_contraproposta.sql` no Supabase (precisa do ok do responsável).
- [ ] Conferir no aparelho os dois lados da negociação com duas contas.

## Retomada da contraproposta — 07/10/2026

- [x] Reconferir quadros 06.19 (`423:24276`) e 06.20 (`423:24520`) no Figma.
- [x] Corrigir reserva dos dois livros, recusa de concorrentes, identificação do livro
      pedido e bloqueio da proposta original enquanto aguarda resposta.
- [x] Corrigir autenticação/permissões das RPCs e impedir contraproposta forjada no insert.
- [x] Reproduzir cinco regressões antes da correção e validar os 24 testes do fluxo.
- [x] Executar 24 verificações SQL com RLS e todas as dependências da contraproposta.
- [x] Conferir modal na Web em 375 × 812 e 1280 × 800, foco, seleção por teclado,
      botão desabilitado, erro visível, fechamento, vazio e falha de carga.
- [ ] Validar fluxo integrado com duas contas em Android e iPhone.
- [ ] Resolver em entrega própria o erro preexistente da migração de avaliações
      (`can_rate`, parâmetro `author` confundido com coluna), antes de aplicar toda a cadeia.

Comandos, resultados e limites: [verify.md](verify.md).
