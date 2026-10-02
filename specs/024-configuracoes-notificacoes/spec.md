# 024 — Configurações e notificações

Responsável: Micael Cardoso Reis (ver `docs/DIVISAO_FEATURES.md`). Extra do trabalho final: só depois das etapas obrigatórias (issue #29).

## Objetivo

Dar à pessoa autenticada um lugar para ver avisos sobre o que acontece com os seus anúncios e pedidos (Notificações, Figma 35, seção F) e para ajustar preferências gerais do aplicativo (Configurações). Android e iOS; a Web continua só institucional (ADR 0005).

## Situação do Figma

A tela 35 (`node-id=193-651`) e a seção F (`380-2398`) **não foram inspecionadas**: o arquivo exposto à ferramenta mostrava só a página "00 · Capa" e o nó não foi encontrado. Esta spec usa o design system do repositório e o texto da issue #29. Antes de implementar a View, abrir o quadro 35 e registrar a comparação no `verify.md`; se o quadro divergir do que está aqui, atualizar esta spec primeiro.

## Fluxos

1. **Notificações:** lista com os avisos mais recentes primeiro, cada um com título, texto curto, data relativa e marca de "não lida". Tocar abre o destino (por exemplo, o anúncio) e marca como lida. Ação "Marcar todas como lidas". Estado vazio: "Nenhum aviso por enquanto."
2. **Origem dos avisos:** os eventos vêm da negociação (feature do Antonio, issue #38): pedido recebido, pedido aceito ou recusado, livro reservado e negociação concluída. Sem a negociação não há o que avisar; por isso a tela só ganha conteúdo depois da #38. Até lá, a lista aparece vazia.
3. **Configurações:** acessadas pelo Perfil (feature do Eric). Itens: ligar ou desligar cada tipo de aviso, ver a versão do aplicativo, abrir os documentos legais (Privacidade e Termos, por endereço da Web) e Sair. Excluir conta é da issue #47.
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
