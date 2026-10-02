# 024 — Configurações e notificações

Responsável: Micael Cardoso Reis (ver `docs/DIVISAO_FEATURES.md`). Extra do trabalho final: só depois das etapas obrigatórias (issue #29).

## Objetivo

Dar à pessoa autenticada um lugar para ver avisos sobre o que acontece com os seus anúncios e pedidos (Notificações, Figma 35, seção F) e para ajustar preferências gerais do aplicativo (Configurações). Android e iOS; a Web continua só institucional (ADR 0005).

## Situação do Figma

O arquivo oficial passou a ser o `IpêBook Mobile` (`cxEisNRzOQR6krv8Ow7HCa`, 02/10/2026). A ferramenta de leitura só enxerga as páginas 00 e 05, então a tela de Notificações foi comparada por uma captura enviada pelo Micael. Pelo quadro Android:

- barra superior com seta e o título "Notificações" à esquerda;
- lista agrupada em **Hoje** e **Esta semana**, em linhas planas sem borda;
- cada linha tem ícone do tipo à esquerda, título, subtítulo "detalhe · hora" (por exemplo "10h", "Seg", "Dom") e seta à direita;
- o quadro não mostra marca de "não lida", ação "Marcar todas como lidas" nem estado vazio.

**Divergências deliberadas:** (1) aviso não lido tem o título em negrito e é anunciado como "Não lida", exigência de acessibilidade desta spec (a cor não pode ser o único sinal); (2) a ação "Marcar todas como lidas" fica como botão de texto acima da lista, porque os critérios de aceite a pedem; (3) o estado vazio, de erro e de carregamento seguem os componentes do design system.

**Fora do escopo por ora:** o quadro mostra avisos de mensagem, de avaliação e de livro desejado. Eles dependem das features de conversa (#39), de perfil (#53) e de alerta de desejo (#27) e não existem como tipo de aviso aqui.

## Fluxos

1. **Notificações:** lista agrupada em Hoje, Esta semana e Anteriores, com os avisos mais recentes primeiro; cada linha tem o ícone do tipo, título, "texto curto · hora", seta e título em negrito quando não lida. Tocar abre o destino (por exemplo, o anúncio) e marca como lida. Ação "Marcar todas como lidas". Estado vazio: "Nenhum aviso por enquanto."
2. **Origem dos avisos:** os eventos vêm da negociação (feature do Antonio, issue #38): pedido recebido, pedido aceito ou recusado, livro reservado e negociação concluída. Sem a negociação não há o que avisar; por isso a tela só ganha conteúdo depois da #38. Até lá, a lista aparece vazia.
3. **Configurações:** acessadas pelo Perfil (feature do Eric); até o Perfil existir, o Início mostra os ícones de Notificações (com contador) e de Configurações, e o Sair que ficava ali passou para Configurações. Itens: ligar ou desligar cada tipo de aviso, ver a versão do aplicativo, abrir os documentos legais (Privacidade e Termos, por endereço da Web; só aparecem com `EXPO_PUBLIC_SITE_URL` definido) e Sair. Excluir conta é da issue #47.
4. **Entrega:** decidida no [ADR 0011](../../docs/adr/0011-entrega-de-notificacoes.md): lista dentro do aplicativo alimentada pelo Supabase. Notificação push fica fora desta spec.

## Aceite

- A lista mostra só avisos da própria pessoa, do mais novo para o mais antigo, com paginação.
- Avisos não lidos têm marca visual **e** texto acessível ("não lida"); a cor não é o único sinal.
- Marcar como lida é imediato na tela e confirmado no servidor; em caso de falha, volta ao estado anterior e mostra mensagem.
- O número de não lidas aparece no ícone de acesso, com rótulo acessível ("3 avisos não lidos").
- Preferências ficam guardadas por pessoa; desligar um tipo impede a criação de novos avisos desse tipo, sem apagar os antigos.
- Estados: carregando, vazio, erro com "Tentar de novo", sem conexão (banner existente) e sem Supabase configurado.
- Alvos de 48 × 48, rótulos em ícones, títulos como cabeçalho, texto ampliável, movimento reduzido respeitado, português do Brasil, sem dados de exemplo apresentados como reais.
- Model e ViewModels testados com repositório em memória; consultas do Supabase testadas com cliente falso.

## Fora do escopo

Notificação push e e-mail; conversa e mensagens (issue #39); denúncia e bloqueio (#40); tema escuro e idioma; excluir conta (#47); qualquer evento que dependa de funcionalidades ainda inexistentes.

## Dependências

- Negociação mínima (#38, Antonio) para gerar os avisos.
- Aba ou tela de Perfil (#37, Eric) para abrir Configurações.
- ADR 0011 aceito.
- RLS: cada pessoa lê e marca como lida só os próprios avisos.
