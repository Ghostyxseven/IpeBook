-- ADR 0008 — Modelo de anúncios. Spec 018 (catálogo).
-- Aplicar no SQL Editor do Supabase ou com `supabase db push`.

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  author text not null check (length(trim(author)) > 0),
  category text not null check (category in (
    'Literatura brasileira', 'Literatura estrangeira', 'Didáticos', 'Técnicos e acadêmicos',
    'Infantojuvenil', 'Quadrinhos', 'Autoajuda e religião', 'Outros'
  )),
  modality text not null check (modality in ('sale', 'trade', 'donation')),
  price_cents integer,
  trade_terms text,
  condition text not null check (condition in ('novo', 'como_novo', 'bom', 'marcas_de_uso')),
  neighborhood text,
  city text,
  description text,
  cover_path text,
  status text not null default 'disponivel'
    check (status in ('disponivel', 'reservado', 'concluido', 'arquivado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint listings_price_only_on_sale check (
    (modality = 'sale' and price_cents is not null and price_cents > 0)
    or (modality <> 'sale' and price_cents is null)
  ),
  constraint listings_terms_only_on_trade check (
    (modality = 'trade' and length(trim(coalesce(trade_terms, ''))) > 0)
    or (modality <> 'trade' and trade_terms is null)
  )
);

create index if not exists listings_recent_idx on public.listings (created_at desc, id desc);
create index if not exists listings_category_idx on public.listings (category);
create index if not exists listings_owner_idx on public.listings (owner_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listings_touch_updated_at on public.listings;
create trigger listings_touch_updated_at
  before update on public.listings
  for each row execute function public.touch_updated_at();

alter table public.listings enable row level security;

drop policy if exists "Anúncios visíveis no catálogo ou próprios" on public.listings;
create policy "Anúncios visíveis no catálogo ou próprios" on public.listings
  for select to authenticated
  using (status in ('disponivel', 'reservado') or owner_id = (select auth.uid()));

drop policy if exists "Pessoa cria os próprios anúncios" on public.listings;
create policy "Pessoa cria os próprios anúncios" on public.listings
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists "Pessoa altera os próprios anúncios" on public.listings;
create policy "Pessoa altera os próprios anúncios" on public.listings
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "Pessoa exclui os próprios anúncios" on public.listings;
create policy "Pessoa exclui os próprios anúncios" on public.listings
  for delete to authenticated
  using (owner_id = (select auth.uid()));

-- Primeiro nome de quem anunciou. `auth.users` não é acessível ao app;
-- a função expõe só o primeiro nome, nunca e-mail ou outros dados.
create or replace function public.listing_owner_first_name(owner uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select nullif(split_part(trim(u.raw_user_meta_data ->> 'name'), ' ', 1), '')
  from auth.users u
  where u.id = owner;
$$;

revoke all on function public.listing_owner_first_name(uuid) from public, anon;
grant execute on function public.listing_owner_first_name(uuid) to authenticated;

-- Leitura do catálogo: só anúncios disponíveis ou reservados de outras pessoas.
create or replace view public.catalog_listings
with (security_invoker = true)
as
select
  l.id, l.title, l.author, l.category, l.modality, l.price_cents, l.trade_terms,
  l.condition, l.neighborhood, l.city, l.description, l.cover_path, l.status,
  public.listing_owner_first_name(l.owner_id) as owner_first_name,
  l.created_at
from public.listings l
where l.status in ('disponivel', 'reservado')
  and l.owner_id <> (select auth.uid());

revoke all on public.catalog_listings from anon;
grant select on public.catalog_listings to authenticated;

-- Capas: leitura pública; cada pessoa grava só na pasta com o próprio id.
insert into storage.buckets (id, name, public)
values ('listing-covers', 'listing-covers', true)
on conflict (id) do nothing;

drop policy if exists "Pessoa envia capas na própria pasta" on storage.objects;
create policy "Pessoa envia capas na própria pasta" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'listing-covers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Pessoa remove as próprias capas" on storage.objects;
create policy "Pessoa remove as próprias capas" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'listing-covers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
