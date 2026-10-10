-- ADR 0034 — Painel de moderação de denúncias (spec 036).
-- Aplicar no SQL Editor do Supabase ou com `supabase db push`.

-- 1. Verifica se o usuário possui permissão de moderador.
create or replace function public.is_moderator(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    where u.id = user_id
      and (
        coalesce(u.raw_app_meta_data ->> 'role', '') in ('moderator', 'admin')
        or coalesce(u.raw_user_meta_data ->> 'is_moderator', 'false') = 'true'
      )
  );
$$;

revoke all on function public.is_moderator(uuid) from public, anon;
grant execute on function public.is_moderator(uuid) to authenticated;

-- 2. Lista as denúncias com o contexto de denunciante e alvo.
create or replace function public.admin_list_reports(p_status text default null)
returns table (
  id uuid,
  reporter_id uuid,
  reporter_first_name text,
  reported_user_id uuid,
  reported_user_first_name text,
  reported_listing_id uuid,
  reported_listing_title text,
  reason text,
  details text,
  status text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null or not public.is_moderator(me) then
    raise exception 'Acesso restrito a moderadores.' using errcode = '42501';
  end if;

  return query
  select
    r.id,
    r.reporter_id,
    public.listing_owner_first_name(r.reporter_id) as reporter_first_name,
    r.reported_user_id,
    public.listing_owner_first_name(r.reported_user_id) as reported_user_first_name,
    r.reported_listing_id,
    l.title as reported_listing_title,
    r.reason,
    r.details,
    r.status,
    r.created_at
  from public.reports r
  left join public.listings l on l.id = r.reported_listing_id
  where (p_status is null or r.status = p_status)
  order by r.created_at desc;
end;
$$;

revoke all on function public.admin_list_reports(text) from public, anon;
grant execute on function public.admin_list_reports(text) to authenticated;

-- 3. Transiciona a denúncia para 'resolved'.
create or replace function public.admin_resolve_report(p_report_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null or not public.is_moderator(me) then
    raise exception 'Acesso restrito a moderadores.' using errcode = '42501';
  end if;

  update public.reports
  set status = 'resolved'
  where id = p_report_id;

  if not found then
    raise exception 'Denúncia não encontrada.' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.admin_resolve_report(uuid) from public, anon;
grant execute on function public.admin_resolve_report(uuid) to authenticated;
