export function SystemLine({ text }: { text: string }) {
  const stripped = text.replace(/^—\s*/, '').replace(/\s*—$/, '');
  return (
    <div className="text-center py-4 text-caption animate-feed-in" style={{ color: 'var(--muted-foreground)' }}>
      — {stripped} —
    </div>
  );
}
