-- Blog posts linked to peripherals
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  peripheral_id uuid not null references public.peripherals(id) on delete cascade,
  author_id uuid,
  title text not null,
  slug text not null unique,
  excerpt text,
  cover_image_url text,
  cover_thumbnail_url text,
  read_time_minutes integer not null default 1,
  video_url text,
  content text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.blog_posts
  add column if not exists cover_thumbnail_url text;

alter table if exists public.blog_posts
  add column if not exists read_time_minutes integer;

update public.blog_posts
set read_time_minutes = greatest(
  1,
  ceil(
    coalesce(
      array_length(regexp_split_to_array(trim(content), E'\\s+'), 1),
      0
    )::numeric / 200.0
  )::integer
)
where read_time_minutes is null or read_time_minutes < 1;

alter table if exists public.blog_posts
  alter column read_time_minutes set default 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'blog_posts_read_time_minutes_check'
  ) then
    alter table public.blog_posts
      add constraint blog_posts_read_time_minutes_check
      check (read_time_minutes >= 1);
  end if;
end;
$$;

create table if not exists public.admin_profiles (
  id uuid primary key,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.blog_posts
  add column if not exists author_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'blog_posts_author_id_fkey'
  ) then
    alter table public.blog_posts
      add constraint blog_posts_author_id_fkey
      foreign key (author_id)
      references public.admin_profiles(id)
      on delete set null;
  end if;
end;
$$;

create index if not exists idx_blog_posts_author_id on public.blog_posts(author_id);

create index if not exists idx_blog_posts_peripheral_id on public.blog_posts(peripheral_id);
create index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_blog_posts_published on public.blog_posts(is_published);

create or replace function public.set_blog_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
before update on public.blog_posts
for each row
execute function public.set_blog_posts_updated_at();

create or replace function public.set_admin_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_admin_profiles_updated_at on public.admin_profiles;
create trigger trg_admin_profiles_updated_at
before update on public.admin_profiles
for each row
execute function public.set_admin_profiles_updated_at();
