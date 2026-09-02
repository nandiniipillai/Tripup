'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTripStore } from '@/lib/store';
import { TRIP_ID, OTHER_TRIPS, CURRENT_USER_ID } from '@/lib/seed';
import { Avatar } from '@/components/common/Avatar';
import { OrientationCard } from '@/components/common/OrientationCard';
import { DashedAddRow } from '@/components/common/Action';
import { TripHeroCard } from '@/components/home/TripHeroCard';
import { formatDateRange, monthsBetween, NOW } from '@/lib/time';

export default function HomePage() {
  const router = useRouter();
  const members = useTripStore((s) => s.members);
  const me = members[CURRENT_USER_ID];
  const [showOrientation, setShowOrientation] = useState(true);

  const upcoming = OTHER_TRIPS.filter((t) => t.status === 'upcoming');
  const past = OTHER_TRIPS.filter((t) => t.status === 'past');

  return (
    // --surface is the ground on every other screen; Home was the one screen
    // painting --background (#FFF) behind --surface-raised (#FFF) rows, so the
    // rows had no ground to sit on.
    <div className="flex-1 min-h-0 flex flex-col" style={{ background: 'var(--surface)' }}>
      <header className="flex items-center justify-between px-4 pt-3 pb-3 shrink-0">
        <h1 className="text-title">Trips</h1>
        <div className="flex items-center gap-1">
          {/* The "?" slot is always rendered, just inert and invisible while
              the orientation card is up. Reserving it means dismissing the
              card no longer shifts the avatar 40px sideways. */}
          <button
            aria-label="What is this?"
            aria-hidden={showOrientation}
            tabIndex={showOrientation ? -1 : 0}
            disabled={showOrientation}
            onClick={() => setShowOrientation(true)}
            className="flex items-center justify-center shrink-0 pressable"
            style={{
              width: 32, height: 32, borderRadius: 9999,
              border: '1px solid var(--border-strong)', color: 'var(--muted-foreground)',
              opacity: showOrientation ? 0 : 1,
              pointerEvents: showOrientation ? 'none' : undefined,
              transition: 'opacity 200ms ease-out',
            }}
          >
            <span className="text-subhead font-semibold">?</span>
          </button>
          {me && <Avatar member={me} size={32} />}
        </div>
      </header>

      {/* Sectioned rather than one flat list: the trip you're actually on is a
          different kind of object from the ones you're not, and saying so in
          the structure is what makes this read as a home screen. */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-3">
        {showOrientation && <OrientationCard onDismiss={() => setShowOrientation(false)} />}

        <SectionLabel>HAPPENING NOW</SectionLabel>
        <TripHeroCard onClick={() => router.push(`/trip/${TRIP_ID}/itinerary`)} />

        {upcoming.length > 0 && (
          <>
            <SectionLabel className="mt-2">UPCOMING</SectionLabel>
            {upcoming.map((t) => (
              <TripRow
                key={t.id}
                coverEmoji={t.coverEmoji}
                name={t.name}
                subtitle={`${formatDateRange(t.startDate, t.endDate)} · ${t.memberCount} people`}
                trailing={<span className="text-caption" style={{ color: 'var(--muted-foreground)' }}>{`In ${monthsBetween(NOW, t.startDate)} months`}</span>}
                onClick={() => toast("This trip isn't part of the demo — open Lisbon Getaway.")}
              />
            ))}
          </>
        )}

        {past.length > 0 && (
          <>
            <SectionLabel className="mt-2">PAST</SectionLabel>
            {past.map((t) => (
              <TripRow
                key={t.id}
                coverEmoji={t.coverEmoji}
                name={t.name}
                subtitle={`${formatDateRange(t.startDate, t.endDate)} · ${t.memberCount} people`}
                trailing={(
                  <span className="inline-flex items-center gap-1" style={{ color: 'var(--positive)' }}>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-caption">Settled</span>
                  </span>
                )}
                onClick={() => toast("This trip isn't part of the demo — open Lisbon Getaway.")}
              />
            ))}
          </>
        )}

        <DashedAddRow className="mt-2" onClick={() => toast('Creating new trips is outside this demo.')}>
          + New trip
        </DashedAddRow>
      </div>
    </div>
  );
}

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`text-micro shrink-0 ${className}`} style={{ color: 'var(--muted-foreground)' }}>
      {children}
    </div>
  );
}

function TripRow({
  coverEmoji, name, subtitle, trailing, onClick,
}: { coverEmoji: string; name: string; subtitle: string; trailing: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 text-left px-3 shrink-0 pressable"
      // Border instead of a shadow (§5.7) — these rows carried both.
      style={{
        height: 72,
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        className="flex items-center justify-center shrink-0"
        style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--surface)', fontSize: 22 }}
        aria-hidden="true"
      >
        {coverEmoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-headline truncate">{name}</div>
        <div className="text-caption truncate" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</div>
      </div>
      <div className="shrink-0 flex items-center">{trailing}</div>
    </button>
  );
}
