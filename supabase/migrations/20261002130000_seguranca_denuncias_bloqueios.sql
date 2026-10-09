-- Issue #40 — Segurança: denunciar e bloquear
-- Aplicar no SQL Editor do Supabase ou com `supabase db push`.

create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_blocks_blocker_blocked_key unique (blocker_id, blocked_id),
  constraint user_blocks_not_self check (blocker_id <> blocked_id)
);

create index if not exists user_blocks_blocker_idx on public.user_blocks (blocker_id);
create index if not exists user_blocks_blocked_idx on public.user_blocks (blocked_id);

alter table public.user_blocks enable row level security;

-- O bloqueador pode ver e gerenciar os próprios bloqueios (para não ver os usuários bloqueados no catálogo)
drop policy if exists "Bloqueador gerencia próprios bloqueios" on public.user_blocks;
create policy "Bloqueador gerencia próprios bloqueios" on public.user_blocks
  for all to authenticated
  using (blocker_id = (select auth.uid()))
  with check (blocker_id = (select auth.uid()));

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reported_user_id uuid references auth.users (id) on delete cascade,
  reported_listing_id uuid references public.listings (id) on delete cascade,
  reason text not null check (length(trim(reason)) > 0),
  details text,
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  created_at timestamptz not null default now(),
  constraint reports_target_check check (reported_user_id is not null or reported_listing_id is not null)
);

create index if not exists reports_reporter_idx on public.reports (reporter_id);
create index if not exists reports_status_idx on public.reports (status);

alter table public.reports enable row level security;

-- Denunciante vê apenas suas denúncias
drop policy if exists "Denunciante visualiza próprias denúncias" on public.reports;
create policy "Denunciante visualiza próprias denúncias" on public.reports
  for select to authenticated
  using (reporter_id = (select auth.uid()));

-- Denunciante pode criar denúncias
drop policy if exists "Denunciante insere próprias denúncias" on public.reports;
create policy "Denunciante insere próprias denúncias" on public.reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()));

-- Recriar a view catalog_listings com o filtro de bloqueio unilateral (Issue #40)
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
  and l.owner_id <> (select auth.uid())
  and l.owner_id not in (
    select blocked_id from public.user_blocks where blocker_id = (select auth.uid())
  );

revoke all on public.catalog_listings from anon;
grant select on public.catalog_listings to authenticated;
