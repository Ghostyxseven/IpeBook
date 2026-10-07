-- Perfil com o bairro de quem usa o app (Figma 01.17 Seu bairro e 11.01 Escolher bairro).
-- Aplicar no SQL Editor do Supabase ou com `supabase db push`, depois da migração do catálogo
-- (usa a função public.touch_updated_at).

create table if not exists public.profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  -- Só o bairro aparece nos anúncios; o endereço nunca é pedido nem guardado.
  neighborhood text check (neighborhood is null or length(trim(neighborhood)) between 2 and 60),
  city text not null default 'Piripiri' check (city = 'Piripiri'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "Pessoa lê o próprio perfil" on public.profiles;
create policy "Pessoa lê o próprio perfil" on public.profiles
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Pessoa cria o próprio perfil" on public.profiles;
create policy "Pessoa cria o próprio perfil" on public.profiles
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Pessoa altera o próprio perfil" on public.profiles;
create policy "Pessoa altera o próprio perfil" on public.profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- O app grava só o bairro; a cidade é fixa enquanto o IpêBook atende apenas Piripiri.
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant insert (neighborhood) on public.profiles to authenticated;
grant update (neighborhood) on public.profiles to authenticated;
