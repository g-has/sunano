-- Hardening de segurança (auditoria 2026-07-18).
-- Corrige RLS excessivamente permissiva e RPCs SECURITY DEFINER chamáveis
-- por qualquer role. Todo o app já acessa essas tabelas via o cliente
-- service-role em lib/server/repositories/**, então nenhuma dessas
-- restrições quebra funcionalidade existente (confirmado por grep: não há
-- nenhum `.from(...)` direto no client-side do app).

-- ────────────────────────────────────────────
-- 1. user_profiles: parava de expor CPF/telefone/endereço publicamente
-- ────────────────────────────────────────────
drop policy if exists "User profiles are publicly readable" on public.user_profiles;

-- Mantém apenas "Users can manage their own profile" (auth.uid() = id),
-- já existente em supabase/forum_v2.sql — cobre select/insert/update/delete
-- do próprio dono.

-- ────────────────────────────────────────────
-- 2. admin_profiles: para de expor email/role/permissions de admins
-- ────────────────────────────────────────────
drop policy if exists "Admin profiles public display info readable" on public.admin_profiles;

create policy "Admin profiles readable by owner or webmaster"
on public.admin_profiles
for select
to authenticated
using (auth.uid() = id or public.is_webmaster());

-- ────────────────────────────────────────────
-- 3. storage.objects (bucket "peripherals"): não permite mais que qualquer
--    usuário autenticado grave/edite/apague qualquer arquivo no bucket.
--    Restringe a exatamente os padrões de nome usados pelas rotas legítimas:
--      user-avatar-<uid>-*   -> qualquer usuário, só o próprio avatar
--      admin-avatar-<uid>-*  -> qualquer admin, só o próprio avatar
--      blog-cover-*          -> só quem tem permissão blog_write
--    Upload de imagens de periféricos usa o cliente service-role (bypassa
--    RLS), então não precisa de policy aqui.
-- ────────────────────────────────────────────
drop policy if exists "Authenticated upload access" on storage.objects;
drop policy if exists "Authenticated update access" on storage.objects;
drop policy if exists "Authenticated delete access" on storage.objects;

create policy "Scoped upload access"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'peripherals'
  and (
    name like 'user-avatar-' || auth.uid()::text || '-%'
    or name like 'admin-avatar-' || auth.uid()::text || '-%'
    or (name like 'blog-cover-%' and public.admin_has_permission('blog_write'))
  )
);

create policy "Scoped update access"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'peripherals'
  and (
    name like 'user-avatar-' || auth.uid()::text || '-%'
    or name like 'admin-avatar-' || auth.uid()::text || '-%'
    or (name like 'blog-cover-%' and public.admin_has_permission('blog_write'))
  )
)
with check (
  bucket_id = 'peripherals'
  and (
    name like 'user-avatar-' || auth.uid()::text || '-%'
    or name like 'admin-avatar-' || auth.uid()::text || '-%'
    or (name like 'blog-cover-%' and public.admin_has_permission('blog_write'))
  )
);

create policy "Scoped delete access"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'peripherals'
  and (
    name like 'user-avatar-' || auth.uid()::text || '-%'
    or name like 'admin-avatar-' || auth.uid()::text || '-%'
    or (name like 'blog-cover-%' and public.admin_has_permission('blog_write'))
    or public.admin_has_permission('peripherals_write')
  )
);

-- ────────────────────────────────────────────
-- 4. offers: remove escrita irrestrita para qualquer autenticado (a tabela
--    não é mais usada pelo app — ofertas vêm do Telegram — mas segue viva
--    no banco). Escrita futura, se necessária, deve passar pelo
--    service-role client como as demais tabelas admin.
-- ────────────────────────────────────────────
drop policy if exists "Authenticated can insert offers" on public.offers;
drop policy if exists "Authenticated can update offers" on public.offers;
drop policy if exists "Authenticated can delete offers" on public.offers;

-- ────────────────────────────────────────────
-- 5. tierlist_meta: nunca teve RLS habilitado.
-- ────────────────────────────────────────────
alter table public.tierlist_meta enable row level security;

drop policy if exists "Tierlist meta is publicly readable" on public.tierlist_meta;
drop policy if exists "Tierlist meta can be updated by tier admins" on public.tierlist_meta;

create policy "Tierlist meta is publicly readable"
on public.tierlist_meta
for select
using (true);

create policy "Tierlist meta can be updated by tier admins"
on public.tierlist_meta
for update
to authenticated
using (public.admin_has_permission('tiers_write'))
with check (public.admin_has_permission('tiers_write'));

-- ────────────────────────────────────────────
-- 6. RPCs SECURITY DEFINER: hoje chamáveis por qualquer role (grant padrão
--    do Postgres para PUBLIC ao criar função). Restringe execução ao
--    service-role, que é como o app sempre as invoca.
-- ────────────────────────────────────────────
revoke execute on function public.anonymize_user_data(uuid) from public, anon, authenticated;
grant execute on function public.anonymize_user_data(uuid) to service_role;

revoke execute on function public.decrement_store_stock(uuid, integer) from public, anon, authenticated;
grant execute on function public.decrement_store_stock(uuid, integer) to service_role;
