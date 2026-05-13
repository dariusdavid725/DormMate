import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type HouseholdSummary = {
  id: string;
  name: string;
  currency: string;
  role: string;
  joinedAt: string;
};

export type HouseholdDetail = {
  id: string;
  name: string;
  currency: string;
  createdBy: string;
  createdAt: string;
  /** Present for owner/admin only (invite link). */
  inviteCode: string | null;
  canManageMembers: boolean;
};

export type HouseholdMemberRow = {
  userId: string;
  role: string;
  joinedAt: string;
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
  rewardPoints: number;
  phoneNumber: string | null;
  iban: string | null;
  paymentNote: string | null;
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
    .select("id, name, currency, created_at")
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
            currency: (h.currency ?? "RON").toUpperCase().slice(0, 8),
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
): Promise<
  | { ok: false }
  | {
      ok: true;
      household: HouseholdDetail;
      memberRole: string;
      /** True when a platform super-admin opens a household they are not a member of. */
      viewAsPlatformAdmin?: boolean;
    }
> {
  const supabase = await createClient();

  const { data: hh, error: hhErr } = await supabase
    .from("households")
    .select("id, name, currency, created_by, created_at, invite_code")
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
    currency: string | null;
    created_at: string;
    invite_code: string | null;
  };

  const { data: me, error: meErr } = await supabase
    .from("household_members")
    .select("role")
    .eq("household_id", householdId)
    .eq("user_id", userId)
    .maybeSingle();

  if (meErr?.message) {
    console.error("[households] detail membership", meErr.message);
    return { ok: false };
  }

  if (me) {
    const role = (me as { role: string }).role;
    const canManage = role === "owner" || role === "admin";

    const typed: HouseholdDetail = {
      id: row.id,
      name: row.name,
      currency: (row.currency ?? "RON").toUpperCase().slice(0, 8),
      createdBy: row.created_by,
      createdAt: row.created_at,
      inviteCode: canManage ? row.invite_code : null,
      canManageMembers: canManage,
    };

    return {
      ok: true,
      household: typed,
      memberRole: role,
    };
  }

  const { data: isAdminRaw, error: adminErr } = await supabase.rpc(
    "is_platform_super_admin",
  );
  if (adminErr?.message) {
    console.error("[households] detail admin check", adminErr.message);
  }

  if (isAdminRaw !== true) {
    return { ok: false };
  }

  const typed: HouseholdDetail = {
    id: row.id,
    name: row.name,
    currency: (row.currency ?? "RON").toUpperCase().slice(0, 8),
    createdBy: row.created_by,
    createdAt: row.created_at,
    inviteCode: null,
    canManageMembers: false,
  };

  return {
    ok: true,
    household: typed,
    memberRole: "member",
    viewAsPlatformAdmin: true,
  };
}

export const loadHouseholdMembers = cache(async (householdId: string): Promise<
  HouseholdMemberRow[] | { error: string }
> => {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("list_household_members_for_user", {
    p_household_id: householdId,
  });

  if (error) {
    console.error("[households] list members rpc", error.message);
    return { error: "Could not load roommates." };
  }

  type RpcRow = {
    user_id: string;
    role: string;
    joined_at: string;
    display_name: string | null;
    avatar_url: string | null;
    email: string | null;
    reward_points?: number | null;
    phone_number?: string | null;
    iban?: string | null;
    payment_note?: string | null;
  };

  const rowsRaw = data ?? [];
  const rows: RpcRow[] = Array.isArray(rowsRaw)
    ? (rowsRaw as RpcRow[])
    : rowsRaw && typeof rowsRaw === "object"
      ? [rowsRaw as RpcRow]
      : [];

  return rows.map((r) => ({
    userId: r.user_id,
    role: r.role,
    joinedAt: r.joined_at,
    displayName: r.display_name,
    avatarUrl: r.avatar_url,
    email: r.email,
    rewardPoints: Math.max(0, Math.floor(Number(r.reward_points ?? 0))),
    phoneNumber: r.phone_number ?? null,
    iban: r.iban ?? null,
    paymentNote: r.payment_note ?? null,
  }));
});
