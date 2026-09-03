'use client';

import type { PollOption, Member } from '@/lib/types';
import { Avatar } from '@/components/common/Avatar';
import { CURRENT_USER_ID } from '@/lib/seed';

interface PollOptionRowProps {
  option: PollOption;
  voteCount: number;
  pct: number;
  voters: Member[];
  isLeading: boolean;
  isMine: boolean;
  isWinner: boolean;
  isClosed: boolean;
  deemphasized: boolean; // closed and not the winner
  addedByMember?: Member; // set when option.isSuggested — the member who added it mid-poll
  onVote?: () => void;
}

/**
 * Rework per the hi-fi (§ poll card): the horizontal vote-bar fill is gone.
 * Each option is now a plain bordered row; the only vote-share signal left is
 * the leading/winning row's accent border + checkmark + bold accent title,
 * plus the avatar-chip cluster and count on the right. `pct` is kept in the
 * prop signature (PollCard still computes it) but is no longer rendered —
 * removing it from the parent would be a needless churn of call sites for a
 * value that costs nothing to ignore here.
 */
export function PollOptionRow({
  option, voteCount, voters, isLeading, isMine, isWinner, isClosed, deemphasized, addedByMember, onVote,
}: PollOptionRowProps) {
  const highlighted = isWinner || (isLeading && !isClosed);
  const hasVotes = voteCount > 0;

  const content = (
    <div
      className="relative w-full text-left animate-row-flash"
      style={{
        borderRadius: 'var(--radius-md)',
        minHeight: option.descriptor ? 64 : 56,
        background: 'var(--surface)',
        border: highlighted ? '2px solid var(--accent)' : '1px solid var(--border)',
        opacity: deemphasized ? 0.45 : 1,
      }}
    >
      <div className="relative flex items-center justify-between gap-2 px-3 py-2 h-full">
        <div className="flex items-center gap-2 min-w-0">
          {highlighted && (
            // Filled accent circle + checkmark — the one visual signal for
            // "this option is ahead" now that the fill-bar is gone.
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden="true">
              <circle cx="10" cy="10" r="10" fill="var(--accent)" />
              <path d="M5.5 10.3L8.3 13L14.5 6.5" stroke="var(--accent-foreground)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={highlighted ? 'text-callout font-semibold truncate' : 'text-body truncate'}
                style={{ color: highlighted ? 'var(--accent)' : 'var(--foreground)' }}
              >
                {option.name}
              </span>
              {isWinner && (
                <span className="text-micro px-1.5 py-0.5 rounded shrink-0" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>
                  WINNER
                </span>
              )}
              {option.isSuggested && (
                <span className="text-caption shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                  added by {addedByMember?.name ?? 'a member'}
                </span>
              )}
            </div>
            {option.descriptor && (
              <div className="text-caption truncate" style={{ color: 'var(--muted-foreground)' }}>{option.descriptor}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasVotes && (
            <div className="flex items-center">
              {voters.slice(0, 3).map((v, i) => (
                <div
                  key={v.id}
                  className="animate-avatar-in"
                  // Current user sorted first (PollCard) so their ring can't be
                  // sliced away — but first-in-stack also paints first, so a
                  // later, unringed avatar's overlap would visually clip the
                  // ring right where it's needed most. A relative z-index
                  // above its neighbours keeps it fully visible.
                  style={{ marginLeft: i === 0 ? 0 : -6, position: 'relative', zIndex: v.id === CURRENT_USER_ID ? 1 : 0 }}
                >
                  {/* The page-bg ring is the shared "chip in a cluster" separator;
                      the accent ring on top of it is the only remaining signal
                      for "this is the option you picked" now that the old
                      isMine outline is gone — reuses Avatar's existing `ringed`
                      rather than a new indicator. */}
                  <div style={{ boxShadow: '0 0 0 2px var(--surface)', borderRadius: 9999 }}>
                    <Avatar member={v} size={20} ringed={v.id === CURRENT_USER_ID} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <span className="text-callout font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{voteCount}</span>
        </div>
      </div>
    </div>
  );

  if (isClosed || !onVote) {
    return <div role="presentation">{content}</div>;
  }

  return (
    <button
      role="radio"
      aria-checked={isMine}
      onClick={onVote}
      className="w-full pressable"
    >
      {content}
    </button>
  );
}
