# 0011 — Entrega de notificações

Data: 01/10/2026

## Status

Proposto, já implementado: a migração `supabase/migrations/20261002120000_notificacoes.sql` e as telas da [spec 024](../../specs/024-configuracoes-notificacoes/spec.md) estão na `develop`. Para passar a aceito, falta a concordância do Antonio (a negociação gera os eventos) e do Eric (o acesso fica no Perfil).

## Contexto

O app precisa avisar pedidos recebidos, aceitos ou recusados, reservas e conclusões. O backend é o Supabase ([ADR 0006](0006-autenticacao-supabase.md) e [ADR 0008](0008-modelo-de-anuncios-supabase.md)). Notificação push exige credenciais de Android e iOS, build próprio (não funciona no Expo Go) e conta nas lojas, que ainda não existem (issues #51 e #46). O projeto é um trabalho de faculdade com prazo curto.

## Decisão

Notificações **dentro do aplicativo**: tabela `public.notifications` no Postgres do Supabase, com RLS (cada pessoa lê e atualiza só as suas). Os avisos são criados por gatilhos do banco quando a negociação muda de estado, respeitando `notification_preferences`. O app lê a lista ao abrir a tela e atualiza ao voltar ao primeiro plano. Push, e-mail e tempo real ficam para uma decisão futura.

## Alternativas

- **Push com Expo Notifications:** melhor experiência, mas depende de build, credenciais e lojas; arriscado para o prazo.
- **Supabase Realtime:** atualiza a lista sem recarregar, mas adiciona conexão permanente e complexidade; pode ser acrescentado depois sem mudar o modelo.
- **Gerar os avisos no cliente:** quem age cria o aviso para a outra pessoa, o que exigiria permitir escrita em linhas alheias; inseguro.

## Consequências

- Sem push, a pessoa só vê o aviso ao abrir o app; isso deve ficar claro na spec e nos testes.
- Os gatilhos acoplam as notificações ao modelo de negociação; nomes de eventos precisam ser combinados com o Antonio.
- A Política de Privacidade deve citar o conteúdo dos avisos guardados no Supabase.
- Adotar push no futuro exigirá novo ADR que substitua ou complemente este.
