# Verificação

Data: 02/10/2026 · Branch `feature/configuracoes-notificacoes`.

## Executado

| Verificação                          | Resultado                                       |
| ------------------------------------ | ----------------------------------------------- |
| `npm run typecheck`                  | sem erros                                       |
| `npm run lint`                       | sem erros                                       |
| `npm run format:check`               | sem erros                                       |
| `npm test`                           | 120 testes, 120 aprovados (31 novos desta spec) |
| `npx expo export --platform android` | bundle gerado                                   |
| `npx expo export --platform ios`     | bundle gerado                                   |

Cobertura dos testes novos:

- `notifications-model.test.mjs` (14): data relativa (agora, minutos, horas, dias, datas antigas, relógio adiantado, data inválida); rótulo acessível com "Não lida" em palavras; rótulo e texto do contador (singular, plural, "99+"); mensagens de erro; preferências padrão; repositório em memória (ordem, paginação sem repetir, não lidas, marcar uma e todas, preferências, `fail` uma vez); repositório do Supabase com cliente falso (sem configuração não simula dados, ordenação, cursor com aspas escapadas, contagem só das não lidas, atualização só de `read_at`, preferências completadas com "ligado", `upsert` de um tipo por vez, mapeamento de erros).
- `notifications-viewmodel.test.mjs` (17): paginação sem chamada dupla, vazio, erro com "tentar de novo", atualização que preserva a lista, falha ao carregar mais; marcar como lido imediato, confirmado no servidor, sem chamada repetida e revertido em caso de falha; marcar todas (reversão só do que a ação marcou, toque duplo ignorado); contador (primeiro plano, falha mantém o valor, resposta atrasada descartada, cancelamento da assinatura); configurações (carga, links legais com e sem endereço do site, gravar, reverter, erro de carga, independência entre tipos, Sair).

## Não verificado

- **Figma (quadro 35 e seção F):** o nó `193:651` continua "não encontrado" no arquivo anterior (`qSTmNLUhC6PwJlbyUmytbe`) pela ferramenta de leitura do Figma. O arquivo oficial passou a ser o `IpêBook Mobile` (`cxEisNRzOQR6krv8Ow7HCa`) em 02/10/2026, mas a ferramenta só enxerga as páginas 00 e 05, sem as telas Android (mesmo resultado da escrita da spec). A tela segue o design system do repositório e a spec; a comparação visual com o quadro continua pendente.
- **Migração SQL:** não há PostgreSQL nem projeto Supabase de desenvolvimento neste ambiente. `20261002120000_notificacoes.sql` foi escrita seguindo o padrão da migração do catálogo, mas **não foi executada**; aplicar no projeto da equipe e conferir tabelas, RLS e a função `create_notification`.
- **Aparelho e leitor de tela:** as telas não foram abertas em Android nem iOS; só os bundles nativos foram gerados. Estados vazio, erro, offline, alvos de 48 × 48 e leitura com TalkBack/VoiceOver seguem pendentes.
- **Avisos reais:** nenhum gatilho cria avisos até a negociação (#38) existir. Para testar, inserir linhas com `create_notification` pelo SQL Editor (ver `supabase/README.md`).

## Decisões durante a implementação

- O botão **Sair** temporário do Início foi movido para Configurações; o Início ganhou os ícones de Notificações (com contador) e Configurações até o Perfil existir (#37).
- Links da Política e dos Termos dependem de `EXPO_PUBLIC_SITE_URL`; sem o domínio definitivo (issue #43) eles ficam ocultos, em vez de apontar para um endereço inventado.
- O [ADR 0011](../../docs/adr/0011-entrega-de-notificacoes.md) segue **Proposto**: aceitar depende do Antonio e do Eric.
