"use client";

import { useActionState } from "react";

import type { HouseholdMemberRow } from "@/lib/households/queries";
import {
  createGroceryItem,
  toggleGroceryBought,
  type GroceryActionState,
} from "@/lib/groceries/actions";
import type { GroceryRow } from "@/lib/groceries/queries";

const CREATE_INITIAL: GroceryActionState = {};

function memberLabel(m: HouseholdMemberRow) {
  return m.displayName?.trim() || m.email?.trim() || `Mate · ${m.userId.slice(0, 6)}`;
}

export function HouseholdGroceryBoard({
  householdId,
  householdName,
  items,
  members,
}: {
  householdId: string;
  householdName: string;
  items: GroceryRow[];
  members: HouseholdMemberRow[];
}) {
  const [state, action, pending] = useActionState(createGroceryItem, CREATE_INITIAL);

  const labels = new Map<string, string>(members.map((m) => [m.userId, memberLabel(m)]));
  const open = items.filter((x) => !x.bought);
  const bought = items.filter((x) => x.bought);

  return (
    <section className="space-y-6">
      <div className="cozy-poster p-4 sm:p-5">
        <h2 className="font-cozy-display text-2xl text-dm-text">Add grocery</h2>
        <p className="mt-1 text-[13px] text-dm-muted">
          Shared list for {householdName}. Mark items bought as you go.
        </p>
        <form action={action} className="mt-5 space-y-4">
          <input type="hidden" name="household_id" value={householdId} />
          {state?.error ? (
            <p role="alert" className="rounded-md border border-dm-danger/40 px-3 py-2 text-sm text-dm-danger">
              {state.error}
            </p>
          ) : null}
          {state?.ok ? (
            <p role="status" className="rounded-md border border-[var(--dm-border-strong)] px-3 py-2 text-sm text-dm-muted">
              Grocery item added.
            </p>
          ) : null}
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">Name</span>
            <input
              name="name"
              required
              maxLength={140}
              placeholder="Milk, pasta, detergent..."
              className="mt-2 w-full rounded-lg border border-[var(--dm-border-strong)] bg-dm-bg/80 px-3 py-2.5 text-sm"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">Quantity</span>
              <input
                name="quantity"
                maxLength={40}
                defaultValue="1"
                className="mt-2 w-full rounded-lg border border-[var(--dm-border-strong)] bg-dm-bg/80 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">Category</span>
              <input
                name="category"
                maxLength={40}
                placeholder="Pantry, Produce, Cleaning..."
                className="mt-2 w-full rounded-lg border border-[var(--dm-border-strong)] bg-dm-bg/80 px-3 py-2.5 text-sm"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">Priority</span>
              <select name="priority" defaultValue="medium" className="mt-2 w-full rounded-lg border border-[var(--dm-border-strong)] bg-dm-bg/80 px-3 py-2.5 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">Assigned to (optional)</span>
              <select name="assigned_to" defaultValue="" className="mt-2 w-full rounded-lg border border-[var(--dm-border-strong)] bg-dm-bg/80 px-3 py-2.5 text-sm">
                <option value="">Anyone</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {memberLabel(m)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">Notes (optional)</span>
            <textarea
              name="notes"
              maxLength={300}
              rows={2}
              placeholder="Brand, aisle, etc."
              className="mt-2 w-full rounded-lg border border-[var(--dm-border-strong)] bg-dm-bg/80 px-3 py-2.5 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-dm-electric px-5 py-2.5 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
          >
            {pending ? "Adding..." : "Add grocery item"}
          </button>
        </form>
      </div>

      <section>
        <h3 className="font-cozy-display text-2xl text-dm-text">Current list</h3>
        {open.length === 0 ? (
          <p className="mt-2 text-[13px] text-dm-muted">No pending groceries.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {open.map((item) => (
              <li key={item.id} className="cozy-note rounded-xl px-4 py-3 shadow-[var(--cozy-shadow-note)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-dm-text">{item.name}</p>
                    <p className="mt-1 text-[13px] text-dm-muted">
                      {item.quantity} · {item.category} · {item.priority}
                      {item.assignedTo ? ` · ${labels.get(item.assignedTo) ?? "Assigned"}` : ""}
                    </p>
                    {item.notes ? <p className="mt-1 text-[12px] text-dm-muted">{item.notes}</p> : null}
                  </div>
                  <form action={toggleGroceryBought}>
                    <input type="hidden" name="household_id" value={householdId} />
                    <input type="hidden" name="grocery_id" value={item.id} />
                    <input type="hidden" name="next_bought" value="1" />
                    <button
                      type="submit"
                      className="rounded-md border border-[var(--dm-border-strong)] bg-dm-surface px-3 py-2 text-xs font-semibold text-dm-text hover:border-dm-electric"
                    >
                      Mark bought
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {bought.length > 0 ? (
        <section>
          <h3 className="font-cozy-display text-xl text-dm-muted">Bought</h3>
          <ul className="mt-3 space-y-2">
            {bought.map((item) => (
              <li key={item.id} className="rounded-md border border-dashed border-[var(--dm-border-strong)] bg-dm-surface/80 px-3 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-dm-text line-through">{item.name}</p>
                    <p className="text-[11px] text-dm-muted">
                      {item.quantity} · {item.category}
                    </p>
                  </div>
                  <form action={toggleGroceryBought}>
                    <input type="hidden" name="household_id" value={householdId} />
                    <input type="hidden" name="grocery_id" value={item.id} />
                    <input type="hidden" name="next_bought" value="0" />
                    <button type="submit" className="text-xs font-semibold text-dm-muted hover:text-dm-text">
                      Undo
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
