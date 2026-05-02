/*
  -----------------------------------------------------------------------------
  DORMMATE — Supabase schema / PostgreSQL

  In Supabase SQL Editor: select ALL of this file (Ctrl+A), then Run.
  Safe to run again on the same project (idempotent-ish):
  DROP IF EXISTS on policies / old overloads; CREATE IF NOT EXISTS tables;
  CREATE OR REPLACE on functions.

  Covers: households, household_members, receipts, RLS helpers,
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
returns table (user_id uuid, role text, joined_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select m.user_id,
         m.role::text as role,
         m.joined_at
  from public.household_members m
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
-- RLS + policies
-------------------------------------------------------------------------------
alter table public.households enable row level security;
alter table public.household_members enable row level security;

drop policy if exists households_select_own on public.households;
create policy households_select_own on public.households
for select to authenticated using (
  public.user_can_see_household (id, (select auth.uid ()))
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
create policy hm_select_own on public.household_members
for select to authenticated
using (user_id = (select auth.uid ()));

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
);

drop policy if exists receipts_insert_member on public.receipts;
create policy receipts_insert_member on public.receipts
for insert to authenticated
with check (
  created_by = (select auth.uid ())
  and public.user_can_see_household (household_id, (select auth.uid ()))
);

-------------------------------------------------------------------------------
-- Table grants
-------------------------------------------------------------------------------
grant select, insert, update, delete on public.households to authenticated;
grant select, insert on public.household_members to authenticated;
grant select, insert on public.receipts to authenticated;
