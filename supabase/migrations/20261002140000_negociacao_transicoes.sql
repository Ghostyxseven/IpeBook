-- ADR 0018 — Transições da negociação no banco (issue #54).
-- Aplicar depois de `20261002125000_book_requests.sql` e de `20261002120000_notificacoes.sql`.
-- Aplicar no SQL Editor do Supabase ou com `supabase db push`.

-- 1. No máximo uma solicitação ativa (pendente ou aceita) por pessoa e anúncio.
create unique index if not exists book_requests_one_active_idx
  on public.book_requests (listing_id, requester_id)
  where status in ('pending', 'accepted');

-- 2. Só dá para pedir um anúncio disponível que não é seu.
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
    )
  );

-- 3. O app não atualiza mais a tabela diretamente: toda mudança de situação passa pela
--    função `transition_book_request`, que confere quem pode fazer o quê.
drop policy if exists "Envolvidos atualizam a própria negociação" on public.book_requests;

-- 4. Quem pediu continua lendo o anúncio depois de reservado ou concluído.
--    A função evita recursão entre as políticas de `listings` e `book_requests`.
create or replace function public.my_requested_listing_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select listing_id from public.book_requests where requester_id = (select auth.uid());
$$;

revoke execute on function public.my_requested_listing_ids() from public, anon;
grant execute on function public.my_requested_listing_ids() to authenticated;

drop policy if exists "Envolvidos na negociação leem o anúncio" on public.listings;
create policy "Envolvidos na negociação leem o anúncio" on public.listings
  for select to authenticated
  using (id in (select public.my_requested_listing_ids()));

-- 5. Muda a situação da solicitação e do anúncio na mesma transação.
--    Erros: 42501 (sem permissão), P0002 (não encontrada), P0001 'invalid_transition'.
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
    -- Os outros pedidos pendentes do mesmo livro são recusados.
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

-- 6. Avisos da negociação (ADR 0011 de notificações). Cancelamento não gera aviso,
--    porque `notifications.kind` ainda não tem esse tipo.
create or replace function public.notify_book_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  lst public.listings;
begin
  select * into lst from public.listings where id = new.listing_id;

  if tg_op = 'INSERT' then
    perform public.create_notification(
      lst.owner_id, 'request_received', 'Novo pedido para “' || lst.title || '”',
      'Alguém quer combinar a entrega do seu livro.', lst.id);
  elsif new.status is distinct from old.status then
    if new.status = 'accepted' then
      perform public.create_notification(
        new.requester_id, 'request_accepted', 'Pedido aceito: “' || lst.title || '”',
        'O encontro está combinado e o livro ficou reservado para você.', lst.id);
    elsif new.status = 'rejected' then
      perform public.create_notification(
        new.requester_id, 'request_declined', 'Pedido recusado: “' || lst.title || '”',
        'Quem anunciou não pôde aceitar desta vez.', lst.id);
    elsif new.status = 'completed' then
      perform public.create_notification(
        new.requester_id, 'deal_completed', 'Negociação concluída: “' || lst.title || '”',
        'A entrega foi confirmada por quem anunciou.', lst.id);
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.notify_book_request() from public, anon, authenticated;

drop trigger if exists book_requests_notify on public.book_requests;
create trigger book_requests_notify
  after insert or update of status on public.book_requests
  for each row execute function public.notify_book_request();
