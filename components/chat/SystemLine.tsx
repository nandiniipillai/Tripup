export function SystemLine({
  text, variant = 'muted', glyph,
}: { text: string; variant?: 'muted' | 'positive'; glyph?: string }) {
  if (variant === 'positive') {
    // A confirmation ("Sent to 6 people"), not ambient history — a pill in
    // the app's own settled/positive language, not the dash-line treatment
    // every other system event uses.
    return (
      <div className="flex justify-center py-2 animate-feed-in">
        <span
          className="inline-flex items-center gap-1.5 text-caption"
          style={{
            height: 28, paddingInline: 12, borderRadius: 9999,
            background: 'var(--positive-tint)', color: 'var(--positive)',
          }}
        >
          {glyph && <span aria-hidden="true">{glyph}</span>}
          {text}
        </span>
      </div>
    );
  }

  const stripped = text.replace(/^—\s*/, '').replace(/\s*—$/, '');
  return (
    <div className="text-center py-4 text-caption animate-feed-in" style={{ color: 'var(--muted-foreground)' }}>
      — {stripped} —
    </div>
  );
}
