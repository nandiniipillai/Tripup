'use client';

import { useTripStore } from '@/lib/store';
import { useDisplayBalances, useItineraryByDay } from '@/lib/selectors';
import { CURRENT_USER_ID } from '@/lib/seed';
import { Avatar } from '@/components/common/Avatar';
import { Money } from '@/components/common/Money';
import { formatDateRange, formatTime, NOW } from '@/lib/time';
import type { ItineraryItem } from '@/lib/types';

/**
 * The active trip, as a hero rather than another list row.
 *
 * A trip app opened mid-trip should answer "what's happening right now?"
 * before it answers "what trips do I have?" — so this surfaces live state
 * (which day you're on, what's next, where you stand financially) that the
 * plain row could not. Everything here is derived from the same store the
 * trip screens read, so it can never disagree with them.
 */
export function TripHeroCard({ onClick }: { onClick: () => void }) {
  const trip = useTripStore((s) => s.trip);
  const members = useTripStore((s) => s.members);
  const balances = useDisplayBalances();
  const itineraryByDay = useItineraryByDay();

  const memberList = trip.memberIds.map((id) => members[id]).filter(Boolean);
  const myNet = balances[CURRENT_USER_ID]?.net ?? 0;

  // Day N of M, inclusive of both travel days.
  const msPerDay = 86_400_000;
  const start = new Date(`${trip.startDate}T00:00:00Z`).getTime();
  const end = new Date(`${trip.endDate}T00:00:00Z`).getTime();
  const today = new Date(`${NOW.slice(0, 10)}T00:00:00Z`).getTime();
  const totalDays = Math.round((end - start) / msPerDay) + 1;
  const currentDay = Math.min(Math.max(Math.round((today - start) / msPerDay) + 1, 1), totalDays);

  // The next thing on the calendar that hasn't happened yet.
  const nextItem: ItineraryItem | undefined = itineraryByDay
    .flatMap(([, items]) => items)
    .find((item) => `${item.date}T${item.time}:00` > NOW);

  return (
    <button
      onClick={onClick}
      className="text-left w-full shrink-0 overflow-hidden press-surface"
      style={{
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        className="flex items-start justify-between px-4 pt-4 pb-3"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        <span style={{ fontSize: 32, lineHeight: 1 }} aria-hidden>{trip.coverEmoji}</span>
        <span
          className="inline-flex items-center gap-1.5 shrink-0"
          style={{
            height: 24, paddingInline: 10, borderRadius: 9999,
            background: 'var(--accent-tint)', color: 'var(--accent)',
          }}
        >
          <span className="inline-block rounded-full animate-pulse-dot" style={{ width: 6, height: 6, background: 'var(--accent)' }} />
          <span className="text-micro">DAY {currentDay} OF {totalDays}</span>
        </span>
      </div>

      <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
        <div>
          <div className="text-headline truncate">{trip.name}</div>
          <div className="text-caption truncate" style={{ color: 'var(--muted-foreground)' }}>
            {trip.destination} · {formatDateRange(trip.startDate, trip.endDate)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex">
            {memberList.slice(0, 5).map((m, i) => (
              <span
                key={m.id}
                className="rounded-full"
                style={{ marginLeft: i === 0 ? 0 : -8, boxShadow: '0 0 0 2px var(--surface-raised)' }}
              >
                <Avatar member={m} size={26} />
              </span>
            ))}
            {/* Overflow chip: once the group outgrows the 5-avatar cluster
                (e.g. after Ren joins), the count next to it must not
                silently disagree with what's actually rendered. */}
            {memberList.length > 5 && (
              <span
                className="rounded-full flex items-center justify-center text-micro font-semibold"
                style={{
                  width: 26, height: 26, marginLeft: -8,
                  boxShadow: '0 0 0 2px var(--surface-raised)',
                  background: 'var(--surface)', color: 'var(--muted-foreground)',
                }}
              >
                +{memberList.length - 5}
              </span>
            )}
          </div>
          <span className="text-caption" style={{ color: 'var(--muted-foreground)' }}>
            {memberList.length} people
          </span>
        </div>

        <div className="flex flex-col" style={{ borderTop: '1px solid var(--border)' }}>
          {nextItem && (
            <StatLine
              label="Next up"
              value={(
                <span className="truncate">
                  <span className="money-tabular" style={{ color: 'var(--muted-foreground)' }}>{formatTime(nextItem.time)}</span>
                  {'  '}{nextItem.title}
                </span>
              )}
            />
          )}
          <StatLine
            label={myNet < 0 ? 'You owe' : myNet > 0 ? "You're owed" : 'Balance'}
            value={myNet === 0
              ? <span className="text-subhead" style={{ color: 'var(--positive)' }}>All settled</span>
              : <Money value={Math.abs(myNet)} size="subhead" colorClass={myNet < 0 ? 'text-[var(--negative)]' : 'text-[var(--positive)]'} />}
          />
        </div>
      </div>
    </button>
  );
}

function StatLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3" style={{ minHeight: 34 }}>
      <span className="text-caption shrink-0" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
      <span className="text-subhead min-w-0 text-right">{value}</span>
    </div>
  );
}
