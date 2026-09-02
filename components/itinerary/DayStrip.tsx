'use client';

import { useEffect, useRef } from 'react';
import { dayOfMonth, formatWeekdayShort, todayDateStr } from '@/lib/time';

/**
 * Horizontal day selector across the trip's span.
 *
 * Days only — the "all days" mode switch lives in the section header below,
 * because a mode is not a day and mixing the two made one odd pill sit among
 * six uniform ones. This is the pattern trip apps converge on (TripIt,
 * Wanderlog): the question mid-trip is "what's on today?", not "show me
 * everything at once".
 */
export function DayStrip({
  days, selected, onSelect,
}: {
  days: string[];
  selected: string | 'all';
  onSelect: (value: string) => void;
}) {
  const today = todayDateStr();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // A 7-day strip overflows 390px and the useful day is rarely the first —
  // bring the active one into view on mount, without animating the page.
  useEffect(() => {
    const el = selectedRef.current;
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;
    scroller.scrollLeft = Math.max(0, el.offsetLeft - scroller.clientWidth / 2 + el.clientWidth / 2);
  }, []);

  return (
    <div
      ref={scrollerRef}
      className="flex gap-2 overflow-x-auto px-4 shrink-0 no-scrollbar"
      role="tablist"
      aria-label="Trip days"
    >
      {days.map((date) => {
        const isSelected = selected === date;
        const isToday = date === today;
        return (
          <button
            key={date}
            ref={isSelected ? selectedRef : undefined}
            role="tab"
            aria-selected={isSelected}
            aria-label={isToday ? `Today, ${date}` : date}
            onClick={() => onSelect(date)}
            className="flex flex-col items-center justify-center shrink-0 press-surface"
            style={{
              width: 48,
              height: 58,
              borderRadius: 'var(--radius-md)',
              background: isSelected ? 'var(--foreground)' : 'var(--surface-raised)',
              border: `1px solid ${isSelected ? 'var(--foreground)' : 'var(--border)'}`,
              color: isSelected ? 'var(--background)' : 'var(--foreground)',
            }}
          >
            <span
              className="text-micro"
              style={{ color: isSelected ? 'var(--background)' : 'var(--muted-foreground)', opacity: isSelected ? 0.7 : 1 }}
            >
              {formatWeekdayShort(date).toUpperCase()}
            </span>
            <span className="text-callout" style={{ lineHeight: '20px' }}>{dayOfMonth(date)}</span>
            {/* Today stays findable after you've browsed to another day. */}
            <span
              className="rounded-full"
              style={{
                width: 4, height: 4,
                background: isToday ? (isSelected ? 'var(--background)' : 'var(--accent)') : 'transparent',
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
