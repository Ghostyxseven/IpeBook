-- Issue #53 — Avaliações, perfil público e histórico (spec 031, ADR 0027).
-- Aplicar depois de `20261003130000_negociacao_completa.sql`.
-- Aplicar no SQL Editor do Supabase ou com `supabase db push`.

-- 1. A avaliação de uma negociação concluída.
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.book_requests (id) on delete cascade,
  -- Quem escreve é sempre quem está na sessão; a RLS não deixa ser outro.
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_id uuid not null references auth.users (id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  comment text check (comment is null or length(trim(comment)) between 3 and 280),
  created_at timestamptz not null default now(),
  -- Uma avaliação por pessoa por negociação: duas pessoas, duas avaliações, nunca mais.
  unique (request_id, author_id),
  -- Ninguém avalia a si mesmo.
  constraint ratings_author_difere_do_avaliado check (author_id <> subject_id)
);

create index if not exists ratings_subject_idx on public.ratings (subject_id, created_at desc);

alter table public.ratings enable row level security;

-- 2. Quem pode escrever: os dois lados de uma negociação CONCLUÍDA, um sobre o outro.
--    A função existe para a política não repetir o mesmo `join` duas vezes.
-- Prefixo `p_` nos parâmetros: sem ele, `author` colide com a coluna
-- `listings.author` (o autor do livro, texto) trazida pelo `join`, e o Postgres
-- resolve o nome para a coluna, não o parâmetro — daí o erro "uuid = text".
create or replace function public.can_rate(p_request_id uuid, p_author uuid, p_subject uuid)
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
    where r.id = p_request_id
      and r.status = 'completed'
      -- Quem avalia é um dos dois lados, e avalia exatamente o outro.
      and (
        (r.requester_id = p_author and l.owner_id = p_subject)
        or (l.owner_id = p_author and r.requester_id = p_subject)
      )
  );
$$;

revoke execute on function public.can_rate(uuid, uuid, uuid) from public, anon;
grant execute on function public.can_rate(uuid, uuid, uuid) to authenticated;

drop policy if exists "Participante avalia o outro lado" on public.ratings;
create policy "Participante avalia o outro lado" on public.ratings
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and public.can_rate(request_id, (select auth.uid()), subject_id)
  );

-- A reputação é pública para quem está logado: é esse o ponto dela.
drop policy if exists "Avaliações são públicas para quem está logado" on public.ratings;
create policy "Avaliações são públicas para quem está logado" on public.ratings
  for select to authenticated
  using (true);

-- Sem update e sem delete para ninguém (ADR 0027): reputação que se apaga não é reputação.
revoke all on public.ratings from anon;
revoke update, delete on public.ratings from authenticated;
grant select, insert on public.ratings to authenticated;

-- 3. O perfil de outra pessoa.
--    `security definer` e seis colunas: não existe caminho por aqui para e-mail,
--    bairro ou sobrenome. É por isso que é função e não `select` com `join`.
create or replace function public.public_profile(person uuid)
returns table (
  user_id uuid,
  first_name text,
  member_since timestamptz,
  completed_count integer,
  rating_average numeric,
  rating_count integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    u.id,
    public.listing_owner_first_name(u.id),
    u.created_at,
    (
      select count(*)::integer
      from public.book_requests r
      join public.listings l on l.id = r.listing_id
      where r.status = 'completed' and (r.requester_id = u.id or l.owner_id = u.id)
    ),
    -- `null` quando não há nota nenhuma: um 0 numa escala de 1 a 5 seria uma
    -- nota ruim dada a quem nunca fez nada. O app mostra "Ainda sem avaliações".
    (select round(avg(t.score)::numeric, 1) from public.ratings t where t.subject_id = u.id),
    (select count(*)::integer from public.ratings t where t.subject_id = u.id)
  from auth.users u
  where u.id = person and u.deleted_at is null;
$$;

revoke execute on function public.public_profile(uuid) from public, anon;
grant execute on function public.public_profile(uuid) to authenticated;

-- 4. As avaliações que uma pessoa recebeu, com o primeiro nome de quem escreveu.
create or replace function public.ratings_received(person uuid)
returns table (
  id uuid,
  author_first_name text,
  score smallint,
  comment text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    t.id,
    public.listing_owner_first_name(t.author_id),
    t.score,
    t.comment,
    t.created_at
  from public.ratings t
  where t.subject_id = person
  order by t.created_at desc
  limit 50;
$$;

revoke execute on function public.ratings_received(uuid) from public, anon;
grant execute on function public.ratings_received(uuid) to authenticated;

-- 5. O histórico de quem chama. Sempre o próprio: `auth.uid()` não é parâmetro.
create or replace function public.my_history()
returns table (
  request_id uuid,
  listing_id uuid,
  title text,
  author text,
  modality text,
  cover_path text,
  other_person_id uuid,
  other_first_name text,
  i_was_owner boolean,
  rated boolean,
  completed_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    r.id,
    l.id,
    l.title,
    l.author,
    l.modality,
    l.cover_path,
    case when l.owner_id = (select auth.uid()) then r.requester_id else l.owner_id end,
    public.listing_owner_first_name(
      case when l.owner_id = (select auth.uid()) then r.requester_id else l.owner_id end
    ),
    l.owner_id = (select auth.uid()),
    exists (
      select 1 from public.ratings t
      where t.request_id = r.id and t.author_id = (select auth.uid())
    ),
    r.updated_at
  from public.book_requests r
  join public.listings l on l.id = r.listing_id
  where r.status = 'completed'
    and (r.requester_id = (select auth.uid()) or l.owner_id = (select auth.uid()))
  order by r.updated_at desc;
$$;

revoke execute on function public.my_history() from public, anon;
grant execute on function public.my_history() to authenticated;
