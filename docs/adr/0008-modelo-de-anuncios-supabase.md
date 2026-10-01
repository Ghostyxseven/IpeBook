# 0008 — Modelo de anúncios no Supabase

Data: 30/09/2026

## Status

Proposto. A migração já foi aplicada no Supabase da equipe (30/09/2026) e a [spec 018](../../specs/018-catalogo-descoberta/spec.md) a usa, mas o ADR ainda aguarda a concordância do Eric (feature de anúncios, que grava os dados) para virar Aceito (issue #23).

## Contexto

O catálogo (Micael) lê anúncios e a gestão de anúncios (Eric) os cria, edita e arquiva. A negociação (Antonio) muda a situação para reservado e concluído. As três features precisam do mesmo modelo. O [ADR 0006](0006-autenticacao-supabase.md) escolheu o Supabase por oferecer Postgres com Row Level Security (RLS).

## Decisão

Uma tabela `public.listings` no Postgres do Supabase, com RLS ligada:

| Coluna                     | Tipo          | Regra                                                 |
| -------------------------- | ------------- | ----------------------------------------------------- |
| `id`                       | `uuid`        | chave, `gen_random_uuid()`                            |
| `owner_id`                 | `uuid`        | `auth.users(id)`, padrão `auth.uid()`                 |
| `title`, `author`          | `text`        | obrigatórios                                          |
| `category`                 | `text`        | uma das categorias fixas (abaixo)                     |
| `modality`                 | `text`        | `sale`, `trade` ou `donation`                         |
| `price_cents`              | `integer`     | obrigatório e > 0 só em `sale`; nulo nas outras       |
| `trade_terms`              | `text`        | obrigatório só em `trade`                             |
| `condition`                | `text`        | `novo`, `como_novo`, `bom` ou `marcas_de_uso`         |
| `neighborhood`, `city`     | `text`        | sem endereço                                          |
| `description`              | `text`        | opcional                                              |
| `cover_path`               | `text`        | caminho no bucket `listing-covers` (leitura pública)  |
| `status`                   | `text`        | `disponivel`, `reservado`, `concluido` ou `arquivado` |
| `created_at`, `updated_at` | `timestamptz` | padrão `now()`                                        |

Categorias iniciais: Literatura brasileira, Literatura estrangeira, Didáticos, Técnicos e acadêmicos, Infantojuvenil, Quadrinhos, Autoajuda e religião, Outros.

- **View `catalog_listings`** (`security_invoker`): só anúncios `disponivel` ou `reservado` de outras pessoas (`owner_id <> auth.uid()`), com o primeiro nome de quem anunciou, obtido pela função `listing_owner_first_name` (`security definer`, só devolve o primeiro nome de `raw_user_meta_data.name`, porque o app não acessa `auth.users`). O catálogo lê só a view.
- **RLS:** pessoas autenticadas leem anúncios `disponivel` e `reservado`; quem anunciou lê, cria, altera e exclui os próprios. A mudança de situação pela negociação fica para o ADR da feature do Antonio.
- **Migrações** versionadas em `supabase/migrations/` (primeira: `20260930120000_catalogo_anuncios.sql`).

## Alternativas

- **Tabelas separadas por modalidade:** complicaria a busca e o feed, que misturam as três.
- **Preço em `numeric` decimal:** centavos em inteiro evitam erros de arredondamento e simplificam a formatação.
- **Categorias em tabela própria:** mais flexível, mas desnecessário enquanto a lista for fixa; pode virar tabela depois.
- **Ler `auth.users` direto no app:** não é permitido pelo Supabase e exporia dados; a view expõe só o primeiro nome.

## Consequências

- Eric e Antonio passam a usar estas colunas e situações; mudanças exigem novo ADR.
- A view depende do nome em `user_metadata`; quando existir a tabela de perfis, a view deve passar a lê-la.
- A Política de Privacidade precisa mencionar que bairro, cidade e primeiro nome ficam visíveis para outras pessoas autenticadas.
