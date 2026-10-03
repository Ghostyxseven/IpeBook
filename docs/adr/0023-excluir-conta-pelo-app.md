# 0023 — Excluir a própria conta pelo app

Data: 03/10/2026

## Status

Proposto, implementado (issue #47, Figma 07.09 Excluir conta e 07.17 Conta excluída).

## Contexto

A LGPD garante a eliminação dos dados, e a Google Play exige que apps com criação de conta permitam excluí-la. Apagar alguém em `auth.users` exige privilégio de administrador, e a chave `service_role` nunca pode ir para o aplicativo. As capas dos anúncios ficam no Storage, e o Supabase não deixa apagar esses arquivos por SQL.

## Decisão

- **Função no banco:** `public.delete_own_account()`, `security definer`, apaga só a linha de `auth.users` de quem chama (`auth.uid()`). Só o papel `authenticated` pode executá-la. Não há Edge Function: a função SQL resolve sem outro serviço para publicar e manter.
- **Dados ligados:** anúncios, pedidos, mensagens, avisos, preferências, bloqueios, denúncias feitas e perfil já usam `on delete cascade` e saem junto com a conta.
- **Capas:** antes de chamar a função, o app lista e remove os arquivos da pasta da pessoa no bucket `listing-covers`, pela política "Pessoa remove as próprias capas".
- **Sessão:** depois da exclusão, o app sai só no aparelho (`signOut({ scope: 'local' })`). O layout da área logada abre Conta excluída em vez de Entrar (marca `afterSignOut`).
- **Onde fica no app:** Configurações › Privacidade e dados › Excluir conta, com o diálogo do Figma, e um atalho "Excluir conta" em vermelho nas Configurações (07.05).

## Consequências

- Se a remoção das capas der certo e a função falhar, a conta continua, mas sem as capas; o app mostra o erro e a pessoa pode tentar de novo.
- Denúncias feitas **contra** a pessoa apontam para `reported_user_id` com `on delete cascade` e também somem. Se a moderação precisar guardá-las, troque para `on delete set null` numa migração futura.
- A migração `20261003150000_excluir_conta.sql` precisa ser aplicada; sem ela, o app mostra "A autenticação ainda não foi configurada neste ambiente." e não sai da conta.
- O pedido de exclusão pela Web continua pelo e-mail de contato da Política de Privacidade.
