-- DormMate RLS: recursion fixes + SECURITY DEFINER helpers that take actor uuid.
--
-- Latest (v3): helpers must use (..., auth.uid()) from the POLICY TEXT, not
-- auth.uid() inside DEFINER bodies (fixes INSERT .. RETURNING + odd JWT cases).
--
-- Run once in Supabase SQL Editor (safe to re-run).

-- Drop policies using old helper signatures -----------------------------------
drop policy if exists households_select_own on public.households;

drop policy if exists hm_insert_first_owner_only on public.household_members;

drop policy if exists hm_select_related on public.household_members;

drop policy if exists hm_select_own on public.household_members;

-- Remove old overloads ----------------------------------------------------------
drop function if exists public.user_can_see_household(uuid);

drop function if exists public.household_created_by_current_user(uuid);

-- Helpers (2-arg actors) -------------------------------------------------------
create or replace function public.user_can_see_household(p_household_id uuid, p_user_id uuid)
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

comment on function public.user_can_see_household(uuid, uuid) is
  'SELECT policy helper for households; reads base tables inside definer.';

revoke all on function public.user_can_see_household(uuid, uuid) from public;

grant execute on function public.user_can_see_household(uuid, uuid) to authenticated;

create or replace function public.household_is_created_by(p_household_id uuid, p_user_id uuid)
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

comment on function public.household_is_created_by(uuid, uuid) is
  'Whether household.created_by equals p_user_id (definer reads households; avoids RLS + auth.uid quirks).';

revoke all on function public.household_is_created_by(uuid, uuid) from public;

grant execute on function public.household_is_created_by(uuid, uuid) to authenticated;

create or replace function public.household_has_no_members(p_household_id uuid)
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

comment on function public.household_has_no_members(uuid) is
  'True if household has zero members (for RLS; bypasses recursion in INSERT policies).';

revoke all on function public.household_has_no_members(uuid) from public;

grant execute on function public.household_has_no_members(uuid) to authenticated;

-- Households -------------------------------------------------------------------
create policy households_select_own on public.households
for select to authenticated using (
  public.user_can_see_household(id, (select auth.uid()))
);

-- Households INSERT unchanged (fresh installs set it in schema.sql); ensure it exists -------------
drop policy if exists households_insert_self_created on public.households;

create policy households_insert_self_created on public.households
for insert to authenticated
with check (created_by = (select auth.uid()));

-- household_members -----------------------------------------------------------
create policy hm_select_own on public.household_members
for select to authenticated using (user_id = (select auth.uid()));

create policy hm_insert_first_owner_only on public.household_members
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and public.household_is_created_by(
    household_members.household_id,
    (select auth.uid())
  )
  and public.household_has_no_members(household_members.household_id)
);
