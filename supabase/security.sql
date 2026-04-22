-- Production security hardening for Supabase
-- Keep the anon key public in the browser, but protect all writes with RLS.

alter table if exists public.peripherals enable row level security;
alter table if exists public.blog_posts enable row level security;
alter table if exists public.admin_profiles enable row level security;

create or replace function public.is_webmaster(user_id uuid default auth.uid())
returns boolean
language sql
stable
as $$
	select exists(
		select 1
		from public.admin_profiles
		where id = user_id
			and role = 'webmaster'
	);
$$;

create or replace function public.admin_has_permission(permission_key text, user_id uuid default auth.uid())
returns boolean
language sql
stable
as $$
	select exists(
		select 1
		from public.admin_profiles
		where id = user_id
			and (
				role = 'webmaster'
				or coalesce((permissions ->> permission_key)::boolean, false)
			)
	);
$$;

drop policy if exists "Peripherals are publicly readable" on public.peripherals;
drop policy if exists "Peripherals can be inserted" on public.peripherals;
drop policy if exists "Peripherals can be updated" on public.peripherals;
drop policy if exists "Peripherals can be deleted" on public.peripherals;

create policy "Peripherals are publicly readable"
on public.peripherals
for select
using (true);

create policy "Peripherals can be inserted by authenticated users"
on public.peripherals
for insert
to authenticated
with check (public.admin_has_permission('peripherals_write'));

create policy "Peripherals can be updated by authenticated users"
on public.peripherals
for update
to authenticated
using (public.admin_has_permission('peripherals_write'))
with check (public.admin_has_permission('peripherals_write'));

create policy "Peripherals can be deleted by authenticated users"
on public.peripherals
for delete
to authenticated
using (public.admin_has_permission('peripherals_write'));

drop policy if exists "Blog posts are publicly readable" on public.blog_posts;
drop policy if exists "Blog posts can be inserted" on public.blog_posts;
drop policy if exists "Blog posts can be updated" on public.blog_posts;
drop policy if exists "Blog posts can be deleted" on public.blog_posts;

create policy "Blog posts are publicly readable"
on public.blog_posts
for select
using (is_published = true);

create policy "Blog posts can be inserted by authenticated users"
on public.blog_posts
for insert
to authenticated
with check (public.admin_has_permission('blog_write'));

create policy "Blog posts can be updated by authenticated users"
on public.blog_posts
for update
to authenticated
using (public.admin_has_permission('blog_write'))
with check (public.admin_has_permission('blog_write'));

create policy "Blog posts can be deleted by authenticated users"
on public.blog_posts
for delete
to authenticated
using (public.admin_has_permission('blog_write'));

drop policy if exists "Admin profiles are publicly readable" on public.admin_profiles;
drop policy if exists "Admin profiles can be inserted by owner" on public.admin_profiles;
drop policy if exists "Admin profiles can be updated by owner" on public.admin_profiles;
drop policy if exists "Admin profiles can be deleted by owner" on public.admin_profiles;
drop policy if exists "Admin profiles public display info readable" on public.admin_profiles;

-- Allow public read access to display info (name and avatar) for any admin profile
create policy "Admin profiles public display info readable"
on public.admin_profiles
for select
using (true);

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

-- Keep the bucket public for reads, but never allow unauthenticated uploads.
alter table if exists storage.objects enable row level security;

drop policy if exists "Public read access" on storage.objects;
drop policy if exists "Public upload access" on storage.objects;

create policy "Public read access"
on storage.objects
for select
using (bucket_id = 'peripherals');

create policy "Authenticated upload access"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'peripherals');

create policy "Authenticated update access"
on storage.objects
for update
to authenticated
using (bucket_id = 'peripherals')
with check (bucket_id = 'peripherals');

create policy "Authenticated delete access"
on storage.objects
for delete
to authenticated
using (bucket_id = 'peripherals');