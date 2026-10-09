-- Issue #39 — Conversa da negociação (spec 029, ADR 0021).
-- Aplicar no SQL Editor do Supabase ou com `supabase db push`.

create table if not exists public.request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.book_requests (id) on delete cascade,
  sender_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists request_messages_request_idx
  on public.request_messages (request_id, created_at);

alter table public.request_messages enable row level security;

-- Quem participa da negociação: quem pediu ou quem anunciou o livro.
-- `security definer` para não depender das políticas de `listings` e `book_requests`
-- dentro da política desta tabela (o mesmo cuidado do ADR 0018).
create or replace function public.is_request_participant(request uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.book_requests r
    join public.listings l on l.id = r.listing_id
    where r.id = request
      and (r.requester_id = (select auth.uid()) or l.owner_id = (select auth.uid()))
  );
$$;

-- A conversa fica aberta enquanto a negociação está pendente ou aceita.
create or replace function public.is_request_open(request uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.book_requests r
    where r.id = request and r.status in ('pending', 'accepted')
  );
$$;

revoke all on function public.is_request_participant(uuid) from public, anon;
revoke all on function public.is_request_open(uuid) from public, anon;
grant execute on function public.is_request_participant(uuid) to authenticated;
grant execute on function public.is_request_open(uuid) to authenticated;

-- Leitura: só os dois lados da negociação.
drop policy if exists "Envolvidos leem a conversa" on public.request_messages;
create policy "Envolvidos leem a conversa" on public.request_messages
  for select to authenticated
  using (public.is_request_participant(request_id));

-- Envio: em nome próprio, por quem participa, com a negociação em aberto.
drop policy if exists "Envolvidos enviam mensagens" on public.request_messages;
create policy "Envolvidos enviam mensagens" on public.request_messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and public.is_request_participant(request_id)
    and public.is_request_open(request_id)
  );

-- Sem update nem delete: a conversa é o histórico da negociação.
