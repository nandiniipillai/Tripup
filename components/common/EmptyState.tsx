import { PrimaryButton } from '@/components/common/Action';

/**
 * An empty screen should look composed, not unfinished: a glyph on a real
 * surface, a clear title, one sentence, and exactly one way forward.
 */
export function EmptyState({
  glyph, title, body, actionLabel, onAction,
}: { glyph: string; title: string; body: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16 gap-3">
      <div
        className="flex items-center justify-center"
        style={{
          width: 64, height: 64, borderRadius: 'var(--radius-lg)',
          background: 'var(--surface-raised)', border: '1px solid var(--border)',
          fontSize: 30, lineHeight: '30px',
        }}
        aria-hidden="true"
      >
        {glyph}
      </div>
      <div className="text-headline mt-1">{title}</div>
      <p className="text-body max-w-[260px]" style={{ color: 'var(--muted-foreground)' }}>{body}</p>
      {actionLabel && onAction && (
        <div className="mt-2 w-full max-w-[240px]">
          <PrimaryButton onClick={onAction}>{actionLabel}</PrimaryButton>
        </div>
      )}
    </div>
  );
}
