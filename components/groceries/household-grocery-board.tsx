"use client";

import { useActionState, useEffect, useRef, useState } from "react";

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
  const [addOpen, setAddOpen] = useState(false);
  const addAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.ok) setAddOpen(false);
  }, [state?.ok]);

  const labels = new Map<string, string>(members.map((m) => [m.userId, memberLabel(m)]));
  const open = items.filter((x) => !x.bought);
  const bought = items.filter((x) => x.bought);

  const openFab = () => {
    setAddOpen(true);
    requestAnimationFrame(() => {
      addAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  return (
    <section className="relative flex min-h-0 flex-1 flex-col space-y-3 lg:flex-none lg:space-y-6">
      <button
        type="button"
        onClick={openFab}
        className="dm-focus-ring fixed bottom-[calc(4.85rem+env(safe-area-inset-bottom))] right-4 z-[35] flex h-[52px] min-w-[52px] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--dm-electric)_35%,var(--dm-border-strong))] bg-[linear-gradient(165deg,color-mix(in_srgb,var(--dm-electric)_22%,#fff)_0%,white_100%)] px-5 text-[13px] font-bold text-[var(--dm-electric-deep)] shadow-[0_12px_28px_rgba(126,106,209,0.22)] backdrop-blur-sm transition-[transform,box-shadow] duration-200 active:scale-95 motion-reduce:transition-none lg:hidden"
        aria-expanded={addOpen}
        aria-controls="mobile-grocery-add-panel"
      >
        + Add
      </button>

      <div className="order-2 flex min-h-0 flex-1 flex-col max-lg:order-1 lg:flex-none lg:space-y-6">
        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto [-webkit-overflow-scrolling:touch] max-lg:flex-1 lg:flex-none lg:gap-6 lg:overflow-visible">
          <section className="dm-module dm-hover-lift shrink-0 p-4 sm:p-5 max-lg:border-0 max-lg:bg-transparent max-lg:p-0 max-lg:shadow-none">
          <div className="flex items-center justify-between gap-2 max-lg:px-0.5">
            <h3 className="dm-section-heading text-[1rem] max-lg:text-[15px]">Your list</h3>
            <span className="dm-chip shrink-0 text-[11px] max-lg:border-[color-mix(in_srgb,var(--dm-info)_25%,var(--dm-border-strong))] max-lg:bg-[color-mix(in_srgb,var(--dm-info)_8%,white)]">
              {open.length} left
            </span>
          </div>
          {open.length === 0 ? (
            <div className="dm-empty-well mt-4 max-lg:rounded-[20px] max-lg:border max-lg:border-[var(--dm-border-strong)] max-lg:bg-white/85" role="status">
              <span className="dm-empty-well__glyph" aria-hidden>
                🛒
              </span>
              <p className="text-sm font-semibold text-dm-text">All caught up</p>
              <p className="mt-2 text-[13px] leading-relaxed text-dm-muted">
                Tap <strong className="font-semibold text-dm-text">+ Add</strong> to restock ideas.
              </p>
            </div>
          ) : (
            <ul className="mt-4 max-lg:mt-3 max-lg:space-y-2.5">
              {open.map((item) => (
                <li
                  key={item.id}
                  className="dm-grocery-row max-lg:rounded-2xl max-lg:border-0 max-lg:bg-[linear-gradient(180deg,#fffefb_0%,#f8f9fc_100%)] max-lg:px-4 max-lg:py-3.5 max-lg:shadow-[0_8px_20px_rgba(28,39,56,0.06)] rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/40 px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <span
                        className="dm-checkbox-faux mt-0.5 inline-flex h-9 min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-[var(--dm-border-strong)] bg-white/70 text-[12px] text-dm-muted"
                        aria-hidden
                      >
                        ◻
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-[15px] font-semibold leading-snug text-dm-text">{item.name}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex rounded-md border border-[var(--dm-border)] bg-white/75 px-2 py-0.5 text-[11px] font-semibold text-dm-muted">
                            {item.quantity}
                          </span>
                          {item.category ?
                            <span className="inline-flex max-w-full truncate rounded-md border border-[var(--dm-border-strong)] bg-white/65 px-2 py-0.5 text-[11px] font-medium text-dm-text">
                              {item.category}
                            </span>
                          : null}
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                              item.priority === "high" ?
                                "border border-[color-mix(in_srgb,var(--dm-danger)_32%,transparent)] bg-[color-mix(in_srgb,var(--dm-danger)_10%,white)] text-dm-danger"
                              : item.priority === "low" ?
                                "border border-[var(--dm-border)] bg-dm-surface-mid text-dm-muted"
                              : "border border-[color-mix(in_srgb,var(--dm-accent)_38%,transparent)] bg-[color-mix(in_srgb,var(--dm-accent)_10%,white)] text-[var(--dm-accent-warn-text)]",
                            ].join(" ")}
                          >
                            {item.priority}
                          </span>
                          {item.assignedTo ?
                            <span className="text-[11px] font-medium text-dm-muted">
                              {labels.get(item.assignedTo) ?? "Assigned"}
                            </span>
                          : null}
                        </div>
                        {item.notes ?
                          <p className="mt-2 text-[12px] leading-snug text-dm-muted">{item.notes}</p>
                        : null}
                      </div>
                    </div>
                    <form action={toggleGroceryBought} className="shrink-0 self-center">
                      <input type="hidden" name="household_id" value={householdId} />
                      <input type="hidden" name="grocery_id" value={item.id} />
                      <input type="hidden" name="next_bought" value="1" />
                      <button
                        type="submit"
                        className="dm-focus-ring dm-btn-grocery-done touch-manipulation min-h-[44px] rounded-xl border border-[color-mix(in_srgb,var(--dm-success)_40%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-success)_12%,white)] px-4 text-[12px] font-bold text-[color-mix(in_srgb,var(--dm-success)_95%,var(--dm-text)_5%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-transform duration-150 active:scale-[0.98] motion-reduce:transition-none max-lg:min-w-[44px]"
                      >
                        Got it
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {bought.length > 0 ? (
          <section className="dm-module-muted dm-module dm-hover-lift shrink-0 p-4 sm:p-5 max-lg:rounded-[20px] max-lg:border max-lg:border-[var(--dm-border-strong)] max-lg:bg-white/88 max-lg:p-4 lg:mt-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="dm-section-heading text-[1rem] max-lg:text-[15px]">Bought</h3>
              <span className="dm-chip">{bought.length}</span>
            </div>
            <ul className="mt-3 space-y-2">
              {bought.map((item) => (
                <li
                  key={item.id}
                  className="dm-hover-lift rounded-xl border border-dashed border-[color-mix(in_srgb,var(--dm-success)_35%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-success)_9%,white)] px-3 py-2.5 transition-[opacity,transform] motion-reduce:transition-none max-lg:flex max-lg:items-center max-lg:justify-between max-lg:gap-2"
                >
                  <div className="min-w-0">
                    <p className="break-words text-sm text-dm-text line-through">{item.name}</p>
                    <p className="text-[11px] text-dm-muted">
                      {item.quantity}
                      {item.category ? ` · ${item.category}` : ""}
                    </p>
                  </div>
                  <form action={toggleGroceryBought} className="shrink-0">
                    <input type="hidden" name="household_id" value={householdId} />
                    <input type="hidden" name="grocery_id" value={item.id} />
                    <input type="hidden" name="next_bought" value="0" />
                    <button
                      type="submit"
                      className="dm-focus-ring dm-press-soft touch-manipulation min-h-[40px] min-w-[40px] rounded-lg px-2 text-xs font-semibold text-dm-muted hover:text-dm-text"
                    >
                      Undo
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        </div>
      </div>

      <div
        id="mobile-add-grocery"
        ref={addAnchorRef}
        className={`order-1 max-lg:order-2 scroll-mt-[calc(5rem+env(safe-area-inset-top))] lg:block lg:scroll-mt-0 ${addOpen ? "max-lg:block" : "max-lg:hidden"} lg:!block`}
      >
        <div
          id="mobile-grocery-add-panel"
          className="dm-module dm-module-muted dm-hover-lift p-4 max-lg:rounded-[20px] max-lg:border max-lg:border-[var(--dm-border-strong)] max-lg:bg-[linear-gradient(200deg,color-mix(in_srgb,var(--dm-social)_7%,white)_0%,#fffefb_55%)] max-lg:p-3 max-lg:shadow-[0_12px_28px_rgba(28,39,56,0.08)] sm:p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="dm-section-heading max-lg:text-[14px]">Add grocery</h2>
              <p className="mt-0.5 text-[12px] text-dm-muted max-lg:line-clamp-2">
                Shared list for {householdName}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="dm-focus-ring shrink-0 rounded-full border border-[var(--dm-border-strong)] px-2.5 py-1 text-[11px] font-bold text-dm-muted lg:hidden"
            >
              Done
            </button>
          </div>
          <form action={action} className="mt-4 max-lg:mt-3 max-lg:space-y-3 space-y-4">
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
            className="dm-focus-ring dm-press-soft min-h-[44px] rounded-xl bg-dm-electric px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(200,104,69,0.25)] transition-transform duration-150 hover:brightness-105 active:scale-[0.99] motion-reduce:transition-none disabled:opacity-60"
          >
            {pending ? "Adding..." : "Add grocery item"}
          </button>
        </form>
        </div>
      </div>
    </section>
  );
}
