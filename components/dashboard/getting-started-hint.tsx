export function GettingStartedHint({
  hasHouseholds,
}: {
  hasHouseholds: boolean;
}) {
  if (!hasHouseholds) return null;

  return (
    <section
      aria-labelledby="quick-start-heading"
      className="rounded-lg border border-[var(--dm-border-strong)] bg-dm-bg/45 px-4 py-3.5 text-[13px] leading-relaxed text-dm-muted"
    >
      <h2 id="quick-start-heading" className="mb-2 text-sm font-semibold text-dm-text">
        Quick guide
      </h2>
      <ol className="list-decimal space-y-1.5 pl-5">
        <li>
          Pick your flat from the bar at the top (phone) or the Households list in the sidebar
          (computer).
        </li>
        <li>
          Use <strong className="text-dm-text">Receipts</strong> to photograph a receipt (tap &quot;Split by items&quot; so each person only pays lines they used).
          Use <strong className="text-dm-text">Money</strong> to split a bill — after Revolut/cash, tap{" "}
          <strong className="text-dm-text">We settled up</strong> so it stops counting.
        </li>
        <li>
          Tap <strong className="text-dm-text">Join household</strong> in the menu when someone sends you an invite code.
        </li>
      </ol>
    </section>
  );
}
