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

**Antes, configure um SMTP próprio.** No plano gratuito, com o e-mail padrão do Supabase, os modelos não podem ser alterados: o painel e a API recusam com "Email template modification is not available for free tier projects using the default email provider" (verificado em 02/10/2026). Em **Authentication → Emails → SMTP Settings**, ligue **Enable custom SMTP** e preencha os dados de um provedor com plano gratuito, por exemplo:

| Provedor             | Plano gratuito       | Observação                                                      |
| -------------------- | -------------------- | --------------------------------------------------------------- |
| Brevo                | 300 e-mails por dia  | Permite remetente verificado por e-mail, sem domínio próprio    |
| Gmail (senha de app) | cerca de 500 por dia | Exige verificação em duas etapas na conta e uma "senha de app"  |
| Resend               | 3.000 por mês        | Para enviar a qualquer pessoa, exige domínio próprio verificado |

A senha do SMTP é um segredo: fica só no painel do Supabase, nunca no repositório. O SMTP padrão também limita o número de e-mails por hora.

## Anúncio de teste (só em projeto de desenvolvimento)

O catálogo esconde os anúncios da própria pessoa. Para ver um anúncio no app, crie duas contas de teste e insira o anúncio com o id da conta que **não** vai abrir o app (Authentication → Users):

```sql
insert into public.listings (owner_id, title, author, category, modality, price_cents, condition, neighborhood, city)
values ('<id-da-outra-conta>', 'Livro de teste', 'Autoria de teste', 'Outros', 'sale', 1500, 'bom', 'Bairro de teste', 'Cidade de teste');
```

Apague esses registros antes de usar o projeto com pessoas reais.
