-- ADR 0036 / spec 039. Migração aditiva; aplicar antes do cliente com mapas.
begin;
create or replace function public.valid_meeting_point(point jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
begin
  if point is null then return true; end if;
  if jsonb_typeof(point) <> 'object' then return false; end if;
  if (select count(*) from jsonb_object_keys(point)) <> 3 then return false; end if;
  if jsonb_typeof(point->'name') is distinct from 'string'
    or jsonb_typeof(point->'latitude') is distinct from 'number'
    or jsonb_typeof(point->'longitude') is distinct from 'number' then return false; end if;
  return length(trim(point->>'name')) between 1 and 160
    and (point->>'latitude')::numeric between -85 and 85
    and (point->>'longitude')::numeric between -180 and 180;
end;
$$;
alter table public.listings add column meeting_point jsonb;
alter table public.listings add constraint listings_valid_meeting_point
  check (public.valid_meeting_point(meeting_point));
alter table public.book_requests add column meeting_point jsonb;
alter table public.book_requests add constraint requests_valid_meeting_point
  check (public.valid_meeting_point(meeting_point) and
    (meeting_point is null or (public_location is not null and trim(public_location) = trim(meeting_point->>'name'))));
comment on column public.listings.meeting_point is 'Ponto público escolhido explicitamente. Não usar GPS nem endereço pessoal.';
comment on column public.book_requests.meeting_point is 'Cópia do ponto público da proposta; não muda com o anúncio.';

-- Clientes anteriores que mudam só o texto não deixam coordenadas antigas anexadas.
create or replace function public.clear_changed_meeting_point()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.public_location is distinct from old.public_location
    and new.meeting_point is not distinct from old.meeting_point then
    new.meeting_point := null;
  end if;
  return new;
end;
$$;
create trigger book_requests_clear_changed_point before update on public.book_requests
for each row execute function public.clear_changed_meeting_point();

create or replace view public.catalog_listings
with (security_invoker = true)
as
select
  l.id, l.title, l.author, l.category, l.modality, l.price_cents, l.trade_terms,
  l.condition, l.neighborhood, l.city, l.description, l.cover_path, l.status,
  public.listing_owner_first_name(l.owner_id) as owner_first_name,
  l.created_at, l.meeting_point
from public.listings l
where l.status in ('disponivel', 'reservado')
  and l.owner_id <> (select auth.uid())
  and l.owner_id not in (
    select blocked_id from public.user_blocks where blocker_id = (select auth.uid())
  );

revoke all on public.catalog_listings from anon;
grant select on public.catalog_listings to authenticated;

-- A função original confere participante, estado e bloqueia a linha; tudo é atômico.
create or replace function public.propose_meeting_with_point(
  request_id uuid, new_location text, new_date text, new_time text, new_point jsonb
) returns setof public.book_requests
language plpgsql security definer set search_path = '' as $$
begin
  perform public.propose_meeting(request_id, new_location, new_date, new_time);
  update public.book_requests set meeting_point = new_point where id = request_id;
  return query select * from public.book_requests where id = request_id;
end;
$$;
revoke execute on function public.propose_meeting_with_point(uuid,text,text,text,jsonb) from public, anon;
grant execute on function public.propose_meeting_with_point(uuid,text,text,text,jsonb) to authenticated;

-- A função original confere participante, estado e bloqueia a linha; tudo é atômico.
create or replace function public.reschedule_book_request_with_point(
  request_id uuid, new_location text, new_date text, new_time text, new_point jsonb
) returns setof public.book_requests
language plpgsql security definer set search_path = '' as $$
begin
  perform public.reschedule_book_request(request_id, new_location, new_date, new_time);
  update public.book_requests set meeting_point = new_point where id = request_id;
  return query select * from public.book_requests where id = request_id;
end;
$$;
revoke execute on function public.reschedule_book_request_with_point(uuid,text,text,text,jsonb) from public, anon;
grant execute on function public.reschedule_book_request_with_point(uuid,text,text,text,jsonb) to authenticated;

commit;
