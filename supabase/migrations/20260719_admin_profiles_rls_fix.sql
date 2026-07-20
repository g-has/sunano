-- A migração anterior (20260718_security_hardening.sql) tentou remover a
-- policy pública de SELECT em admin_profiles pelo nome usado em
-- supabase/security.sql, mas o banco de produção tinha uma policy
-- equivalente com outro nome (provavelmente criada manualmente pelo painel
-- do Supabase), então o DROP POLICY IF EXISTS não pegou nada e o e-mail/
-- role/permissions de admins continuaram públicos. Corrige de forma
-- resiliente: remove TODAS as policies existentes na tabela (sejam quais
-- forem os nomes) e recria apenas as pretendidas.

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'admin_profiles'
  loop
    execute format('drop policy %I on public.admin_profiles', pol.policyname);
  end loop;
end $$;

create policy "Admin profiles readable by owner or webmaster"
on public.admin_profiles
for select
to authenticated
using (auth.uid() = id or public.is_webmaster());

create policy "Admin profiles can be inserted by owner"
on public.admin_profiles
for insert
to authenticated
with check (auth.uid() = id or public.is_webmaster());

create policy "Admin profiles can be updated by owner"
on public.admin_profiles
for update
to authenticated
using (auth.uid() = id or public.is_webmaster())
with check (auth.uid() = id or public.is_webmaster());

create policy "Admin profiles can be deleted by owner"
on public.admin_profiles
for delete
to authenticated
using (auth.uid() = id or public.is_webmaster());
