import type { StatusPingItem, Member } from '@/lib/types';
import { PING_LABELS } from '@/lib/types';

export function PingPill({ item, author }: { item: StatusPingItem; author?: Member }) {
  const { glyph, label } = PING_LABELS[item.ping];
  const time = item.createdAt.slice(11, 16);
  return (
    <div className="flex justify-center animate-feed-in">
      <div
        className="inline-flex items-center gap-1.5 px-3"
        style={{ height: 32, borderRadius: 9999, background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
      >
        <span style={{ fontSize: 13 }}>{glyph}</span>
        <span className="text-caption" style={{ color: 'var(--foreground)' }}>
          {author?.name ?? 'Someone'} · {label}
        </span>
        <span className="text-caption" style={{ color: 'var(--muted-foreground)' }}>· {time}</span>
      </div>
    </div>
  );
}
