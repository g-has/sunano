-- Blog posts linked to peripherals
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  peripheral_id uuid not null references public.peripherals(id) on delete cascade,
  title text not null,
  slug text not null unique,
  excerpt text,
  cover_image_url text,
  video_url text,
  content text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
