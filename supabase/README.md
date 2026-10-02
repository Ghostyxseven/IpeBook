# Supabase

Migrações do banco do IpêBook (ADR 0006 e ADR 0008).

## Aplicar num projeto

1. Abra o projeto no painel do Supabase → **SQL Editor**.
2. Cole e execute cada arquivo de `migrations/` em ordem de nome.
3. Confira em **Table Editor** a tabela `listings` e a view `catalog_listings`, e em **Storage** o bucket `listing-covers`.

Com a CLI do Supabase vinculada ao projeto, `supabase db push` aplica as mesmas migrações.

## Modelos de e-mail com código (issue #31)

O app confirma o cadastro e recupera a senha por **código digitado no app**, não por link ([ADR 0006](../docs/adr/0006-autenticacao-supabase.md)). Os modelos padrão do Supabase mandam só um link, que confirma a conta e abre o navegador em `localhost`.

No painel: **Authentication → Emails → Templates** (em versões antigas, Authentication → Email Templates).

| Modelo no painel   | Assunto                                                     | Corpo (copiar o arquivo inteiro)                                         |
| ------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Confirm signup** | `Seu código do IpêBook: {{ .Token }}`                       | [`templates/confirmar-cadastro.html`](templates/confirmar-cadastro.html) |
| **Reset password** | `Código para criar uma nova senha no IpêBook: {{ .Token }}` | [`templates/recuperar-senha.html`](templates/recuperar-senha.html)       |

Confira também em **Authentication → Sign In / Providers → Email** que **Confirm email** está ligado.

**Teste:** criar uma conta no app com um e-mail seu, confirmar que chega um código e que ele ativa a conta; depois, "Esqueci minha senha" com o mesmo e-mail. Registrar o resultado no `verify.md` da spec 014.

O SMTP padrão do Supabase limita o número de e-mails por hora. Se os testes da equipe esbarrarem nesse limite, configure um SMTP próprio no mesmo painel.

## Notificações (ADR 0011, spec 024)

Aplique `migrations/20261002120000_notificacoes.sql` depois da migração do catálogo. Ela cria `notifications` e `notification_preferences` com RLS (cada pessoa lê e altera só as suas; o app só pode atualizar `read_at`) e a função `create_notification`, que respeita as preferências e **não pode ser chamada pelo app**: apenas gatilhos do banco, como os da negociação (#38), a executam.

Para ver um aviso no app antes da negociação existir, no SQL Editor (projeto de desenvolvimento):

```sql
select public.create_notification('<id-da-conta-que-abre-o-app>', 'request_received', 'Aviso de teste', 'Texto de teste');
```

Sobre o endereço da página institucional (`EXPO_PUBLIC_SITE_URL` no `.env`), veja `.env.example`. Apague os avisos de teste antes de usar o projeto com pessoas reais.

## Negociação e segurança (ADRs 0018 e 0017, specs 028 e 027)

Aplique, nesta ordem e depois das migrações do catálogo e das notificações:

1. `migrations/20261002125000_book_requests.sql` — tabela `book_requests`.
2. `migrations/20261002130000_seguranca_denuncias_bloqueios.sql` — `reports`, `user_blocks` e a view `catalog_listings` sem anúncios de quem foi bloqueado.
3. `migrations/20261002140000_negociacao_transicoes.sql` — a função `transition_book_request`, que é o único jeito de aceitar, recusar, cancelar ou concluir, e os avisos da negociação.

## Anúncio de teste (só em projeto de desenvolvimento)

O catálogo esconde os anúncios da própria pessoa. Para ver um anúncio no app, crie duas contas de teste e insira o anúncio com o id da conta que **não** vai abrir o app (Authentication → Users):

```sql
insert into public.listings (owner_id, title, author, category, modality, price_cents, condition, neighborhood, city)
values ('<id-da-outra-conta>', 'Livro de teste', 'Autoria de teste', 'Outros', 'sale', 1500, 'bom', 'Bairro de teste', 'Cidade de teste');
```

Apague esses registros antes de usar o projeto com pessoas reais.
