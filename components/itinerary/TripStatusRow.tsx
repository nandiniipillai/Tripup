'use client';

import { useRouter, useParams } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { useBalances } from '@/lib/selectors';
import { CURRENT_USER_ID } from '@/lib/seed';
import { formatCents } from '@/lib/money';

/**
 * Two contextual shortcuts sitting under the day strip.
 *
 * Deliberately not plain duplicates of the tab bar: each carries live state
 * the tab bar can't show — whether a poll is waiting on your vote, and where
 * you stand financially. That's the justification for the extra chrome; if
 * they were only navigation, the tab bar would already be enough.
 */
export function TripStatusRow() {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const polls = useTripStore((s) => s.polls);
  const balances = useBalances();

  const openPoll = Object.values(polls).find((p) => p.status === 'open');
  const iVoted = openPoll ? !!openPoll.votes[CURRENT_USER_ID] : false;
  const myNet = balances[CURRENT_USER_ID]?.net ?? 0;

  const chatValue = openPoll
    ? (iVoted ? 'Poll running' : 'Poll needs you')
    : 'Open chat';

  const balanceValue = myNet === 0
    ? 'All settled'
    : `${myNet < 0 ? 'You owe' : "You're owed"} ${formatCents(Math.abs(myNet))}`;

  return (
    // One divided strip rather than two bordered cards: this is trip status,
    // secondary to the plan itself, so it shouldn't carry the same visual
    // weight as the content below it.
    <div
      className="flex items-stretch mx-4 shrink-0 overflow-hidden"
      style={{ borderRadius: 'var(--radius-md)', background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
    >
      <StatusCell
        icon="💬"
        value={chatValue}
        emphasis={!!openPoll && !iVoted}
        onClick={() => router.replace(`/trip/${params.tripId}/chat`)}
      />
      <div style={{ width: 1, background: 'var(--border)' }} />
      <StatusCell
        icon="💶"
        value={balanceValue}
        tone={myNet < 0 ? 'negative' : 'positive'}
        onClick={() => router.replace(`/trip/${params.tripId}/expenses`)}
      />
    </div>
  );
}

function StatusCell({
  icon, value, emphasis = false, tone, onClick,
}: {
  icon: string;
  value: string;
  emphasis?: boolean;
  tone?: 'positive' | 'negative';
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 min-w-0 flex items-center gap-2 px-3 press-surface"
      style={{ minHeight: 48, background: emphasis ? 'var(--accent-tint)' : undefined }}
    >
      <span style={{ fontSize: 14 }} aria-hidden>{icon}</span>
      <span
        className="text-subhead truncate"
        style={{
          color: emphasis
            ? 'var(--accent)'
            : tone === 'negative'
              ? 'var(--negative)'
              : tone === 'positive'
                ? 'var(--positive)'
                : 'var(--foreground)',
        }}
      >
        {value}
      </span>
    </button>
  );
}
