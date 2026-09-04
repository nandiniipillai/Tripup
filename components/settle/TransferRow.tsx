'use client';

import type { Member, Transfer } from '@/lib/types';
import { Avatar } from '@/components/common/Avatar';
import { Money } from '@/components/common/Money';
import { SecondaryButton, QuietButton } from '@/components/common/Action';

interface HeroProps {
  variant: 'hero';
  transfer: Transfer;
  direction: 'incoming' | 'outgoing';
  otherMember: Member;
  reminded: boolean;
  onRemind: () => void;
  onOpen: () => void;
}

interface QuietProps {
  variant: 'quiet';
  transfer: Transfer;
  fromMember: Member;
  toMember: Member;
  onOpen: () => void;
}

/**
 * One component, two deliberately different weights (§6.9). Zone 1 is the
 * user's own money; Zone 2 is other people's. Zone 2 must be lighter in every
 * dimension — it previously wasn't: its "Mark settled" was a 15/600 accent
 * label while Zone 1's "Remind" was a 12px grey pill, exactly backwards.
 */
export function TransferRow(props: HeroProps | QuietProps) {
  const { transfer } = props;
  const settled = transfer.status === 'settled';

  if (props.variant === 'hero') {
    const { direction, otherMember, reminded, onRemind, onOpen } = props;
    const isIncoming = direction === 'incoming';
    return (
      <div
        className={`flex items-center gap-3 px-3 ${settled ? 'animate-settle-in' : ''}`}
        style={{
          minHeight: 68,
          borderRadius: 'var(--radius-md)',
          background: settled ? 'var(--positive-tint)' : 'var(--surface)',
          border: '1px solid var(--border)',
          opacity: settled ? 0.6 : 1,
        }}
      >
        <button
          className="flex items-center gap-3 flex-1 min-w-0 text-left press-surface"
          style={{ minHeight: 68, borderRadius: 'var(--radius-md)', marginInline: -4, paddingInline: 4 }}
          onClick={settled ? undefined : onOpen}
          disabled={settled}
        >
          <Avatar member={otherMember} size={36} />
          <div className="min-w-0">
            <div className="text-body truncate">{isIncoming ? `${otherMember.name} owes you` : `You owe ${otherMember.name}`}</div>
          </div>
        </button>
        <Money
          value={transfer.amount}
          size="body"
          stack
          align="right"
          colorClass={isIncoming ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}
          className={settled ? 'line-through' : ''}
        />
        <div className="shrink-0 flex items-center justify-end" style={{ minWidth: 76 }}>
          {settled ? (
            <span className="text-caption" style={{ color: 'var(--positive)' }}>✓ Settled</span>
          ) : isIncoming ? (
            reminded ? (
              <span className="text-caption" style={{ color: 'var(--muted-foreground)' }}>Reminded</span>
            ) : (
              <SecondaryButton onClick={onRemind}>Remind</SecondaryButton>
            )
          ) : (
            <SecondaryButton tone="negative" onClick={onOpen}>Pay</SecondaryButton>
          )}
        </div>
      </div>
    );
  }

  const { fromMember, toMember, onOpen } = props;
  return (
    <div
      className={`flex items-center gap-3 ${settled ? 'animate-settle-in' : ''}`}
      style={{ minHeight: 56, opacity: settled ? 0.45 : 1 }}
    >
      <Avatar member={fromMember} size={20} />
      <span className="text-body flex-1 min-w-0 truncate" style={{ color: 'var(--muted-foreground)' }}>
        {fromMember.name} <span aria-hidden="true">→</span> {toMember.name}
      </span>
      {/* text-subhead, --foreground, never colour-coded — it isn't the
          viewer's money (§6.9). Still carries its ≈ estimate (§10). */}
      <Money
        value={transfer.amount}
        size="subhead"
        className={`shrink-0 ${settled ? 'line-through' : ''}`}
      />
      {settled ? (
        <span className="text-caption shrink-0" style={{ color: 'var(--positive)' }}>✓ Settled</span>
      ) : (
        <QuietButton tone="muted" onClick={onOpen}>Mark settled</QuietButton>
      )}
    </div>
  );
}
