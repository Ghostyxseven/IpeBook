-- Issue #38 — Negociação mínima. Solicitação de livro/encontro.
-- Aplicar no SQL Editor do Supabase ou com `supabase db push`.

create table if not exists public.book_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  requester_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  public_location text not null check (length(trim(public_location)) > 0),
  meeting_date text not null check (meeting_date ~ '^\d{4}-\d{2}-\d{2}$'),
  meeting_time text not null check (meeting_time ~ '^\d{2}:\d{2}$'),

  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'canceled', 'completed')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists book_requests_listing_idx on public.book_requests (listing_id);
create index if not exists book_requests_requester_idx on public.book_requests (requester_id);
create index if not exists book_requests_status_idx on public.book_requests (status);
create index if not exists book_requests_recent_idx on public.book_requests (created_at desc, id desc);

drop trigger if exists book_requests_touch_updated_at on public.book_requests;
create trigger book_requests_touch_updated_at
  before update on public.book_requests
  for each row execute function public.touch_updated_at();

alter table public.book_requests enable row level security;

-- Leitura: envolvidos na negociação (requerente ou dono do anúncio).
drop policy if exists "Envolvidos leem a própria negociação" on public.book_requests;
create policy "Envolvidos leem a própria negociação" on public.book_requests
  for select to authenticated
  using (
    requester_id = (select auth.uid())
    or listing_id in (
      select id from public.listings where owner_id = (select auth.uid())
    )
  );

-- Criação: somente o requerente autenticado, para si mesmo, sempre como pendente.
drop policy if exists "Requerente cria a própria solicitação" on public.book_requests;
create policy "Requerente cria a própria solicitação" on public.book_requests
  for insert to authenticated
  with check (
    requester_id = (select auth.uid())
    and status = 'pending'
  );

-- Atualização: envolvidos (requerente ou dono) alteram status.
-- Validações de transição e permissão detalhadas ficam na aplicação.
drop policy if exists "Envolvidos atualizam a própria negociação" on public.book_requests;
create policy "Envolvidos atualizam a própria negociação" on public.book_requests
  for update to authenticated
  using (
    requester_id = (select auth.uid())
    or listing_id in (
      select id from public.listings where owner_id = (select auth.uid())
    )
  )
  with check (
    requester_id = (select auth.uid())
    or listing_id in (
      select id from public.listings where owner_id = (select auth.uid())
    )
  );

-- Exclusão: não permitimos deleção para manter histórico; cancelamento é via status.
