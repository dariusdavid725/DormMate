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
  invite_code text unique,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now ()
);

comment on table public.households is 'Shared flat / dorm space.';

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid (),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
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
  assigned_to uuid references auth.users (id) on delete set null,
  due_at timestamptz,
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
  gender_identity text,
  dietary_preferences text[] not null default '{}'::text[],
  bio text,
  pronouns text,
  updated_at timestamptz not null default now ()
);

comment on table public.profiles is 'One row per auth user; optional avatar in storage bucket avatars/{user_id}/.';

alter table public.profiles add column if not exists gender_identity text;
alter table public.profiles add column if not exists dietary_preferences text[] not null default '{}'::text[];
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists pronouns text;

alter table public.profiles
  drop constraint if exists profiles_gender_identity_check;

alter table public.profiles
  add constraint profiles_gender_identity_check check (
    gender_identity is null
    or gender_identity in ('female', 'male', 'non_binary', 'other')
  );

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
  cand text;
  attempts int := 0;
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

  loop
    cand := upper(substr(replace(gen_random_uuid ()::text, '-', ''), 1, 10));
    exit when not exists (
      select 1
      from public.households h2
      where h2.invite_code = cand
    );
    attempts := attempts + 1;
    if attempts > 40 then
      raise exception 'could not allocate invite code' using errcode = '53400';
    end if;
  end loop;

  update public.households
     set invite_code = cand
   where id = hid;

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
  reward_points integer,
  email text
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
         m.reward_points,
         au.email::text as email
  from public.household_members m
  left join public.profiles p on p.id = m.user_id
  left join auth.users au on au.id = m.user_id
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
-- Chore assignee columns (existing DBs — must exist before complete_household_task)
-------------------------------------------------------------------------------
alter table public.household_tasks add column if not exists assigned_to uuid
  references auth.users (id) on delete set null;

alter table public.household_tasks add column if not exists due_at timestamptz;

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

  if t.assigned_to is not null and t.assigned_to <> uid then
    raise exception 'this chore is assigned to someone else' using errcode = '42501';
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

-------------------------------------------------------------------------------
-- DormMate v2+: invites, admin role migration, tasks assignee/due,
-- activity log, manual expenses + splits, events + RSVP
-- (Safe on existing projects: IF NOT EXISTS / DROP IF EXISTS where needed.)
-------------------------------------------------------------------------------

-------------------------------------------------------------------------------
-- Household invite column + role constraint (existing DBs)
-------------------------------------------------------------------------------
alter table public.households add column if not exists invite_code text;

create unique index if not exists households_invite_code_unique
  on public.households (invite_code)
  where invite_code is not null;

alter table public.household_members
  drop constraint if exists household_members_role_check;

alter table public.household_members
  add constraint household_members_role_check check (
    role in ('owner', 'admin', 'member')
  );

alter table public.household_tasks add column if not exists assigned_to uuid
  references auth.users (id) on delete set null;

alter table public.household_tasks add column if not exists due_at timestamptz;

-------------------------------------------------------------------------------
-- Activity log (fed by triggers + optional app inserts)
-------------------------------------------------------------------------------
create table if not exists public.household_activities (
  id uuid primary key default gen_random_uuid (),
  household_id uuid not null references public.households (id) on delete cascade,
  kind text not null,
  actor_user_id uuid references auth.users (id) on delete set null,
  subject_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now ()
);

create index if not exists household_activities_household_created_idx
  on public.household_activities (household_id, created_at desc);

comment on table public.household_activities is 'Append-only feed: household events for dashboard.';

-------------------------------------------------------------------------------
-- Manual expenses (independent of receipt scans)
-------------------------------------------------------------------------------
create table if not exists public.household_expenses (
  id uuid primary key default gen_random_uuid (),
  household_id uuid not null references public.households (id) on delete cascade,
  source_receipt_id uuid references public.receipts (id) on delete set null,
  title text not null check (length (trim(title)) between 1 and 200),
  amount numeric (14, 2) not null check (amount > 0),
  currency text not null default 'EUR',
  expense_date date not null default (current_date),
  paid_by_user_id uuid not null references auth.users (id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'settled')),
  notes text,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now ()
);

create index if not exists household_expenses_household_idx
  on public.household_expenses (household_id, created_at desc);

alter table public.household_expenses
  add column if not exists source_receipt_id uuid
  references public.receipts (id) on delete set null;

create unique index if not exists household_expenses_source_receipt_unique
  on public.household_expenses (source_receipt_id)
  where source_receipt_id is not null;

