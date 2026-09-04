'use client';

import type { ReactNode } from 'react';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string; // slim trip-identity caption under the title (BUILD-SPEC deep-link fix)
  left?: ReactNode;
  right?: ReactNode;
  onBack?: () => void;
  backLabel?: string; // 'Cancel' text button, or omit for a chevron
}

export function ScreenHeader({ title, subtitle, left, right, onBack, backLabel }: ScreenHeaderProps) {
  return (
    <header
      className="flex items-center px-2 shrink-0"
      style={{
        minHeight: 56,
        paddingTop: subtitle ? 6 : 0,
        paddingBottom: subtitle ? 6 : 0,
        background: 'var(--surface-raised)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="flex-1 flex items-center">
        {left ?? (onBack && (
          backLabel ? (
            <button onClick={onBack} className="text-callout px-3" style={{ color: 'var(--accent)', minHeight: 44 }}>
              {backLabel}
            </button>
          ) : (
            <button aria-label="Back" onClick={onBack} className="flex items-center justify-center" style={{ width: 44, height: 44 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 4L6.5 10L12.5 16" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )
        ))}
      </div>
      {/* flex-[3] (was flex-[2]): with equal 1:1 side rails, "Record payment
          from Sam" measured 206px of text against a 187px title box (1:2:1
          split of the 374px content width) and truncated. 1:3:1 gives the
          title ~224px — comfortably past every title this header carries
          (checked: Settle up, New expense, New poll, Add to itinerary, and
          every SettleSheet copy.title variant) — while still leaving room for
          the longest side content ("Cancel"). */}
      <div className="flex-[3] min-w-0 text-center">
        <div className="text-headline truncate">{title}</div>
        {subtitle && (
          <div className="text-caption truncate" style={{ color: 'var(--muted-foreground)' }}>
            {subtitle}
          </div>
        )}
      </div>
      <div className="flex-1 flex items-center justify-end">{right}</div>
    </header>
  );
}
