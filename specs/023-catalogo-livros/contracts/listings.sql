-- PROPOSTA (não aplicada). Contrato da tabela usada por supabaseCatalogRepository.
-- Aplicar somente depois de a equipe aprovar a spec 023 e de revisar as políticas.

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (length(btrim(title)) > 0),
  author text not null check (length(btrim(author)) > 0),
  category text not null check (length(btrim(category)) > 0),
  condition text not null check (length(btrim(condition)) > 0),
  description text not null default '',
  modality text not null check (modality in ('venda', 'troca', 'doacao')),
  status text not null default 'disponivel' check (status in ('disponivel', 'reservado', 'concluido')),
  price_cents integer,
  exchange_interest text,
  cover_url text,
  location text,
  created_at timestamptz not null default now(),
  -- Preço só na venda; interesse só na troca; doação não tem nenhum dos dois.
  constraint listings_modality_fields check (
    (modality = 'venda' and price_cents is not null and price_cents > 0 and exchange_interest is null)
    or (modality = 'troca' and price_cents is null and length(btrim(coalesce(exchange_interest, ''))) > 0)
    or (modality = 'doacao' and price_cents is null and exchange_interest is null)
  )
);

create index if not exists listings_status_created_idx on public.listings (status, created_at desc);

alter table public.listings enable row level security;

-- Leitura: pessoas autenticadas veem anúncios que não foram concluídos, e cada dono vê os seus.
create policy "listings_select_authenticated" on public.listings
  for select to authenticated
  using (status <> 'concluido' or owner_id = auth.uid());

-- Escrita: somente o dono (a feature de Inventário usa estas políticas).
create policy "listings_insert_owner" on public.listings
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy "listings_update_owner" on public.listings
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "listings_delete_owner" on public.listings
  for delete to authenticated
  using (owner_id = auth.uid());