create table if not exists public.household_expense_splits (
  expense_id uuid not null references public.household_expenses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (expense_id, user_id)
);

-------------------------------------------------------------------------------
-- Events + RSVP
-------------------------------------------------------------------------------
create table if not exists public.household_events (
  id uuid primary key default gen_random_uuid (),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null check (length (trim(title)) between 1 and 200),
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  bring_list jsonb not null default '[]'::jsonb,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now ()
);

create index if not exists household_events_household_starts_idx
  on public.household_events (household_id, starts_at);

create table if not exists public.household_event_rsvps (
  event_id uuid not null references public.household_events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null check (status in ('going', 'maybe', 'not_going')),
  updated_at timestamptz not null default now (),
  primary key (event_id, user_id)
);

-------------------------------------------------------------------------------
-- Helpers: manager (owner/admin), invite allocation
-------------------------------------------------------------------------------
create or replace function public.household_member_can_manage (p_household_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_user_id is not null
    and exists (
      select 1
      from public.household_members m
      where m.household_id = p_household_id
        and m.user_id = p_user_id
        and m.role in ('owner', 'admin')
    );
$$;

revoke all on function public.household_member_can_manage (uuid, uuid) from public;
grant execute on function public.household_member_can_manage (uuid, uuid) to authenticated;

create or replace function public.allocate_household_invite_code ()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  cand text;
  attempts int := 0;
begin
  loop
    cand := upper(substr(replace(gen_random_uuid ()::text, '-', ''), 1, 10));
    exit when not exists (
      select 1
      from public.households h2
      where h2.invite_code = cand
    );
    attempts := attempts + 1;
    if attempts > 40 then
      raise exception 'could not allocate invite code' using errcode = '53400';
    end if;
  end loop;
  return cand;
end;
$$;

revoke all on function public.allocate_household_invite_code () from public;
grant execute on function public.allocate_household_invite_code () to authenticated;

-------------------------------------------------------------------------------
-- RPC: join via invite code (idempotent if already a member)
-------------------------------------------------------------------------------
create or replace function public.join_household_by_invite_code (p_code text)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  hid uuid;
  uid uuid;
  cleaned text;
begin
  uid := auth.uid ();
  cleaned := upper(trim (both from coalesce (p_code, '')));

  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if length (cleaned) < 4 then
    raise exception 'invalid invite code' using errcode = '22023';
  end if;

  select h.id
    into hid
    from public.households h
   where h.invite_code = cleaned;

  if hid is null then
    raise exception 'invalid invite code' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.household_members m
    where m.household_id = hid
      and m.user_id = uid
  ) then
    return hid;
  end if;

  insert into public.household_members (household_id, user_id, role)
  values (hid, uid, 'member');

  return hid;
end;
$$;

revoke all on function public.join_household_by_invite_code (text) from public;
grant execute on function public.join_household_by_invite_code (text) to authenticated;

-------------------------------------------------------------------------------
-- RPC: regenerate invite (owner/admin)
-------------------------------------------------------------------------------
create or replace function public.regenerate_household_invite_code (p_household_id uuid)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid ();
  new_code text;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if not public.household_member_can_manage (p_household_id, uid) then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  new_code := public.allocate_household_invite_code ();

  update public.households
     set invite_code = new_code
   where id = p_household_id;

  return new_code;
end;
$$;

revoke all on function public.regenerate_household_invite_code (uuid) from public;
grant execute on function public.regenerate_household_invite_code (uuid) to authenticated;

