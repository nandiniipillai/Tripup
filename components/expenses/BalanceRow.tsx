import type { Balance, Member } from '@/lib/types';
import { CURRENT_USER_ID } from '@/lib/seed';
import { Avatar } from '@/components/common/Avatar';
import { Money } from '@/components/common/Money';

export function BalanceRow({ member, balance }: { member: Member; balance: Balance }) {
  const isMe = member.id === CURRENT_USER_ID;

  // Verb agreement. `isMe` used to only swap the name to "You", so the row
  // literally read "You / owes".
  const label = isMe
    ? (balance.net > 0 ? 'are owed' : balance.net < 0 ? 'owe' : 'are settled up')
    : (balance.net > 0 ? 'is owed' : balance.net < 0 ? 'owes' : 'settled up');

  const colorClass = balance.net > 0 ? 'text-[var(--positive)]' : balance.net < 0 ? 'text-[var(--negative)]' : 'text-[var(--muted-foreground)]';

  return (
    <div
      className="flex items-center gap-3 px-3"
      // The user's own row was visually identical to every other row, on a
      // screen where 4 of 5 rows are red — so nothing anchored the eye. A
      // tinted ground + a heavier name makes "you" findable without breaking
      // the tabular column alignment down the right edge.
      style={{ height: 64, background: isMe ? 'var(--surface)' : 'transparent' }}
    >
      <Avatar member={member} size={40} />
      <div className="flex-1 min-w-0">
        <div className={isMe ? 'text-callout truncate' : 'text-body truncate'}>{isMe ? 'You' : member.name}</div>
        <div className="text-caption" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
      </div>
      <Money value={Math.abs(balance.net)} size="body" stack align="right" colorClass={colorClass} />
    </div>
  );
}
