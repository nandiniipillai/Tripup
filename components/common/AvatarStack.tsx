import type { Member } from '@/lib/types';
import { Avatar } from './Avatar';

export function AvatarStack({ members, max = 4, size = 28 }: { members: Member[]; max?: number; size?: number }) {
  const shown = members.slice(0, max);
  const overflow = members.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((m, i) => (
        // The Tailwind `ring-2` here rendered near-black on top of the
        // intended white boxShadow ring below. One ring, and it's the page-bg
        // one the spec asks for (§4).
        <div key={m.id} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: shown.length - i }} className="rounded-full">
          <div style={{ boxShadow: '0 0 0 2px var(--surface-raised)', borderRadius: 9999 }}>
            <Avatar member={m} size={size} />
          </div>
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="rounded-full flex items-center justify-center text-caption font-semibold shrink-0"
          style={{
            width: size, height: size, marginLeft: -8, background: 'var(--surface)',
            color: 'var(--muted-foreground)', boxShadow: '0 0 0 2px var(--surface-raised)',
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
