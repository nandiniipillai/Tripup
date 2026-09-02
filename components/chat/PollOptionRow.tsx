'use client';

import type { PollOption, Member } from '@/lib/types';
import { Avatar } from '@/components/common/Avatar';

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
  onVote?: () => void;
}

export function PollOptionRow({
  option, voteCount, pct, voters, isLeading, isMine, isWinner, isClosed, deemphasized, onVote,
}: PollOptionRowProps) {
  const trackBg = deemphasized ? 'var(--surface)' : 'var(--accent-tint)';
  const fillBg = deemphasized ? 'var(--border)' : 'rgba(37,99,235,0.22)';

  const content = (
    <div
      className="relative overflow-hidden w-full text-left animate-row-flash"
      style={{
        borderRadius: 'var(--radius-md)',
        minHeight: option.descriptor ? 60 : 52,
        background: trackBg,
        border: isWinner ? '2px solid var(--accent)' : isMine && !isClosed ? '1.5px solid var(--accent)' : '1px solid transparent',
        borderLeft: isLeading && !isClosed ? '2px solid var(--accent)' : undefined,
        opacity: deemphasized ? 0.45 : 1,
      }}
    >
      {/* Leading corners only. Rounding all four made a partial fill read as a
          floating pill inside the track, and on the closed card its rounded
          trailing edge cut a curve through the WINNER badge. */}
      <div
        className="absolute inset-y-0 left-0 vote-bar-fill"
        style={{
          width: `${pct}%`,
          background: fillBg,
          borderRadius: pct >= 99 ? 'var(--radius-md)' : 'var(--radius-md) 0 0 var(--radius-md)',
        }}
        aria-hidden="true"
      />
      <div className="relative flex items-center justify-between gap-2 px-3 py-2 h-full">
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            {isMine && !isClosed && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7.5L5.5 10L11 4" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <span className="text-body font-semibold truncate" style={{ color: isLeading && !isClosed ? 'var(--accent)' : isWinner ? 'var(--foreground)' : 'var(--foreground)' }}>
              {option.name}
            </span>
            {isWinner && (
              <span className="text-micro px-1.5 py-0.5 rounded shrink-0" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>
                WINNER
              </span>
            )}
          </div>
          {option.descriptor && (
            <div className="text-caption truncate" style={{ color: 'var(--muted-foreground)' }}>{option.descriptor}</div>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center">
            {voters.slice(0, 3).map((v, i) => (
              <div key={v.id} className="animate-avatar-in" style={{ marginLeft: i === 0 ? 0 : -6 }}>
                <div style={{ boxShadow: '0 0 0 2px var(--surface-raised)', borderRadius: 9999 }}>
                  <Avatar member={v} size={16} />
                </div>
              </div>
            ))}
          </div>
          <span className="text-subhead tabular-nums" style={{ color: 'var(--muted-foreground)' }}>{voteCount}</span>
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
