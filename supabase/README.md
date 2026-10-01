# Supabase

Migrações do banco do IpêBook (ADR 0006 e ADR 0008).

## Aplicar num projeto

1. Abra o projeto no painel do Supabase → **SQL Editor**.
2. Cole e execute cada arquivo de `migrations/` em ordem de nome.
3. Confira em **Table Editor** a tabela `listings` e a view `catalog_listings`, e em **Storage** o bucket `listing-covers`.

Com a CLI do Supabase vinculada ao projeto, `supabase db push` aplica as mesmas migrações.

## Anúncio de teste (só em projeto de desenvolvimento)

O catálogo esconde os anúncios da própria pessoa. Para ver um anúncio no app, crie duas contas de teste e insira o anúncio com o id da conta que **não** vai abrir o app (Authentication → Users):

```sql
insert into public.listings (owner_id, title, author, category, modality, price_cents, condition, neighborhood, city)
values ('<id-da-outra-conta>', 'Livro de teste', 'Autoria de teste', 'Outros', 'sale', 1500, 'bom', 'Bairro de teste', 'Cidade de teste');
```

Apague esses registros antes de usar o projeto com pessoas reais.
