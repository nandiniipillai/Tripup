import type { Member } from '@/lib/types';

const TINTS = ['var(--tint-0)', 'var(--tint-1)', 'var(--tint-2)', 'var(--tint-3)', 'var(--tint-4)', 'var(--tint-5)'];
const TINTS_DEEP = ['var(--tint-0-deep)', 'var(--tint-1-deep)', 'var(--tint-2-deep)', 'var(--tint-3-deep)', 'var(--tint-4-deep)', 'var(--tint-5-deep)'];

export function Avatar({ member, size = 36, ringed = false }: { member: Member; size?: number; ringed?: boolean }) {
  const i = member.avatarTint % TINTS.length;
  // Two-stop gradient instead of a flat wash — same six hues, a little depth.
  const bg = `linear-gradient(135deg, ${TINTS[i]}, ${TINTS_DEEP[i]})`;
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-semibold select-none"
      style={{
        width: size,
        height: size,
        background: bg,
        color: 'var(--foreground)',
        opacity: 0.9,
        fontSize: Math.max(10, size * 0.36),
        boxShadow: ringed ? '0 0 0 2px var(--accent)' : undefined,
      }}
      aria-hidden="true"
    >
      {member.initials}
    </div>
  );
}
