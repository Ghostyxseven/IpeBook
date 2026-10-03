-- Issue #54 — Negociação completa: propor troca, reagendar encontro (spec 028, ADR 0022).
-- Aplicar depois de `20261002140000_negociacao_transicoes.sql`.
-- Aplicar no SQL Editor do Supabase ou com `supabase db push`.

-- 1. Na troca, quem pede oferece um livro seu (Figma 03.05).
alter table public.book_requests
  add column if not exists offered_listing_id uuid references public.listings (id) on delete set null;

create index if not exists book_requests_offered_idx
  on public.book_requests (offered_listing_id) where offered_listing_id is not null;

-- O livro oferecido é um anúncio disponível de quem pede, diferente do pedido,
-- e só existe quando o anúncio pedido é de troca.
drop policy if exists "Requerente cria a própria solicitação" on public.book_requests;
create policy "Requerente cria a própria solicitação" on public.book_requests
  for insert to authenticated
  with check (
    requester_id = (select auth.uid())
    and status = 'pending'
    and exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.status = 'disponivel'
        and l.owner_id <> (select auth.uid())
        and (offered_listing_id is null or l.modality = 'trade')
    )
    and (
      offered_listing_id is null
      or exists (
        select 1 from public.listings o
        where o.id = offered_listing_id
          and o.id <> listing_id
          and o.owner_id = (select auth.uid())
          and o.status = 'disponivel'
      )
    )
  );

-- 2. Quem anunciou continua lendo o livro oferecido depois de reservado ou concluído.
create or replace function public.offered_to_me_listing_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select r.offered_listing_id
  from public.book_requests r
  join public.listings l on l.id = r.listing_id
  where l.owner_id = (select auth.uid()) and r.offered_listing_id is not null;
$$;

revoke execute on function public.offered_to_me_listing_ids() from public, anon;
grant execute on function public.offered_to_me_listing_ids() to authenticated;

drop policy if exists "Quem recebe a troca lê o livro oferecido" on public.listings;
create policy "Quem recebe a troca lê o livro oferecido" on public.listings
  for select to authenticated
  using (id in (select public.offered_to_me_listing_ids()));

-- 3. As transições do ADR 0018 passam a mover também o livro oferecido.
create or replace function public.transition_book_request(request_id uuid, next_status text)
returns setof public.book_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  req public.book_requests;
  lst public.listings;
  offered public.listings;
  is_owner boolean;
  is_requester boolean;
begin
  if me is null then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into req from public.book_requests where id = request_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  select * into lst from public.listings where id = req.listing_id for update;
  if req.offered_listing_id is not null then
    select * into offered from public.listings where id = req.offered_listing_id for update;
  end if;
  is_owner := lst.owner_id = me;
  is_requester := req.requester_id = me;

  if not (is_owner or is_requester) then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  if req.status = 'pending' and next_status in ('accepted', 'rejected') then
    if not is_owner then
      raise exception 'forbidden' using errcode = '42501';
    end if;
    if next_status = 'accepted' and lst.status <> 'disponivel' then
      raise exception 'invalid_transition';
    end if;
    -- O livro oferecido precisa continuar disponível para a troca acontecer.
    if next_status = 'accepted' and req.offered_listing_id is not null
       and (offered.id is null or offered.status <> 'disponivel') then
      raise exception 'invalid_transition';
    end if;
  elsif req.status = 'pending' and next_status = 'canceled' then
    if not is_requester then
      raise exception 'forbidden' using errcode = '42501';
    end if;
  elsif req.status = 'accepted' and next_status = 'canceled' then
    null; -- quem pediu ou quem anunciou
  elsif req.status = 'accepted' and next_status = 'completed' then
    if not is_owner then
      raise exception 'forbidden' using errcode = '42501';
    end if;
  else
    raise exception 'invalid_transition';
  end if;

  update public.book_requests set status = next_status where id = req.id;

  if next_status = 'accepted' then
    update public.listings set status = 'reservado' where id = lst.id;
    update public.book_requests
      set status = 'rejected'
      where listing_id = lst.id and status = 'pending' and id <> req.id;
    if offered.id is not null then
      update public.listings set status = 'reservado' where id = offered.id;
    end if;
  elsif next_status = 'completed' then
    update public.listings set status = 'concluido' where id = lst.id;
    if offered.id is not null then
      update public.listings set status = 'concluido' where id = offered.id;
    end if;
  elsif next_status = 'canceled' and req.status = 'accepted' then
    if lst.status = 'reservado' then
      update public.listings set status = 'disponivel' where id = lst.id;
    end if;
    if offered.id is not null and offered.status = 'reservado' then
      update public.listings set status = 'disponivel' where id = offered.id;
    end if;
  end if;

  return query select * from public.book_requests where id = req.id;
end;
$$;

revoke execute on function public.transition_book_request(uuid, text) from public, anon;
grant execute on function public.transition_book_request(uuid, text) to authenticated;

-- 4. Reagendar o encontro combinado (Figma 06.13): qualquer um dos dois muda local,
--    data e horário enquanto a negociação está aceita.
create or replace function public.reschedule_book_request(
  request_id uuid,
  new_location text,
  new_date text,
  new_time text
)
returns setof public.book_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  req public.book_requests;
  owner uuid;
begin
  if me is null then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into req from public.book_requests where id = request_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  select l.owner_id into owner from public.listings l where l.id = req.listing_id;
  if not (req.requester_id = me or owner = me) then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if req.status <> 'accepted' then
    raise exception 'invalid_transition';
  end if;

  -- Os `check` da tabela validam o formato de data, hora e local.
  update public.book_requests
    set public_location = trim(new_location), meeting_date = new_date, meeting_time = new_time
    where id = req.id;

  return query select * from public.book_requests where id = req.id;
end;
$$;

revoke execute on function public.reschedule_book_request(uuid, text, text, text) from public, anon;
grant execute on function public.reschedule_book_request(uuid, text, text, text) to authenticated;
