import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type HouseholdSummary = {
  id: string;
  name: string;
  role: string;
  joinedAt: string;
};

export type HouseholdDetail = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
};

export type HouseholdMemberRow = {
  userId: string;
  role: string;
  joinedAt: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export const loadHouseholdSummaries = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data: membershipRowsRaw, error: memErr } = await supabase
    .from("household_members")
    .select("household_id, role, joined_at")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  if (memErr || !membershipRowsRaw?.length) {
    if (memErr?.message) {
      console.error("[households] membership list", memErr.message);
    }
    return { error: memErr?.message ?? null as string | null, households: [] as HouseholdSummary[] };
  }

  const membershipRows = membershipRowsRaw as Array<{
    household_id: string;
    role: string;
    joined_at: string;
  }>;

  const ids = [...new Set(membershipRows.map((m) => m.household_id))];
  const { data: hhRaw, error: hhErr } = await supabase
    .from("households")
    .select("id, name, created_at")
    .in("id", ids);

  if (hhErr || !hhRaw) {
    if (hhErr?.message) {
      console.error("[households] household list", hhErr.message);
    }
    return { error: hhErr?.message ?? null, households: [] as HouseholdSummary[] };
  }

  const byId = new Map(hhRaw.map((h) => [h.id, h] as const));

  const households = membershipRows.flatMap((m) => {
    const h = byId.get(m.household_id);
    return h
      ? [
          {
            id: h.id,
            name: h.name,
            role: m.role,
            joinedAt: m.joined_at,
          } satisfies HouseholdSummary,
        ]
      : [];
  });

  return { error: null as string | null, households };
});

export async function loadHouseholdDetail(
  userId: string,
  householdId: string,
): Promise<{ ok: false } | { ok: true; household: HouseholdDetail; memberRole: string }> {
  const supabase = await createClient();

  const { data: hh, error: hhErr } = await supabase
    .from("households")
    .select("id, name, created_by, created_at")
    .eq("id", householdId)
    .maybeSingle();

  if (hhErr?.message || !hh) {
    if (hhErr?.message) {
      console.error("[households] detail", hhErr.message);
    }
    return { ok: false };
  }

  const row = hh as {
    id: string;
    name: string;
    created_by: string;
    created_at: string;
  };

  const typed: HouseholdDetail = {
    id: row.id,
    name: row.name,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };

  const { data: me, error: meErr } = await supabase
    .from("household_members")
    .select("role")
    .eq("household_id", householdId)
    .eq("user_id", userId)
    .maybeSingle();

  if (meErr?.message || !me) {
    return { ok: false };
  }

  return {
    ok: true,
    household: typed,
    memberRole: (me as { role: string }).role,
  };
}

export async function loadHouseholdMembers(householdId: string): Promise<
  HouseholdMemberRow[] | { error: string }
> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("list_household_members_for_user", {
    p_household_id: householdId,
  });

  if (error) {
    console.error("[households] list members rpc", error.message);
    return { error: error.message };
  }

  type RpcRow = {
    user_id: string;
    role: string;
    joined_at: string;
    display_name: string | null;
    avatar_url: string | null;
  };

  const rows = (data ?? []) as RpcRow[];

  return rows.map((r) => ({
    userId: r.user_id,
    role: r.role,
    joinedAt: r.joined_at,
    displayName: r.display_name,
    avatarUrl: r.avatar_url,
  }));
}
