# Plano

A primeira versão (PR #84) mudava o pedido e o anúncio em duas gravações feitas pelo app. Isso tinha três problemas, confirmados lendo as políticas de RLS:

1. A política de `update` de `book_requests` deixava quem pediu gravar qualquer situação, inclusive `accepted` no próprio pedido.
2. Quem pediu não consegue alterar `listings` (só o dono pode). Cancelar um pedido aceito falhava antes de mudar o pedido, e o livro ficava Reservado.
3. As duas gravações não eram atômicas: se a segunda falhasse, o anúncio e o pedido ficavam em situações diferentes.

A decisão está no [ADR 0018](../../docs/adr/0018-transicoes-da-negociacao-no-banco.md).

## Banco

- `supabase/migrations/20261002140000_negociacao_transicoes.sql`:
  - função `transition_book_request(request_id, next_status)`, `security definer`, que confere o papel de quem chama e muda o pedido e o anúncio na mesma transação;
  - remove a política de `update` de `book_requests`;
  - índice único parcial para um pedido ativo por pessoa e anúncio;
  - política de `insert` que exige anúncio disponível e de outra pessoa;
  - política de leitura de `listings` para quem pediu o livro;
  - gatilho que cria os avisos com `create_notification`.
- A migração do PR #84 passou de `20261002120000` para `20261002125000`, porque o mesmo horário já era da migração de notificações e o `supabase db push` usa o horário como versão.

## Model

- `BookRequestRepository.transitionRequest` substitui `updateRequestStatus`.
- `supabaseBookRequestRepository` chama a função por `rpc` e traduz `42501`, `P0002` e `invalid_transition`.
- `memoryBookRequestRepository` repete as regras da função (reserva, recusa dos outros pedidos, devolução ao cancelar) para os testes.
- `CatalogRepository.updateListingStatus` sai: o app não muda mais a situação do anúncio diretamente.

## ViewModel

- `useBookRequestDetailViewModel` confere a transição antes (resposta rápida), chama `transitionRequest` e recarrega o anúncio.

## Etapa 4 — Contraproposta

1. Revisar a implementação interrompida e reproduzir falhas com testes de regressão.
2. Corrigir as RPCs com `security definer`, autenticação explícita, `search_path`
   restrito e bloqueios de linha; manter a atualização direta protegida por RLS.
3. Alinhar memória, cliente Supabase e ViewModel ao contrato; apresentar os dois
   livros, impedir aceite original e manter erros de envio visíveis.
4. Reusar tema e componentes na folha (Android, iOS e Web); registrar adaptação do
   Figma em divergências.
5. Executar verificações locais e registrar evidências em `verify.md`. Aplicação
   no Supabase e ensaio com duas contas em aparelhos permanecem etapas separadas.
