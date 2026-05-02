-- Fix "infinite recursion detected in policy for relation household_members".
--
-- Causes:
-- a) SELECT / INSERT policies that subquery household_members from the same table.
-- b) INSERT WITH CHECK that SELECTs households while households_select_own
--    subqueries household_members again (cross-table recursion).
--
-- Run once in Supabase SQL Editor (safe to re-run).

-- Helpers -----------------------------------------------------------------------
create or replace function public.user_can_see_household(p_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1 from public.households h
      where h.id = p_household_id and h.created_by = (select auth.uid())
    )
    or exists (
      select 1 from public.household_members m
      where m.household_id = p_household_id and m.user_id = (select auth.uid())
    );
$$;

comment on function public.user_can_see_household(uuid) is
  'SELECT policy helper for households; reads base tables inside definer.';

revoke all on function public.user_can_see_household(uuid) from public;

grant execute on function public.user_can_see_household(uuid) to authenticated;

create or replace function public.household_created_by_current_user(p_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.households h
    where h.id = p_household_id and h.created_by = (select auth.uid())
  );
$$;

comment on function public.household_created_by_current_user(uuid) is
  'INSERT first-owner check; must not use plain SELECT on households from RLS policy.';

revoke all on function public.household_created_by_current_user(uuid) from public;

grant execute on function public.household_created_by_current_user(uuid) to authenticated;

create or replace function public.household_has_no_members(p_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.household_members m
    where m.household_id = p_household_id
  );
$$;

comment on function public.household_has_no_members(uuid) is
  'True if household has zero members (for RLS; bypasses recursion in INSERT policies).';

revoke all on function public.household_has_no_members(uuid) from public;

grant execute on function public.household_has_no_members(uuid) to authenticated;

-- Households SELECT (no inline EXISTS into household_members) ---------------
drop policy if exists households_select_own on public.households;

create policy households_select_own on public.households
for select to authenticated using (public.user_can_see_household(id));

-- household_members -----------------------------------------------------------
drop policy if exists hm_select_related on public.household_members;
drop policy if exists hm_select_own on public.household_members;

create policy hm_select_own on public.household_members
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists hm_insert_first_owner_only on public.household_members;

create policy hm_insert_first_owner_only on public.household_members
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and public.household_created_by_current_user(household_members.household_id)
  and public.household_has_no_members(household_members.household_id)
);
