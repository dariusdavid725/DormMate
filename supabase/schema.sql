/*
  -----------------------------------------------------------------------------
  DORMMATE — Supabase schema / PostgreSQL

  In Supabase SQL Editor: select ALL of this file (Ctrl+A), then Run.
  Safe to run again on the same project (idempotent-ish):
  DROP IF EXISTS on policies / old overloads; CREATE IF NOT EXISTS tables;
  CREATE OR REPLACE on functions.

  Covers: households, household_members (incl. reward_points), profiles,
  receipts, household_tasks + complete_household_task RPC, Storage avatars,
  RLS helpers, platform super-admin (fixed email; see is_platform_super_admin),
  RPC create_household_as_owner, RPC list_household_members_for_user (list all
  members when the caller belongs to that household).
  -----------------------------------------------------------------------------
*/

-------------------------------------------------------------------------------
-- Legacy overloads removed in earlier revisions
-------------------------------------------------------------------------------
drop function if exists public.user_can_see_household (uuid);

drop function if exists public.household_created_by_current_user (uuid);

-------------------------------------------------------------------------------
-- Tables
-------------------------------------------------------------------------------
create table if not exists public.households (
  id uuid primary key default gen_random_uuid (),
  name text not null check (length (trim(name)) between 1 and 120),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now ()
);

comment on table public.households is 'Shared flat / dorm space.';

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid (),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now (),
  constraint household_members_household_user_unique unique (household_id, user_id)
);

comment on table public.household_members is 'User membership in a household.';

create index if not exists household_members_user_id_idx
  on public.household_members (user_id);

create index if not exists household_members_household_id_idx
  on public.household_members (household_id);

create index if not exists households_created_by_idx
  on public.households (created_by);

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid (),
  household_id uuid not null references public.households (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  merchant text,
  total_amount numeric (14, 2),
  currency text not null default 'EUR',
  purchased_at timestamptz,
  source_filename text,
  extraction jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now ()
);

comment on table public.receipts is 'Scanned receipts / AI extraction payloads per household.';

create index if not exists receipts_household_id_idx on public.receipts (household_id);

create index if not exists receipts_created_at_idx on public.receipts (created_at desc);

-------------------------------------------------------------------------------
-- Household tasks (chores) + reward points per member row
-------------------------------------------------------------------------------
alter table public.household_members
  add column if not exists reward_points integer not null default 0;

comment on column public.household_members.reward_points is 'Points gained by completing chores in-app; informational / playful';

create table if not exists public.household_tasks (
  id uuid primary key default gen_random_uuid (),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null check (length (trim(title)) between 1 and 140),
  notes text,
  reward_points integer not null default 10 check (reward_points >= 1 and reward_points <= 500),
  reward_label text,
  status text not null default 'open' check (status in ('open', 'done')),
  created_by uuid not null references auth.users (id) on delete cascade,
  completed_by uuid references auth.users (id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now ()
);

comment on table public.household_tasks is 'Shared flat chores — complete for reward points tracked on household_members.';

create index if not exists household_tasks_household_id_idx on public.household_tasks (household_id);

create index if not exists household_tasks_open_idx on public.household_tasks (household_id)
  where status = 'open';

-------------------------------------------------------------------------------
-- Trigger: households.updated_at
-------------------------------------------------------------------------------
create or replace function public.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now ();
  return new;
end;
$$;

drop trigger if exists households_set_updated_at on public.households;

create trigger households_set_updated_at
before update on public.households
for each row
execute procedure public.set_updated_at ();

-------------------------------------------------------------------------------
-- Profiles (display name + avatar URL; files in Storage bucket `avatars`)
-------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  updated_at timestamptz not null default now ()
);

comment on table public.profiles is 'One row per auth user; optional avatar in storage bucket avatars/{user_id}/.';

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at ();

