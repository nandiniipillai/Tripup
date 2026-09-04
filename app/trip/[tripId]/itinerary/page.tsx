'use client';

import { useEffect, useState } from 'react';
import { useTripStore } from '@/lib/store';
import { useItineraryByDay } from '@/lib/selectors';
import { ItineraryDayGroup } from '@/components/itinerary/ItineraryDayGroup';
import { ItineraryItemCard } from '@/components/itinerary/ItineraryItemCard';
import { DayStrip } from '@/components/itinerary/DayStrip';
import { TripStatusRow } from '@/components/itinerary/TripStatusRow';
import { QuietButton } from '@/components/common/Action';
import { EmptyState } from '@/components/common/EmptyState';
import { enumerateDays, formatDayHeaderTitleCase, todayDateStr, tripDayNumber } from '@/lib/time';

/**
 * The trip's landing screen.
 *
 * Opening a trip lands here rather than on Chat: the itinerary is the artifact
 * the group is actually building, and "what's the plan?" is the question a
 * traveller opens the app with mid-trip. Chat is how the plan gets decided, so
 * it stays one tap away — in the tab bar and in TripStatusRow, which also says
 * whether a poll is waiting on you.
 */
export default function ItineraryPage() {
  const setActiveTab = useTripStore((s) => s.setActiveTab);
  const openSheet = useTripStore((s) => s.openSheet);
  const trip = useTripStore((s) => s.trip);
  const groups = useItineraryByDay();

  const days = enumerateDays(trip.startDate, trip.endDate);
  const today = todayDateStr();
  // Default to today when the trip is in progress; otherwise the whole plan.
  const [selected, setSelected] = useState<string | 'all'>(() => (days.includes(today) ? today : 'all'));

  useEffect(() => {
    setActiveTab('itinerary');
  }, [setActiveTab]);

  const selectedItems = selected === 'all'
    ? []
    : (groups.find(([date]) => date === selected)?.[1] ?? []);

  return (
    <div className="flex-1 min-h-0 flex flex-col relative" style={{ background: 'var(--surface)' }}>
      {/* Header action rather than a FAB — matches Expenses, and keeps a
          floating accent button from occluding timeline rows on arrival. */}
      <div className="px-4 pt-3 pb-3 shrink-0 flex items-center justify-between gap-3" style={{ background: 'var(--surface)' }}>
        <div className="text-title">Itinerary</div>
        <QuietButton onClick={() => openSheet('addItinerary')}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add
        </QuietButton>
      </div>

      {/* Order is deliberate: trip-level status, then the day filter, then the
          day's plan. The status row used to sit between the strip and its own
          results, which broke the control→content relationship. */}
      <TripStatusRow />
      <div style={{ height: 12 }} className="shrink-0" />
      <DayStrip days={days} selected={selected} onSelect={setSelected} />

      {groups.length === 0 ? (
        <EmptyState glyph="🗺️" title="Nothing planned yet" body="Add your first stop or wait for a poll to decide one." actionLabel="Add to itinerary" onAction={() => openSheet('addItinerary')} />
      ) : selected === 'all' ? (
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <SectionHeader
            left={`ALL ${days.length} DAYS`}
            actionLabel="Today"
            onAction={() => setSelected(days.includes(today) ? today : days[0])}
          />
          {groups.map(([date, items]) => (
            <ItineraryDayGroup key={date} date={date} items={items} />
          ))}
          <div style={{ height: 24 }} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <SectionHeader
            left={`${selected === today ? 'TODAY' : formatDayHeaderTitleCase(selected).toUpperCase()} · DAY ${tripDayNumber(selected, trip.startDate, trip.endDate)} OF ${days.length}`}
            actionLabel={`All ${days.length} days`}
            onAction={() => setSelected('all')}
          />
          {selectedItems.length === 0 ? (
            <div className="px-4 pt-6 pb-8 text-center">
              <div className="text-body" style={{ color: 'var(--muted-foreground)' }}>Nothing planned for this day.</div>
              <div className="mt-3 flex justify-center">
                <QuietButton onClick={() => openSheet('addItinerary')}>+ Add something</QuietButton>
              </div>
            </div>
          ) : (
            <div className="px-4">
              {selectedItems.map((item) => (
                <ItineraryItemCard key={item.id} item={item} pastDay={selected < today} />
              ))}
            </div>
          )}
          <div style={{ height: 24 }} />
        </div>
      )}
    </div>
  );
}

/** Day context on the left, the day/all mode switch on the right. */
function SectionHeader({
  left, actionLabel, onAction,
}: { left: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="px-4 pt-4 pb-1 flex items-center justify-between gap-3">
      <span className="text-micro" style={{ color: 'var(--muted-foreground)' }}>{left}</span>
      <QuietButton onClick={onAction}>{actionLabel}</QuietButton>
    </div>
  );
}
