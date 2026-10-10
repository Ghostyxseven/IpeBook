-- ADR 0035 — Conversar antes do encontro (issue #54, continuação da spec 037).
-- Aplicar depois de `20261003130000_negociacao_completa.sql`.
-- Aplicar no SQL Editor do Supabase ou com `supabase db push`.

-- 1. Local, dia e horário deixam de ser obrigatórios na criação: "Conversar" cria a
--    negociação sem encontro nenhum, só para abrir o chat. Os `check` de formato já
--    passam sozinhos quando o valor é nulo (regra padrão do Postgres), então não
--    precisam mudar.
alter table public.book_requests alter column public_location drop not null;
alter table public.book_requests alter column meeting_date drop not null;
alter table public.book_requests alter column meeting_time drop not null;

-- 2. Propor o encontro de uma negociação pendente sem encontro ainda — o espelho de
--    `reschedule_book_request`, mas para ANTES do aceite (`pending` com os três campos
--    nulos) em vez de depois (`accepted`). Qualquer um dos dois lados pode propor;
--    quem recebe decide aceitar só depois de ver a proposta (regra 3 abaixo).
create or replace function public.propose_meeting(
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
  if req.status <> 'pending' or req.public_location is not null then
    raise exception 'invalid_transition';
  end if;

  update public.book_requests
    set public_location = new_location, meeting_date = new_date, meeting_time = new_time
    where id = req.id;

  return query select * from public.book_requests where id = req.id;
end;
$$;

revoke execute on function public.propose_meeting(uuid, text, text, text) from public, anon;
grant execute on function public.propose_meeting(uuid, text, text, text) to authenticated;

-- 3. Sem isso, dava para aceitar uma negociação que ainda não tem onde, quando nem
--    horário combinados — "aceitar" vira um encontro às cegas. A regra mora no banco,
--    não só na tela (mesmo padrão do ADR 0027 para avaliações).
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
    if next_status = 'accepted' and req.public_location is null then
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
  elsif next_status = 'completed' then
    update public.listings set status = 'concluido' where id = lst.id;
  elsif next_status = 'canceled' and req.status = 'accepted' and lst.status = 'reservado' then
    update public.listings set status = 'disponivel' where id = lst.id;
  end if;

  return query select * from public.book_requests where id = req.id;
end;
$$;

revoke execute on function public.transition_book_request(uuid, text) from public, anon;
grant execute on function public.transition_book_request(uuid, text) to authenticated;
