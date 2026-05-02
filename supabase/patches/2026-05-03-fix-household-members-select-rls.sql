-- Fix "infinite recursion detected in policy for relation household_members".
--
-- 1) hm_select_own: SELECT must not nest SELECT from household_members in USING.
-- 2) hm_insert_first_owner_only: INSERT WITH CHECK must not use NOT EXISTS
--    (...) FROM household_members (same recursion); use SECURITY DEFINER helper.
--
-- Run once in Supabase SQL Editor (safe to re-run).

-- SELECT policy -----------------------------------------------------------------
drop policy if exists hm_select_related on public.household_members;
drop policy if exists hm_select_own on public.household_members;

create policy hm_select_own on public.household_members
for select to authenticated using (user_id = (select auth.uid()));

-- Helper + INSERT policy --------------------------------------------------------
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

drop policy if exists hm_insert_first_owner_only on public.household_members;

create policy hm_insert_first_owner_only on public.household_members
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and exists (
    select 1 from public.households h
    where h.id = household_members.household_id and h.created_by = (select auth.uid())
  )
  and public.household_has_no_members(household_members.household_id)
);