-------------------------------------------------------------------------------
-- RPC: remove member or leave (cannot remove owner row)
-------------------------------------------------------------------------------
create or replace function public.remove_household_member (p_household_id uuid, p_target_user_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid ();
  target_role text;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select m.role
    into target_role
    from public.household_members m
   where m.household_id = p_household_id
     and m.user_id = p_target_user_id;

  if target_role is null then
    return;
  end if;

  if target_role = 'owner' then
    raise exception 'cannot remove the household owner' using errcode = '42501';
  end if;

  if p_target_user_id = uid then
    delete from public.household_members
     where household_id = p_household_id
       and user_id = uid
       and role <> 'owner';
    return;
  end if;

  if not public.household_member_can_manage (p_household_id, uid) then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  delete from public.household_members
   where household_id = p_household_id
     and user_id = p_target_user_id;
end;
$$;

revoke all on function public.remove_household_member (uuid, uuid) from public;
grant execute on function public.remove_household_member (uuid, uuid) to authenticated;

-------------------------------------------------------------------------------
-- RPC: promote member to admin (owner only)
-------------------------------------------------------------------------------
create or replace function public.promote_household_member_to_admin (p_household_id uuid, p_target_user_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid ();
  n int;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if not public.household_is_created_by (p_household_id, uid) then
    raise exception 'only the household creator can promote admins' using errcode = '42501';
  end if;

  if p_target_user_id = uid then
    raise exception 'invalid target' using errcode = '22023';
  end if;

  update public.household_members
     set role = 'admin'
   where household_id = p_household_id
     and user_id = p_target_user_id
     and role = 'member';

  get diagnostics n = row_count;
  if n < 1 then
    raise exception 'member not found or already elevated' using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.promote_household_member_to_admin (uuid, uuid) from public;
grant execute on function public.promote_household_member_to_admin (uuid, uuid) to authenticated;

-------------------------------------------------------------------------------
-- RPC: create expense + equal splits (atomic)
-------------------------------------------------------------------------------
create or replace function public.create_household_expense_with_splits (
  p_household_id uuid,
  p_title text,
  p_amount numeric,
  p_currency text,
  p_expense_date date,
  p_paid_by_user_id uuid,
  p_split_user_ids uuid[]
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid ();
  eid uuid;
  n int;
  u uuid;
  tt text;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if not public.user_can_see_household (p_household_id, uid) then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  tt := trim (both from coalesce (p_title, ''));

  if length (tt) < 1 or length (tt) > 200 then
    raise exception 'invalid title' using errcode = '22023';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid amount' using errcode = '22023';
  end if;

  n := coalesce(array_length(p_split_user_ids, 1), 0);

  if n < 1 then
    raise exception 'pick at least one person to split with' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.household_members m
    where m.household_id = p_household_id
      and m.user_id = p_paid_by_user_id
  ) then
    raise exception 'payer must belong to the household' using errcode = '42501';
  end if;

  foreach u in array p_split_user_ids
  loop
    if not exists (
      select 1
      from public.household_members m
      where m.household_id = p_household_id
        and m.user_id = u
    ) then
      raise exception 'split members must belong to the household' using errcode = '42501';
    end if;
  end loop;

  insert into public.household_expenses (
    household_id,
    title,
    amount,
    currency,
    expense_date,
    paid_by_user_id,
    status,
    created_by
  )
  values (
    p_household_id,
    tt,
    p_amount,
    coalesce (nullif(trim (both from p_currency), ''), 'EUR'),
    coalesce (p_expense_date, current_date),
    p_paid_by_user_id,
    'pending',
    uid
  )
  returning id into eid;

  foreach u in array p_split_user_ids
  loop
    insert into public.household_expense_splits (expense_id, user_id)
    values (eid, u);
  end loop;

  return eid;
end;
$$;

revoke all on function public.create_household_expense_with_splits (
  uuid,
  text,
  numeric,
  text,
  date,
  uuid,
  uuid[]
) from public;
grant execute on function public.create_household_expense_with_splits (
  uuid,
  text,
  numeric,
  text,
  date,
  uuid,
  uuid[]
) to authenticated;

-------------------------------------------------------------------------------
-- RPC: net balances from pending expenses (equal splits)
-------------------------------------------------------------------------------
create or replace function public.household_expense_net_balances (p_household_id uuid)
returns table (user_id uuid, net_amount numeric)
language sql
stable
security definer
set search_path = public
as $$
  with ex as (
    select e.id, e.amount, e.paid_by_user_id
    from public.household_expenses e
    where e.household_id = p_household_id
      and e.status = 'pending'
  ),
  split_counts as (
    select s.expense_id, count(*)::numeric as cnt
    from public.household_expense_splits s
    where s.expense_id in (select ex.id from ex)
    group by s.expense_id
  ),
  debits as (
    select s.user_id as uid, sum(-(ex.amount / sc.cnt)) as delta
    from ex
    join split_counts sc on sc.expense_id = ex.id
    join public.household_expense_splits s on s.expense_id = ex.id
    group by s.user_id
  ),
  credits as (
    select e.paid_by_user_id as uid, sum(e.amount) as delta
    from ex e
    group by e.paid_by_user_id
  ),
  merged as (
    select uid, delta from debits
    union all
    select uid, delta from credits
  )
  select m.uid as user_id, sum(m.delta)::numeric(14, 2) as net_amount
  from merged m
  group by m.uid;
$$;

revoke all on function public.household_expense_net_balances (uuid) from public;
grant execute on function public.household_expense_net_balances (uuid) to authenticated;

-------------------------------------------------------------------------------
-- RLS: new tables
-------------------------------------------------------------------------------
alter table public.household_activities enable row level security;

drop policy if exists ha_select_visible on public.household_activities;
create policy ha_select_visible on public.household_activities for
select to authenticated using (
  public.user_can_see_household (household_id, (select auth.uid ()))
    or public.is_platform_super_admin ()
);

alter table public.household_expenses enable row level security;

drop policy if exists hex_select_visible on public.household_expenses;
create policy hex_select_visible on public.household_expenses for
select to authenticated using (
  public.user_can_see_household (household_id, (select auth.uid ()))
    or public.is_platform_super_admin ()
);

drop policy if exists hex_insert_member on public.household_expenses;
create policy hex_insert_member on public.household_expenses for
insert to authenticated
with check (
  created_by = (select auth.uid ())
    and public.user_can_see_household (
      household_id,
      (select auth.uid ())
    )
);

drop policy if exists hex_update_member on public.household_expenses;
create policy hex_update_member on public.household_expenses for
update to authenticated using (
  public.user_can_see_household (household_id, (select auth.uid ()))
)
with check (
  public.user_can_see_household (household_id, (select auth.uid ()))
);

alter table public.household_expense_splits enable row level security;

drop policy if exists hspl_select_via_expense on public.household_expense_splits;
create policy hspl_select_via_expense on public.household_expense_splits for
select to authenticated using (
  exists (
    select 1
    from public.household_expenses e
    where e.id = expense_id
      and public.user_can_see_household (
        e.household_id,
        (select auth.uid ())
      )
  )
);

drop policy if exists hspl_insert_via_expense on public.household_expense_splits;
create policy hspl_insert_via_expense on public.household_expense_splits for
insert to authenticated
with check (
  exists (
    select 1
    from public.household_expenses e
    where e.id = expense_id
      and public.user_can_see_household (
        e.household_id,
        (select auth.uid ())
      )
      and e.created_by = (select auth.uid ())
  )
);

alter table public.household_events enable row level security;

drop policy if exists hev_select_visible on public.household_events;
create policy hev_select_visible on public.household_events for
select to authenticated using (
  public.user_can_see_household (household_id, (select auth.uid ()))
);

drop policy if exists hev_insert_member on public.household_events;
create policy hev_insert_member on public.household_events for
insert to authenticated
with check (
  created_by = (select auth.uid ())
    and public.user_can_see_household (
      household_id,
      (select auth.uid ())
    )
);

drop policy if exists hev_update_creator on public.household_events;
create policy hev_update_creator on public.household_events for
update to authenticated using (created_by = (select auth.uid ()))
with check (created_by = (select auth.uid ()));

drop policy if exists hev_delete_creator on public.household_events;
create policy hev_delete_creator on public.household_events for
delete to authenticated using (created_by = (select auth.uid ()));

alter table public.household_event_rsvps enable row level security;

drop policy if exists rsvp_select_visible on public.household_event_rsvps;
create policy rsvp_select_visible on public.household_event_rsvps for
select to authenticated using (
  exists (
    select 1
    from public.household_events ev
    where ev.id = event_id
      and public.user_can_see_household (
        ev.household_id,
        (select auth.uid ())
      )
  )
);

drop policy if exists rsvp_upsert_own on public.household_event_rsvps;
create policy rsvp_upsert_own on public.household_event_rsvps for
insert to authenticated
with check (
  user_id = (select auth.uid ())
    and exists (
      select 1
      from public.household_events ev
      where ev.id = event_id
        and public.user_can_see_household (
          ev.household_id,
          (select auth.uid ())
        )
    )
);

drop policy if exists rsvp_update_own on public.household_event_rsvps;
create policy rsvp_update_own on public.household_event_rsvps for
update to authenticated using (user_id = (select auth.uid ()))
with check (user_id = (select auth.uid ()));

-------------------------------------------------------------------------------
-- Grants (new tables)
-------------------------------------------------------------------------------
grant select on public.household_activities to authenticated;
grant select, insert, update on public.household_expenses to authenticated;
grant select, insert on public.household_expense_splits to authenticated;
grant select, insert, update, delete on public.household_events to authenticated;
grant select, insert, update on public.household_event_rsvps to authenticated;

-------------------------------------------------------------------------------
-- Backfill: invite codes for households missing one
-------------------------------------------------------------------------------
do $$
declare
  r record;
  cand text;
  attempts int;
begin
  for r in
    select id
    from public.households
    where invite_code is null
  loop
    attempts := 0;
    loop
      cand := upper(substr(replace(gen_random_uuid ()::text, '-', ''), 1, 10));
      exit when not exists (
        select 1
        from public.households h2
        where h2.invite_code = cand
      );
      attempts := attempts + 1;
      if attempts > 50 then
        raise exception 'backfill invite failed for %', r.id;
      end if;
    end loop;
    update public.households h
       set invite_code = cand
     where h.id = r.id;
  end loop;
end;
$$;

-------------------------------------------------------------------------------
-- Triggers → household_activities
-------------------------------------------------------------------------------
create or replace function public.log_activity_household_created ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.household_activities (
    household_id,
    kind,
    actor_user_id,
    subject_id,
    payload
  )
  values (
    new.id,
    'household_created',
    new.created_by,
    new.id,
    jsonb_build_object('name', new.name)
  );
  return new;
end;
$$;

drop trigger if exists trg_household_created_activity on public.households;
create trigger trg_household_created_activity
  after insert on public.households
  for each row
execute procedure public.log_activity_household_created ();

create or replace function public.log_activity_member_joined ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_bootstrap_owner boolean;
begin
  select (new.role = 'owner' and h.created_by = new.user_id)
    into is_bootstrap_owner
    from public.households h
   where h.id = new.household_id;

  if is_bootstrap_owner then
    return new;
  end if;

  insert into public.household_activities (
    household_id,
    kind,
    actor_user_id,
    subject_id,
    payload
  )
  values (
    new.household_id,
    'member_joined',
    new.user_id,
    new.user_id,
    jsonb_build_object('role', new.role)
  );
  return new;
end;
$$;

drop trigger if exists trg_member_joined_activity on public.household_members;
create trigger trg_member_joined_activity
  after insert on public.household_members
  for each row
execute procedure public.log_activity_member_joined ();

create or replace function public.log_activity_task_created ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.household_activities (
    household_id,
    kind,
    actor_user_id,
    subject_id,
    payload
  )
  values (
    new.household_id,
    'task_created',
    new.created_by,
    new.id,
    jsonb_build_object(
      'title',
      new.title,
      'points',
      new.reward_points
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_task_created_activity on public.household_tasks;
create trigger trg_task_created_activity
  after insert on public.household_tasks
  for each row
execute procedure public.log_activity_task_created ();

create or replace function public.log_activity_task_completed ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'done'
     and old.status is distinct from 'done'
     and new.completed_at is not null then
    insert into public.household_activities (
      household_id,
      kind,
      actor_user_id,
      subject_id,
      payload
    )
    values (
      new.household_id,
      'task_completed',
      new.completed_by,
      new.id,
      jsonb_build_object(
        'title',
        new.title,
        'points',
        new.reward_points
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_task_completed_activity on public.household_tasks;
create trigger trg_task_completed_activity
  after update on public.household_tasks
  for each row
execute procedure public.log_activity_task_completed ();

create or replace function public.log_activity_receipt_saved ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.household_activities (
    household_id,
    kind,
    actor_user_id,
    subject_id,
    payload
  )
  values (
    new.household_id,
    'receipt_saved',
    new.created_by,
    new.id,
    jsonb_build_object(
      'merchant',
      new.merchant,
      'total',
      new.total_amount,
      'currency',
      new.currency
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_receipt_activity on public.receipts;
create trigger trg_receipt_activity
  after insert on public.receipts
  for each row
execute procedure public.log_activity_receipt_saved ();

create or replace function public.log_activity_expense_added ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.household_activities (
    household_id,
    kind,
    actor_user_id,
    subject_id,
    payload
  )
  values (
    new.household_id,
    'expense_added',
    new.created_by,
    new.id,
    jsonb_build_object(
      'title',
      new.title,
      'amount',
      new.amount,
      'currency',
      new.currency
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_expense_activity on public.household_expenses;
create trigger trg_expense_activity
  after insert on public.household_expenses
  for each row
execute procedure public.log_activity_expense_added ();

create or replace function public.log_activity_event_created ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.household_activities (
    household_id,
    kind,
    actor_user_id,
    subject_id,
    payload
  )
  values (
    new.household_id,
    'event_created',
    new.created_by,
    new.id,
    jsonb_build_object(
      'title',
      new.title,
      'starts_at',
      new.starts_at
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_event_created_activity on public.household_events;
create trigger trg_event_created_activity
  after insert on public.household_events
  for each row
execute procedure public.log_activity_event_created ();
