/*
  ═══════════════════════════════════════════════════════════════════════════
  DORMMATE — SCHEMA INIȚIAL (PostgreSQL / Supabase)
  ═══════════════════════════════════════════════════════════════════════════

  Tu trebuie să faci (o singură dată după modificări ale acestui fișier):

  1) Deschide Supabase Dashboard → proiectul DormMate.
  2) Mergi la SQL Editor → New query.
  3) Copiezi întreg conținutul de mai jos (fără acest bloc de comentariu,
     dacă vrei mai curat în editor — comentariul nu strică, poate fi lăsat).
  4) Apasă Run.
  5) Nu ar fi trebuie să apară erori. Dacă reaplici peste schema existentă și
     obiectele există deja → folosește migrații incrementale mai târziu.

  Ce creează acest fișier:
  - households: un „spațiu” comun (apartament, camin etc.)
  - household_members: utilizator ↔ household (owner / member pentru viitor).
  - RLS: fiecare vede și gestionează doar înregistrările la care intră legitim.

  Notă pentru product: politica de INSERT la household_members permite doar
  primul proprietar după crearea household-ului („owner”). Invitația colegilor
  de apartament în tabele diferite / RPC-uri poate fi adăugată la pasul următor.

  IMPORTANT — lanț între household_members ⇄ households: politica INSERT pe membri
  care citește households reaplică RLS la households_select_own; dacă aceea citește
  household_members, apare aceeași eroare. Soluția: vizibilitate households și
  „ești creator?” prin funcții SECURITY DEFINER (citesc efectiv tabele fără
  re-evaluarea politicii pe INSERT). În plus: SELECT membri doar pentru rândul
  propriu (user_id = auth.uid()); count membri pentru INSERT prin
  household_has_no_members().

  ────────────────────────────────────────────────────────────────────────────
*/

-- Tabele ----------------------------------------------------------------------
create table if not exists public.households (
  id uuid primary key default gen_random_uuid (),
  name text not null check (length(trim(name)) between 1 and 120),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.households is 'Apartament/cămin partajat.';

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid (),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  constraint household_members_household_user_unique unique (household_id, user_id)
);

comment on table public.household_members is 'Membru al unui household.';

create index if not exists household_members_user_id_idx
  on public.household_members (user_id);

create index if not exists household_members_household_id_idx
  on public.household_members (household_id);

create index if not exists households_created_by_idx
  on public.households (created_by);

-- Trigger updated_at ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists households_set_updated_at on public.households;

create trigger households_set_updated_at
before update on public.households
for each row
execute procedure public.set_updated_at();

-- RLS helpers (SECURITY DEFINER reads rows without re-entering RLS — avoids cross-policy recursion)
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

-- RLS -----------------------------------------------------------------------------
alter table public.households enable row level security;
alter table public.household_members enable row level security;

-- Households --------------------------------------------------------------------
drop policy if exists households_select_own on public.households;
create policy households_select_own on public.households
for select to authenticated using (public.user_can_see_household(id));

drop policy if exists households_insert_self_created on public.households;
create policy households_insert_self_created on public.households
for insert to authenticated
with check (created_by = (select auth.uid()));

drop policy if exists households_update_creator on public.households;
create policy households_update_creator on public.households
for update to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));

drop policy if exists households_delete_creator on public.households;
create policy households_delete_creator on public.households
for delete to authenticated
using (created_by = (select auth.uid()));

-- Members -----------------------------------------------------------------------
drop policy if exists hm_select_related on public.household_members;
drop policy if exists hm_select_own on public.household_members;
create policy hm_select_own on public.household_members
for select to authenticated using (user_id = (select auth.uid()));

-- Primul proprietar după creare household — doar created_by și doar dacă nu există alți membri.
drop policy if exists hm_insert_first_owner_only on public.household_members;
create policy hm_insert_first_owner_only on public.household_members
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and public.household_created_by_current_user(household_members.household_id)
  and public.household_has_no_members(household_members.household_id)
);

-- Permisiuni implicite (Supabase folosește rolul authenticated) ---------------
grant select, insert, update, delete on public.households to authenticated;
grant select, insert on public.household_members to authenticated;
