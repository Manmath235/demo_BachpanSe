-- BachpanSe backend schema. Run once in the Supabase SQL editor.
--
-- Before running:
--   Authentication -> Providers -> enable "Anonymous sign-ins" (used by the PWA, one identity per device).
-- After running:
--   1. Authentication -> Users -> "Add user" (email + password) for each content admin.
--   2. Make them admins:  insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Learning content authored in the admin panel and read by the PWA.
create table if not exists public.content_items (
  kind text not null check (kind in ('module', 'lesson', 'quiz', 'challenge')),
  id text not null,
  status text not null check (status in ('published', 'draft')),
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (kind, id)
);

-- One row per PWA install: the family's progress, shown read-only in the admin panel.
create table if not exists public.families (
  owner uuid primary key references auth.users (id) on delete cascade,
  phone text not null default '',
  parent_name text not null default '',
  child_name text not null default '',
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.admins enable row level security;
alter table public.content_items enable row level security;
alter table public.families enable row level security;

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins
  for select using (user_id = auth.uid());

-- Everyone (the PWA) sees published content; admins see drafts too and are the only writers.
drop policy if exists "content read" on public.content_items;
create policy "content read" on public.content_items
  for select using (status = 'published' or public.is_admin());

drop policy if exists "content write" on public.content_items;
create policy "content write" on public.content_items
  for all using (public.is_admin()) with check (public.is_admin());

-- A device owns its family row; admins can read all of them.
drop policy if exists "families owner" on public.families;
create policy "families owner" on public.families
  for all using (owner = auth.uid()) with check (owner = auth.uid());

drop policy if exists "families admin read" on public.families;
create policy "families admin read" on public.families
  for select using (public.is_admin());

-- Live updates (admin publishes -> PWA refreshes; PWA activity -> admin dashboard).
do $$
begin
  alter publication supabase_realtime add table public.content_items;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.families;
exception when duplicate_object then null;
end $$;
