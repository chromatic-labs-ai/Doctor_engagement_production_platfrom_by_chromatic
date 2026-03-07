create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('admin', 'ops');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'request_status') then
    create type request_status as enum (
      'form_submitted',
      'storyboard_in_progress',
      'storyboard_review',
      'changes_requested',
      'storyboard_approved',
      'video_in_progress',
      'video_delivered'
    );
  end if;
end
$$;

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role user_role not null,
  company_id uuid references companies(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint profiles_role_company_check check (
    (role = 'admin' and company_id is null) or
    (role = 'ops' and company_id is not null)
  )
);

alter table profiles drop constraint if exists profiles_check;
alter table profiles drop constraint if exists profiles_role_company_check;
alter table profiles add constraint profiles_role_company_check check (
  (role = 'admin' and company_id is null) or
  (role = 'ops' and company_id is not null)
);

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  created_by uuid not null references profiles(id) on delete restrict,
  doctor_name text not null,
  status request_status not null default 'form_submitted',
  form_data jsonb not null default '{}'::jsonb,
  storyboard_revision_count integer not null default 0,
  max_storyboard_revisions integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint requests_revision_limits_check check (
    storyboard_revision_count >= 0 and
    max_storyboard_revisions >= 0 and
    storyboard_revision_count <= max_storyboard_revisions
  )
);

create table if not exists storyboards (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  storage_path text not null,
  version integer not null default 1,
  uploaded_by uuid not null references profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (request_id, version)
);

create table if not exists storyboard_comments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete restrict,
  comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references requests(id) on delete cascade,
  storage_path text not null,
  uploaded_by uuid not null references profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

alter table requests
  add column if not exists storyboard_revision_count integer not null default 0,
  add column if not exists max_storyboard_revisions integer not null default 1;

alter table requests drop constraint if exists requests_revision_limits_check;
alter table requests add constraint requests_revision_limits_check check (
  storyboard_revision_count >= 0 and
  max_storyboard_revisions >= 0 and
  storyboard_revision_count <= max_storyboard_revisions
);

alter table storyboards add column if not exists storage_path text;
alter table storyboards add column if not exists slides jsonb;
alter table videos add column if not exists storage_path text;

