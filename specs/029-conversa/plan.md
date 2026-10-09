# Plano — 029 Conversa da negociação

## Dados

Tabela `request_messages` (migração `20261003120000_mensagens_da_negociacao.sql`), ligada a `book_requests`. A decisão está no [ADR 0021](../../docs/adr/0021-mensagens-por-negociacao.md).

## Camadas

| Camada    | Arquivos                                                                                                                            |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Model     | `RequestMessage`, `MessageError`, `MessageRepository`, `messageFormat`, repositórios em memória e Supabase                          |
| ViewModel | `useConversationViewModel`, `describeConversations` (usado por `useBookRequestListViewModel`)                                       |
| Factory   | `factories/messages.ts` (`useConversation`); `factories/bookRequest.ts` passa o repositório de mensagens à lista                    |
| View      | `ConversationScreen`, rota `negociacoes/[id]/conversa`, linhas novas em `BookRequestListScreen`, botão em `BookRequestDetailScreen` |

## Atualização

Sem Realtime nesta etapa: a tela aberta busca mensagens a cada 10 segundos e ao voltar para ela. A lista de Conversas recarrega ao ganhar foco.

## Dependências

Usa a `TopAppBar` criada na spec 027 (PR #96).
