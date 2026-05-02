-- Fixes: "infinite recursion detected in policy for relation household_members"
-- Cause: hm_select_related referenced household_members inside its own USING clause.
-- Run once in SQL Editor after the buggy policy was applied.

drop policy if exists hm_select_related on public.household_members;
drop policy if exists hm_select_own on public.household_members;

create policy hm_select_own on public.household_members
for select to authenticated using (user_id = (select auth.uid()));
