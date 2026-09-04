export function ConsolidationBanner({
  transferCount, naiveCount, allSquare = transferCount === 0,
}: { transferCount: number; naiveCount: number; allSquare?: boolean }) {
  return (
    <div
      className="flex items-start gap-3 px-3 py-3"
      // The success variant used to improvise `rgba(21,128,61,0.08)` and was
      // the only borderless card on the screen. It now uses the --positive-tint
      // token and carries the same 1px --border every other card carries.
      style={{
        borderRadius: 'var(--radius-lg)',
        background: allSquare ? 'var(--positive-tint)' : 'var(--accent-tint)',
        border: '1px solid var(--border)',
      }}
    >
      {allSquare ? (
        <span className="shrink-0" style={{ fontSize: 20, lineHeight: '20px', color: 'var(--positive)' }} aria-hidden="true">
          ✓
        </span>
      ) : (
        // Two curved arrows forming a cycle — replaces the `↹` Unicode
        // placeholder the earlier audit flagged as a stand-in "worth
        // replacing with a real SVG eventually, not urgent until real
        // branding exists." That moment is now: this is the netting/
        // consolidation icon (debts cycled down into fewer payments).
        <span className="shrink-0" style={{ color: 'var(--accent)' }} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 7.5C4 5.29 5.79 3.5 8 3.5H13.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M13.5 3.5L10.7 1.2M13.5 3.5L10.7 5.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 12.5C16 14.71 14.21 16.5 12 16.5H6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M6.5 16.5L9.3 18.8M6.5 16.5L9.3 14.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
      <div className="min-w-0">
        {/* text-wrap:balance — this card is narrower now that it's nested
            inside Settle Up's floating container (outer margin + padding +
            this card's own padding + the icon), which pushed the heading
            into wrapping. Balance keeps a forced wrap from ever stranding a
            single word like "8" alone on its own line. */}
        <div className="text-callout" style={{ textWrap: 'balance' }}>{allSquare ? "Everyone's squared up" : `Simplified to ${transferCount} payment${transferCount === 1 ? '' : 's'} instead of ${naiveCount}`}</div>
        <div className="text-caption" style={{ color: 'var(--muted-foreground)' }}>
          {allSquare ? 'No outstanding balances in this trip.' : 'TripUp nets everyone out so nobody pays the same money twice.'}
        </div>
      </div>
    </div>
  );
}
