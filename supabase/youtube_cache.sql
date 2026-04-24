-- Cache persistente para snapshot diário de vídeos/playlists do YouTube
create table if not exists public.youtube_cache_snapshots (
  cache_key text primary key,
  payload jsonb not null,
  fetched_at timestamptz not null default now(),
  source text not null default 'youtube_api',
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_youtube_cache_fetched_at
  on public.youtube_cache_snapshots(fetched_at desc);

create or replace function public.set_youtube_cache_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists youtube_cache_updated_at_trigger on public.youtube_cache_snapshots;
create trigger youtube_cache_updated_at_trigger
before update on public.youtube_cache_snapshots
for each row
execute function public.set_youtube_cache_updated_at();