-------------------------------------------------------------------------------
-- SECURITY DEFINER helpers (avoid RLS recursion across households ↔ members)
-------------------------------------------------------------------------------
create or replace function public.user_can_see_household (
  p_household_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_user_id is not null and (
    exists (
      select 1 from public.households h
      where h.id = p_household_id and h.created_by = p_user_id
    )
    or exists (
      select 1 from public.household_members m
      where m.household_id = p_household_id and m.user_id = p_user_id
    )
  );
$$;

revoke all on function public.user_can_see_household (uuid, uuid) from public;
grant execute on function public.user_can_see_household (uuid, uuid) to authenticated;

create or replace function public.household_is_created_by (
  p_household_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_user_id is not null and exists (
    select 1 from public.households h
    where h.id = p_household_id and h.created_by = p_user_id
  );
$$;

revoke all on function public.household_is_created_by (uuid, uuid) from public;
grant execute on function public.household_is_created_by (uuid, uuid) to authenticated;

create or replace function public.household_has_no_members (p_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.household_members m
    where m.household_id = p_household_id
  );
$$;

revoke all on function public.household_has_no_members (uuid) from public;
grant execute on function public.household_has_no_members (uuid) to authenticated;

-------------------------------------------------------------------------------
-- Platform super-admin (JWT email match — irrevocable in SQL; do not remove row)
-------------------------------------------------------------------------------
create or replace function public.is_platform_super_admin ()
returns boolean
language sql
stable
as $$
  select lower(trim(coalesce((select auth.jwt ()->>'email'), '')))
    = 'dariusdavid725@gmail.com';
$$;

revoke all on function public.is_platform_super_admin () from public;
grant execute on function public.is_platform_super_admin () to authenticated;

-------------------------------------------------------------------------------
-- RPC: create household + owner row (one transaction)
-------------------------------------------------------------------------------
create or replace function public.create_household_as_owner (p_name text)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  trimmed text;
  hid uuid;
  uid uuid;
begin
  uid := auth.uid ();

  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  trimmed := trim (both from p_name);

  if length (trimmed) < 1 or length (trimmed) > 120 then
    raise exception 'invalid household name' using errcode = '22023';
  end if;

  insert into public.households (name, created_by)
  values (trimmed, uid)
  returning id into hid;

  insert into public.household_members (household_id, user_id, role)
  values (hid, uid, 'owner');

  return hid;
end;
$$;

revoke all on function public.create_household_as_owner (text) from public;
grant execute on function public.create_household_as_owner (text) to authenticated;

-------------------------------------------------------------------------------
-- RPC: list members (caller must be in that household; definer read)
-------------------------------------------------------------------------------
drop function if exists public.list_household_members_for_user (uuid);

create or replace function public.list_household_members_for_user (p_household_id uuid)
returns table (
  user_id uuid,
  role text,
  joined_at timestamptz,
  display_name text,
  avatar_url text,
  reward_points integer
)
language sql
stable
security definer
set search_path = public
as $$
  select m.user_id,
         m.role::text as role,
         m.joined_at,
         p.display_name,
         p.avatar_url,
         m.reward_points
  from public.household_members m
  left join public.profiles p on p.id = m.user_id
  where m.household_id = p_household_id
    and exists (
      select 1
      from public.household_members self
      where self.household_id = m.household_id
        and self.user_id = auth.uid ()
    );
$$;

revoke all on function public.list_household_members_for_user (uuid) from public;
grant execute on function public.list_household_members_for_user (uuid) to authenticated;

-------------------------------------------------------------------------------
-- RPC: mark chore done + credit reward points (atomic)
-------------------------------------------------------------------------------
create or replace function public.complete_household_task (p_task_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  t public.household_tasks%rowtype;
  uid uuid := auth.uid ();
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select ht.*
    into t
    from public.household_tasks ht
   where ht.id = p_task_id
     and public.user_can_see_household (ht.household_id, uid)
   for update;

  if not found then
    raise exception 'task not found' using errcode = '42501';
  end if;

  if t.status <> 'open' then
    return;
  end if;

  update public.household_tasks
     set status = 'done',
         completed_by = uid,
         completed_at = now ()
   where id = p_task_id;

  update public.household_members
     set reward_points = reward_points + t.reward_points
   where household_id = t.household_id
     and user_id = uid;
end;
$$;

revoke all on function public.complete_household_task (uuid) from public;
grant execute on function public.complete_household_task (uuid) to authenticated;

-------------------------------------------------------------------------------
-- RLS + policies
-------------------------------------------------------------------------------
alter table public.households enable row level security;
alter table public.household_members enable row level security;

drop policy if exists households_select_own on public.households;
create policy households_select_own on public.households
for select to authenticated using (
  public.user_can_see_household (id, (select auth.uid ()))
  or public.is_platform_super_admin ()
);

drop policy if exists households_insert_self_created on public.households;
create policy households_insert_self_created on public.households
for insert to authenticated
with check (created_by = (select auth.uid ()));

drop policy if exists households_update_creator on public.households;
create policy households_update_creator on public.households
for update to authenticated
using (created_by = (select auth.uid ()))
with check (created_by = (select auth.uid ()));

drop policy if exists households_delete_creator on public.households;
create policy households_delete_creator on public.households
for delete to authenticated
using (created_by = (select auth.uid ()));

drop policy if exists hm_select_related on public.household_members;
drop policy if exists hm_select_own on public.household_members;
drop policy if exists hm_select_visible on public.household_members;
create policy hm_select_visible on public.household_members
for select to authenticated
using (
  public.user_can_see_household (household_id, (select auth.uid ()))
  or public.is_platform_super_admin ()
);

drop policy if exists hm_insert_first_owner_only on public.household_members;
create policy hm_insert_first_owner_only on public.household_members
for insert to authenticated
with check (
  user_id = (select auth.uid ())
  and role = 'owner'
  and public.household_is_created_by (
    household_members.household_id,
    (select auth.uid ())
  )
  and public.household_has_no_members (household_members.household_id)
);

alter table public.receipts enable row level security;

drop policy if exists receipts_select_visible on public.receipts;
create policy receipts_select_visible on public.receipts
for select to authenticated using (
  public.user_can_see_household (household_id, (select auth.uid ()))
  or public.is_platform_super_admin ()
);

drop policy if exists receipts_insert_member on public.receipts;
create policy receipts_insert_member on public.receipts
for insert to authenticated
with check (
  created_by = (select auth.uid ())
  and public.user_can_see_household (household_id, (select auth.uid ()))
);

alter table public.household_tasks enable row level security;

drop policy if exists household_tasks_select_visible on public.household_tasks;
create policy household_tasks_select_visible on public.household_tasks
for select to authenticated using (
  public.user_can_see_household (household_id, (select auth.uid ()))
  or public.is_platform_super_admin ()
);

drop policy if exists household_tasks_insert_member on public.household_tasks;
create policy household_tasks_insert_member on public.household_tasks
for insert to authenticated
with check (
  created_by = (select auth.uid ())
  and public.user_can_see_household (household_id, (select auth.uid ()))
);

alter table public.profiles enable row level security;

drop policy if exists profiles_select_peers on public.profiles;
create policy profiles_select_peers on public.profiles
for select to authenticated using (
  public.is_platform_super_admin ()
  or id = (select auth.uid ())
  or exists (
    select 1
    from public.household_members m1
    inner join public.household_members m2
      on m1.household_id = m2.household_id
    where m1.user_id = (select auth.uid ())
      and m2.user_id = profiles.id
  )
);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
for insert to authenticated
with check (id = (select auth.uid ()));

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update to authenticated
using (id = (select auth.uid ()))
with check (id = (select auth.uid ()));

-------------------------------------------------------------------------------
-- Table grants
-------------------------------------------------------------------------------
grant select, insert, update, delete on public.households to authenticated;
grant select, insert on public.household_members to authenticated;
grant select, insert on public.receipts to authenticated;
grant select, insert on public.household_tasks to authenticated;
grant select, insert, update on public.profiles to authenticated;

-------------------------------------------------------------------------------
-- Storage: bucket `avatars` (run Storage → Create bucket if insert fails)
-------------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
for select using (bucket_id = 'avatars');

drop policy if exists avatars_insert_own on storage.objects;
create policy avatars_insert_own on storage.objects
for insert to authenticated
with check (
  bucket_id = 'avatars'
  and split_part (name, '/', 1) = (select auth.uid ())::text
);

drop policy if exists avatars_update_own on storage.objects;
create policy avatars_update_own on storage.objects
for update to authenticated
using (
  bucket_id = 'avatars'
  and split_part (name, '/', 1) = (select auth.uid ())::text
);

drop policy if exists avatars_delete_own on storage.objects;
create policy avatars_delete_own on storage.objects
for delete to authenticated
using (
  bucket_id = 'avatars'
  and split_part (name, '/', 1) = (select auth.uid ())::text
);

-------------------------------------------------------------------------------
-- Auth: profile row on signup (optional — skip if your project disallows triggers on auth.users)
-------------------------------------------------------------------------------
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
execute procedure public.handle_new_user ();
