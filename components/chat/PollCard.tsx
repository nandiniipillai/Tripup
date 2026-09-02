'use client';

import type { Poll } from '@/lib/types';
import { CURRENT_USER_ID } from '@/lib/seed';
import { useTripStore } from '@/lib/store';
import { PollOptionRow } from './PollOptionRow';
import { AddOptionInline } from './AddOptionInline';
import { QuietButton } from '@/components/common/Action';

export function PollCard({ poll }: { poll: Poll }) {
  const members = useTripStore((s) => s.members);
  const castVote = useTripStore((s) => s.castVote);
  const addPollOption = useTripStore((s) => s.addPollOption);
  const setOpenDialog = useTripStore((s) => s.setOpenDialog);

  const tally: Record<string, number> = {};
  for (const o of poll.options) tally[o.id] = 0;
  for (const optId of Object.values(poll.votes)) tally[optId] = (tally[optId] ?? 0) + 1;
  const totalVotes = Object.keys(poll.votes).length;
  const counts = Object.values(tally);
  const maxCount = counts.length ? Math.max(...counts) : 0;
  const leaders = poll.options.filter((o) => tally[o.id] === maxCount);
  const isTie = leaders.length > 1 && maxCount > 0;

  const isOpen = poll.status === 'open';
  const isTieBreak = poll.status === 'tie_break';
  const isClosed = poll.status === 'closed';
  const myVote = poll.votes[CURRENT_USER_ID];

  return (
    <div
      className="w-full animate-feed-in"
      // Border INSTEAD of a shadow (§5.7) — this carried both, as did the Home
      // trip rows and the itinerary preview card, while LineItemCard and the
      // balance/expense groups correctly used border-only.
      style={{
        borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface-raised)',
        padding: 12,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        {isOpen && (
          <div className="flex items-center gap-1.5">
            <span className="inline-block rounded-full animate-live-pulse" style={{ width: 6, height: 6, background: 'var(--accent)' }} />
            <span className="text-micro" style={{ color: 'var(--accent)' }}>LIVE</span>
          </div>
        )}
        {isTieBreak && <span className="text-micro" style={{ color: 'var(--negative)' }}>TIE — NEEDS A DECISION</span>}
        {isClosed && (
          <div className="flex items-center gap-1.5">
            <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: 'var(--subtle-foreground)' }} />
            <span className="text-micro" style={{ color: 'var(--muted-foreground)' }}>CLOSED</span>
          </div>
        )}
        {isOpen && (
          <span className="text-caption" style={{ color: 'var(--muted-foreground)' }}>
            {totalVotes} of {poll.eligibleVoterIds.length} voted
          </span>
        )}
      </div>

      <div className="text-headline mb-2">{poll.question}</div>

      <div className="flex flex-col gap-2" role={isOpen ? 'radiogroup' : undefined} aria-label={isOpen ? poll.question : undefined}>
        {poll.options.map((opt) => {
          const voteCount = tally[opt.id] ?? 0;
          const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const voters = Object.entries(poll.votes).filter(([, optId]) => optId === opt.id).map(([mid]) => members[mid]).filter(Boolean);
          const isLeading = isOpen && !isTie && voteCount === maxCount && voteCount > 0;
          return (
            <PollOptionRow
              key={opt.id}
              option={opt}
              voteCount={voteCount}
              pct={pct}
              voters={voters}
              isLeading={isLeading}
              isMine={myVote === opt.id}
              isWinner={isClosed && poll.winningOptionId === opt.id}
              isClosed={!isOpen}
              deemphasized={isClosed && poll.winningOptionId !== opt.id}
              onVote={isOpen ? () => castVote(poll.id, CURRENT_USER_ID, opt.id) : undefined}
            />
          );
        })}
      </div>

      {isOpen && (
        <>
          {poll.addedOptionCaption && (
            <div className="text-caption text-center mt-2" style={{ color: 'var(--muted-foreground)' }}>{poll.addedOptionCaption.text}</div>
          )}
          <div className="mt-2">
            <AddOptionInline onAdd={(name) => addPollOption(poll.id, { name }, CURRENT_USER_ID)} />
          </div>
          <div className="flex items-center justify-between gap-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-caption min-w-0 truncate" style={{ color: 'var(--muted-foreground)' }}>Closes when everyone&apos;s voted</span>
            <QuietButton onClick={() => setOpenDialog({ type: 'closePoll', pollId: poll.id })}>
              Close poll
            </QuietButton>
          </div>
        </>
      )}

      {isClosed && (
        <div className="text-caption mt-2 pt-2" style={{ borderTop: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
          {poll.closedEarly ? `Closed early by Ari · ${totalVotes} of ${poll.eligibleVoterIds.length} voted` : `Closed · ${totalVotes} of ${poll.eligibleVoterIds.length} voted`}
        </div>
      )}
    </div>
  );
}
