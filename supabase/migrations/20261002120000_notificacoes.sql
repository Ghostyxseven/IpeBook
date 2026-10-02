-- ADR 0011 — Notificações dentro do aplicativo. Spec 024.
-- Aplicar no SQL Editor do Supabase ou com `supabase db push`, depois da migração do catálogo.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in (
    'request_received', 'request_accepted', 'request_declined', 'listing_reserved', 'deal_completed'
  )),
  title text not null check (length(trim(title)) > 0),
  body text not null default '',
  target_listing_id uuid references public.listings (id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_recent_idx
  on public.notifications (user_id, created_at desc, id desc);
create index if not exists notifications_unread_idx
  on public.notifications (user_id) where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists "Pessoa lê os próprios avisos" on public.notifications;
create policy "Pessoa lê os próprios avisos" on public.notifications
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Pessoa marca os próprios avisos como lidos" on public.notifications;
create policy "Pessoa marca os próprios avisos como lidos" on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- O app só altera `read_at`; criar ou apagar avisos é feito por gatilhos do banco.
revoke insert, delete on public.notifications from anon, authenticated;
revoke update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;

-- Um booleano por tipo de aviso; ausência de linha equivale a tudo ligado.
create table if not exists public.notification_preferences (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  request_received boolean not null default true,
  request_accepted boolean not null default true,
  request_declined boolean not null default true,
  listing_reserved boolean not null default true,
  deal_completed boolean not null default true,
  updated_at timestamptz not null default now()
);

drop trigger if exists notification_preferences_touch_updated_at on public.notification_preferences;
create trigger notification_preferences_touch_updated_at
  before update on public.notification_preferences
  for each row execute function public.touch_updated_at();

alter table public.notification_preferences enable row level security;

drop policy if exists "Pessoa lê as próprias preferências" on public.notification_preferences;
create policy "Pessoa lê as próprias preferências" on public.notification_preferences
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Pessoa cria as próprias preferências" on public.notification_preferences;
create policy "Pessoa cria as próprias preferências" on public.notification_preferences
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Pessoa altera as próprias preferências" on public.notification_preferences;
create policy "Pessoa altera as próprias preferências" on public.notification_preferences
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Cria um aviso respeitando a preferência de quem vai recebê-lo. Os gatilhos da negociação
-- (issue #38) chamam esta função; o app não tem permissão para executá-la.
create or replace function public.create_notification(
  recipient uuid,
  notification_kind text,
  notification_title text,
  notification_body text default '',
  listing uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  enabled boolean;
  created uuid;
begin
  if notification_kind not in (
    'request_received', 'request_accepted', 'request_declined', 'listing_reserved', 'deal_completed'
  ) then
    raise exception 'Tipo de aviso inválido: %', notification_kind;
  end if;

  select coalesce((to_jsonb(p) ->> notification_kind)::boolean, true)
    into enabled
    from public.notification_preferences p
    where p.user_id = recipient;
  if coalesce(enabled, true) is false then
    return null;
  end if;

  insert into public.notifications (user_id, kind, title, body, target_listing_id)
  values (recipient, notification_kind, notification_title, notification_body, listing)
  returning id into created;
  return created;
end;
$$;

revoke execute on function public.create_notification(uuid, text, text, text, uuid)
  from public, anon, authenticated;
