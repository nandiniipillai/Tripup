'use client';

import type { Member } from '@/lib/types';
import { CURRENT_USER_ID } from '@/lib/seed';
import { Avatar } from '@/components/common/Avatar';

/**
 * Include/exclude toggle for a line item.
 *
 * The "on" state used to be accent-tint + an accent border — one of six
 * unrelated meanings --accent-tint was carrying. Selection here is already
 * signalled twice over (full opacity + solid name vs 45% opacity + strikethrough),
 * so it does not need the accent as a third channel. Neutral now, which also
 * keeps the accent meaningful where the spec actually reserves it.
 *
 * 32px pill, 44px hit box (§8.1) via hit-44-after, so the wrapping chip row's
 * rhythm is completely unchanged.
 */
export function MemberChip({ member, on, onToggle }: { member: Member; on: boolean; onToggle: () => void }) {
  // "You" here too — the Paid-by row directly above already calls Ari "You",
  // so naming the same person "Ari" in the very next row read as two people.
  const label = member.id === CURRENT_USER_ID ? 'You' : member.name;
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      aria-label={member.name}
      title={member.name}
      className="hit-44-after inline-flex items-center gap-1.5 pl-1 pr-2.5 pressable"
      style={{
        height: 32,
        borderRadius: 9999,
        background: on ? 'var(--surface-raised)' : 'var(--surface)',
        border: on ? '1px solid var(--border-strong)' : '1px solid var(--border)',
        opacity: on ? 1 : 0.45,
        transition: 'opacity 150ms ease-out, border-color 150ms ease-out',
      }}
    >
      <Avatar member={member} size={22} />
      <span className="text-caption" style={{ textDecoration: on ? 'none' : 'line-through' }}>{label}</span>
    </button>
  );
}
