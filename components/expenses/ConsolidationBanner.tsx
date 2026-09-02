export function ConsolidationBanner({ transferCount, naiveCount }: { transferCount: number; naiveCount: number }) {
  const allSquare = transferCount === 0;
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
      <span
        className="shrink-0"
        style={{ fontSize: 20, lineHeight: '20px', color: allSquare ? 'var(--positive)' : 'var(--accent)' }}
        aria-hidden="true"
      >
        {allSquare ? '✓' : '↹'}
      </span>
      <div className="min-w-0">
        <div className="text-callout">{allSquare ? "Everyone's squared up" : `Simplified to ${transferCount} payment${transferCount === 1 ? '' : 's'} instead of ${naiveCount}`}</div>
        <div className="text-caption" style={{ color: 'var(--muted-foreground)' }}>
          {allSquare ? 'No outstanding balances in this trip.' : 'TripUp nets everyone out so nobody pays the same money twice.'}
        </div>
      </div>
    </div>
  );
}
