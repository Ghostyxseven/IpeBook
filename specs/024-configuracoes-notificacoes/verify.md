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

## Comparação com o Figma (02/10/2026)

Feita por uma captura do quadro Android de Notificações enviada pelo Micael, porque a ferramenta de leitura só enxerga as páginas 00 e 05 do arquivo `IpêBook Mobile`. A seção F e o quadro do iPhone não foram vistos.

| Item do quadro                                                 | Situação                                                                                                          |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Barra superior com seta e título "Notificações" à esquerda     | feito (cabeçalho da rota com o título, alinhado à esquerda)                                                       |
| Grupos "Hoje" e "Esta semana" (e "Anteriores" além de 7 dias)  | feito (`groupNotifications`, testado)                                                                             |
| Linha plana com ícone do tipo, título, "detalhe · hora" e seta | feito (`NotificationItem`)                                                                                        |
| Hora curta: "10h" hoje, "Seg" e "Dom" na semana                | feito (`notificationTimeLabel`, testado)                                                                          |
| Marca de "não lida" e "Marcar todas como lidas"                | **divergência deliberada**: título em negrito e rótulo "Não lida" (acessibilidade); botão de texto acima da lista |
| Avisos de mensagem, avaliação e livro desejado                 | fora do escopo: dependem das issues #39, #53 e #27                                                                |

Não conferi o resultado no aparelho: só os bundles Android e iOS foram gerados.

## Não verificado

- **Aparelho e leitor de tela:** as telas não foram abertas em Android nem iOS; só os bundles nativos foram gerados. Estados vazio, erro, offline, alvos de 48 × 48 e leitura com TalkBack/VoiceOver seguem pendentes.
- **Avisos reais:** nenhum gatilho cria avisos até a negociação (#38) existir. Para testar, inserir linhas com `create_notification` pelo SQL Editor (ver `supabase/README.md`).

## Decisões durante a implementação

- O botão **Sair** temporário do Início foi movido para Configurações; o Início ganhou os ícones de Notificações (com contador) e Configurações até o Perfil existir (#37).
- Links da Política e dos Termos dependem de `EXPO_PUBLIC_SITE_URL`; sem o domínio definitivo (issue #43) eles ficam ocultos, em vez de apontar para um endereço inventado.
- O [ADR 0011](../../docs/adr/0011-entrega-de-notificacoes.md) segue **Proposto**: aceitar depende do Antonio e do Eric.