create index if not exists idx_requests_company_id on requests(company_id);
create index if not exists idx_requests_doctor_name on requests(doctor_name);
create index if not exists idx_requests_status on requests(status);
create index if not exists idx_storyboards_request_id on storyboards(request_id);
create index if not exists idx_storyboard_comments_request_id on storyboard_comments(request_id);
create index if not exists idx_videos_request_id on videos(request_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists requests_set_updated_at on requests;
create trigger requests_set_updated_at
before update on requests
for each row
execute function set_updated_at();

alter table companies enable row level security;
alter table profiles enable row level security;
alter table requests enable row level security;
alter table storyboards enable row level security;
alter table storyboard_comments enable row level security;
alter table videos enable row level security;

drop policy if exists "admins_manage_companies" on companies;
drop policy if exists "admins_manage_profiles" on profiles;
drop policy if exists "users_read_own_profile" on profiles;
drop policy if exists "ops_read_company_and_admin_profiles" on profiles;
drop policy if exists "admins_manage_requests" on requests;
drop policy if exists "ops_read_company_requests" on requests;
drop policy if exists "ops_create_company_requests" on requests;
drop policy if exists "ops_update_storyboard_approved_status" on requests;
drop policy if exists "admins_manage_storyboards" on storyboards;
drop policy if exists "ops_read_storyboards_for_company" on storyboards;
drop policy if exists "admins_manage_comments" on storyboard_comments;
drop policy if exists "ops_read_comments_for_company" on storyboard_comments;
drop policy if exists "ops_insert_comments_for_company" on storyboard_comments;
drop policy if exists "admins_manage_videos" on videos;
drop policy if exists "ops_read_videos_for_company" on videos;
drop policy if exists "ops_upload_request_assets" on storage.objects;
drop policy if exists "ops_read_request_assets" on storage.objects;
drop policy if exists "admins_upload_storyboards_videos" on storage.objects;
drop policy if exists "read_storyboards_videos" on storage.objects;

create or replace function current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from profiles
  where id = auth.uid();
$$;

create or replace function current_user_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id
  from profiles
  where id = auth.uid();
$$;

create policy "admins_manage_companies"
on companies
for all
using (current_user_role() = 'admin')
with check (current_user_role() = 'admin');

create policy "admins_manage_profiles"
on profiles
for all
using (current_user_role() = 'admin')
with check (current_user_role() = 'admin');

create policy "users_read_own_profile"
on profiles
for select
using (id = auth.uid());

create policy "ops_read_company_and_admin_profiles"
on profiles
for select
using (
  current_user_role() = 'ops' and
  (
    role = 'admin' or
    company_id = current_user_company_id()
  )
);

create policy "admins_manage_requests"
on requests
for all
using (current_user_role() = 'admin')
with check (current_user_role() = 'admin');

create policy "ops_read_company_requests"
on requests
for select
using (
  current_user_role() = 'ops' and company_id = current_user_company_id()
);

create policy "ops_create_company_requests"
on requests
for insert
with check (
  current_user_role() = 'ops' and
  company_id = current_user_company_id() and
  created_by = auth.uid()
);

create policy "ops_update_storyboard_approved_status"
on requests
for update
using (
  current_user_role() = 'ops' and
  company_id = current_user_company_id() and
  status = 'storyboard_review'
)
with check (
  current_user_role() = 'ops' and
  company_id = current_user_company_id() and
  status in ('storyboard_approved', 'changes_requested')
);

create policy "admins_manage_storyboards"
on storyboards
for all
using (current_user_role() = 'admin')
with check (current_user_role() = 'admin');

create policy "ops_read_storyboards_for_company"
on storyboards
for select
using (
  exists (
    select 1
    from requests r
    where r.id = storyboards.request_id
      and r.company_id = current_user_company_id()
      and current_user_role() = 'ops'
  )
);

create policy "admins_manage_comments"
on storyboard_comments
for all
using (current_user_role() = 'admin')
with check (current_user_role() = 'admin');

create policy "ops_read_comments_for_company"
on storyboard_comments
for select
using (
  exists (
    select 1
    from requests r
    where r.id = storyboard_comments.request_id
      and r.company_id = current_user_company_id()
      and current_user_role() = 'ops'
  )
);

create policy "ops_insert_comments_for_company"
on storyboard_comments
for insert
with check (
  user_id = auth.uid() and
  exists (
    select 1
    from requests r
    where r.id = storyboard_comments.request_id
      and r.company_id = current_user_company_id()
      and current_user_role() = 'ops'
  )
);

create policy "admins_manage_videos"
on videos
for all
using (current_user_role() = 'admin')
with check (current_user_role() = 'admin');

create policy "ops_read_videos_for_company"
on videos
for select
using (
  exists (
    select 1
    from requests r
    where r.id = videos.request_id
      and r.company_id = current_user_company_id()
      and current_user_role() = 'ops'
  )
);

insert into storage.buckets (id, name, public)
values ('storyboards', 'storyboards', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('request-assets', 'request-assets', false)
on conflict (id) do nothing;

create policy "ops_upload_request_assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'request-assets' and
  split_part(name, '/', 1) = current_user_company_id()::text
);

create policy "ops_read_request_assets"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'request-assets' and (
    current_user_role() = 'admin' or
    split_part(name, '/', 1) = current_user_company_id()::text
  )
);

create policy "admins_upload_storyboards_videos"
on storage.objects
for insert
to authenticated
with check (
  current_user_role() = 'admin' and
  bucket_id in ('storyboards', 'videos')
);

create policy "read_storyboards_videos"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('storyboards', 'videos') and
  (
    current_user_role() = 'admin' or
    exists (
      select 1
      from requests r
      where r.id::text = split_part(name, '/', 1)
        and r.company_id = current_user_company_id()
        and current_user_role() = 'ops'
    )
  )
);
