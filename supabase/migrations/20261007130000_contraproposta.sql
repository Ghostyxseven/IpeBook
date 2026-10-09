-- Issue #54 — Contraproposta de troca (Figma 06.19 e 06.20, spec 028, ADR 0030).
-- Aplicar depois de `20261003130000_negociacao_completa.sql`.
-- Aplicar no SQL Editor do Supabase ou com `supabase db push`.

-- 1. O outro livro de quem pediu que o dono prefere receber.
--    Fica ao lado de `offered_listing_id`, não no lugar: a proposta original continua
--    visível na tela enquanto a contraproposta está de pé.
alter table public.book_requests
  add column if not exists counter_listing_id uuid references public.listings (id) on delete set null;

create index if not exists book_requests_counter_idx
  on public.book_requests (counter_listing_id) where counter_listing_id is not null;

-- 2. O dono contrapropõe: escolhe um anúncio disponível de quem pediu, diferente do
--    que já está oferecido, e só enquanto a proposta está pendente.
--    A contraproposta não muda o status; só passa a vez para quem pediu.
create or replace function public.counter_offer(
  p_request_id uuid,
  p_listing_id uuid
)
returns public.book_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request public.book_requests;
begin
  if auth.uid() is null then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select * into v_request from public.book_requests where id = p_request_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  -- Só o dono do anúncio pedido, e só na troca.
  if not exists (
    select 1 from public.listings l
    where l.id = v_request.listing_id
      and l.owner_id = (select auth.uid())
      and l.modality = 'trade'
      and l.status = 'disponivel'
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if v_request.status <> 'pending' or v_request.counter_listing_id is not null then
    raise exception 'invalid_transition' using errcode = 'P0001';
  end if;

  -- O livro pedido é de quem propôs, está disponível e não é o que ele já ofereceu.
  if not exists (
    select 1 from public.listings o
    where o.id = p_listing_id
      and o.owner_id = v_request.requester_id
      and o.status = 'disponivel'
      and o.modality = 'trade'
      and o.id is distinct from v_request.offered_listing_id
      and o.id <> v_request.listing_id
  ) then
    raise exception 'invalid_transition' using errcode = 'P0001';
  end if;

  update public.book_requests
     set counter_listing_id = p_listing_id,
         updated_at = now()
   where id = p_request_id
  returning * into v_request;

  return v_request;
end;
$$;

-- 3. Quem pediu responde. Aceitar fecha o acordo com o livro contraproposto: o dono já
--    disse que o quer, então não há uma segunda rodada de aprovação.
create or replace function public.answer_counter_offer(
  p_request_id uuid,
  p_accept boolean
)
returns public.book_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request public.book_requests;
  v_listing public.listings;
  v_counter public.listings;
begin
  if auth.uid() is null then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select * into v_request from public.book_requests where id = p_request_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  if v_request.requester_id <> (select auth.uid()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if v_request.status <> 'pending' or v_request.counter_listing_id is null then
    raise exception 'invalid_transition' using errcode = 'P0001';
  end if;

  if p_accept is null then
    raise exception 'invalid_transition' using errcode = 'P0001';
  end if;

  if p_accept then
    -- Trava e revalida ambos: a disponibilidade pode mudar enquanto a pessoa decide.
    perform 1 from public.listings
      where id in (v_request.listing_id, v_request.counter_listing_id)
      order by id for update;
    select * into v_listing from public.listings where id = v_request.listing_id;
    select * into v_counter from public.listings where id = v_request.counter_listing_id;
    if v_listing.id is null or v_listing.status <> 'disponivel'
       or v_listing.modality <> 'trade'
       or v_counter.id is null or v_counter.status <> 'disponivel'
       or v_counter.modality <> 'trade'
       or v_counter.owner_id <> v_request.requester_id then
      raise exception 'invalid_transition' using errcode = 'P0001';
    end if;
    -- O contraproposto passa a ser o livro da troca e o encontro fica combinado.
    update public.book_requests
       set offered_listing_id = v_request.counter_listing_id,
           counter_listing_id = null,
           status = 'accepted',
           updated_at = now()
     where id = p_request_id
    returning * into v_request;

    -- Mesmo efeito de aceitar a proposta: reserva ambos e recusa concorrentes.
    update public.listings
       set status = 'reservado'
     where id in (v_request.listing_id, v_request.offered_listing_id);
    update public.book_requests
       set status = 'rejected', counter_listing_id = null, updated_at = now()
     where listing_id = v_request.listing_id and status = 'pending' and id <> p_request_id;
  else
    -- Recusar a contraproposta encerra a negociação: quem pediu não quer abrir mão
    -- do livro que ofereceu, e o dono não quer o que foi oferecido.
    update public.book_requests
       set counter_listing_id = null,
           status = 'rejected',
           updated_at = now()
     where id = p_request_id
    returning * into v_request;
  end if;

  return v_request;
end;
$$;

revoke all on function public.counter_offer(uuid, uuid) from public;
revoke all on function public.answer_counter_offer(uuid, boolean) from public;
grant execute on function public.counter_offer(uuid, uuid) to authenticated;
grant execute on function public.answer_counter_offer(uuid, boolean) to authenticated;

-- 4. Quem anunciou precisa ler os anúncios de quem pediu para escolher a contraproposta.
--    A função devolve só o que já é público no catálogo: anúncios disponíveis.
create or replace function public.shelf_of_requester(p_request_id uuid)
returns setof public.listings
language sql
security definer
set search_path = ''
as $$
  select l.*
    from public.book_requests r
    join public.listings pedido on pedido.id = r.listing_id
    join public.listings l on l.owner_id = r.requester_id
   where r.id = p_request_id
     and pedido.owner_id = (select auth.uid())
     and r.status = 'pending'
     and r.counter_listing_id is null
     and pedido.modality = 'trade'
     and pedido.status = 'disponivel'
     and l.status = 'disponivel'
     and l.modality = 'trade'
     and l.id <> r.listing_id
     and l.id is distinct from r.offered_listing_id
   order by l.created_at desc;
$$;

revoke all on function public.shelf_of_requester(uuid) from public;
grant execute on function public.shelf_of_requester(uuid) to authenticated;

-- 5. A política permissiva existente segue validando dono e anúncio. Esta política
-- restritiva impede forjar o campo novo ao criar um pedido diretamente pela API.
create policy "Inserção não forja contraproposta" on public.book_requests
  as restrictive for insert to authenticated
  with check (counter_listing_id is null);

-- 6. Preserva a transição anterior, bloqueando a decisão original durante a resposta.
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

  if req.status = 'pending' and req.counter_listing_id is not null
     and next_status in ('accepted', 'rejected') then
    raise exception 'invalid_transition';
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

