-- ADR 0023 — Excluir a própria conta pelo app (issue #47, Figma 07.09 e 07.17).
-- Aplicar no SQL Editor do Supabase ou com `supabase db push`, depois das outras migrações.
--
-- Apagar a pessoa em auth.users leva junto, por "on delete cascade", anúncios, pedidos,
-- mensagens, avisos, preferências, bloqueios, denúncias feitas e o perfil. As capas ficam no
-- Storage e são removidas pelo app antes de chamar esta função (política "Pessoa remove as
-- próprias capas"), porque o Supabase não deixa apagar arquivos do Storage por SQL.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'É preciso estar na conta para excluí-la.' using errcode = '28000';
  end if;
  delete from auth.users where id = me;
end;
$$;

-- Só a própria pessoa, autenticada, pode chamar. A chave service_role nunca vai para o app.
revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
