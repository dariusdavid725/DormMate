export function GettingStartedHint({
  hasHouseholds,
}: {
  hasHouseholds: boolean;
}) {
  if (!hasHouseholds) return null;

  return (
    <details className="rounded-xl border border-[var(--dm-border-strong)] bg-dm-surface px-4 py-3 text-[13px] text-dm-muted">
      <summary className="cursor-pointer list-none text-sm font-semibold text-dm-text">
        Need a quick walkthrough?
      </summary>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 leading-relaxed">
        <li>Pick your home from the top bar (phone) or the sidebar (desktop).</li>
        <li>Use Receipts for scans, then Money to split and settle bills.</li>
        <li>Use Join home when a roommate sends an invite code.</li>
      </ol>
    </details>
  );
}
