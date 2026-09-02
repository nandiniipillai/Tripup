export function DayDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2" role="presentation">
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      <span className="text-micro shrink-0" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  );
}
