-- Issue #27 (extra 2) — Favoritos (Figma 37). Spec 018 (catálogo), ADR 0032.
-- Aplicar no SQL Editor do Supabase ou com `supabase db push`.

-- Marcar/desmarcar não é uma "edição": é inserir ou apagar a linha. Sem update, sem
-- histórico — só existe ou não existe o favorito, igual ao coração do Figma.
create table if not exists public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index if not exists favorites_listing_idx on public.favorites (listing_id);

alter table public.favorites enable row level security;

-- Cada pessoa só lê, grava e apaga os próprios favoritos; não há como ver quem
-- favoritou o quê, nem contagem pública (o Figma 37 não pede isso).
drop policy if exists "Favoritos são só de quem favoritou" on public.favorites;
create policy "Favoritos são só de quem favoritou" on public.favorites
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Favoritar é inserir o próprio" on public.favorites;
create policy "Favoritar é inserir o próprio" on public.favorites
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Desfavoritar é remover o próprio" on public.favorites;
create policy "Desfavoritar é remover o próprio" on public.favorites
  for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.favorites from anon;
grant select, insert, delete on public.favorites to authenticated;
