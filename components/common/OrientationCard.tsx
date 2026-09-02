'use client';

import { useState } from 'react';

const TRY_ITEMS = [
  'Add Ren to the group',
  'Start a poll for dinner',
  'Watch votes come in live',
  'Log the dinner expense (try excluding someone from one item)',
  'Settle up',
];

/**
 * Demo scaffolding — and it must read as scaffolding. It was previously 268px
 * tall (more than all three trip rows combined), accent-tinted with accent
 * bullets and a synthesised-bold <strong> that outweighed the "Trips" title
 * above it, which made the note the visual centrepiece of the first screen.
 *
 * Now: one sentence on a neutral surface, with the walkthrough behind a
 * collapsed disclosure. It sits *below* the product in visual weight.
 */
export function OrientationCard({ onDismiss }: { onDismiss: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="relative flex flex-col"
      style={{
        background: 'var(--surface-raised)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 12,
      }}
    >
      <button
        aria-label="Dismiss"
        onClick={onDismiss}
        className="absolute flex items-center justify-center pressable"
        style={{ top: 2, right: 2, width: 44, height: 44, borderRadius: 9999, color: 'var(--subtle-foreground)' }}
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <p className="text-body" style={{ paddingRight: 32, color: 'var(--muted-foreground)' }}>
        You&apos;re Ari, mid-trip in Lisbon with Jules, Nic, Sam and Mia.
      </p>

      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="hit-44-inset inline-flex items-center gap-1 self-start press-surface"
        style={{
          marginTop: 4,
          paddingInline: 6,
          marginInline: -6,
          borderRadius: 'var(--radius-sm)',
          fontSize: 13,
          lineHeight: '18px',
          fontWeight: 500,
          color: 'var(--accent)',
        }}
      >
        Try this
        <svg
          width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease-out' }}
        >
          <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <ol className="flex flex-col gap-1.5 animate-fold-in" style={{ marginTop: 4 }}>
          {TRY_ITEMS.map((item, i) => (
            <li key={item} className="flex items-start gap-2 text-subhead" style={{ color: 'var(--muted-foreground)' }}>
              <span
                className="shrink-0 inline-flex items-center justify-center money-tabular"
                style={{
                  width: 16, height: 16, marginTop: 1, borderRadius: 9999,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  fontSize: 10, lineHeight: '14px', fontWeight: 600, color: 'var(--muted-foreground)',
                }}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
          <li className="text-caption" style={{ color: 'var(--subtle-foreground)', paddingLeft: 24 }}>
            Refresh anytime to reset the demo.
          </li>
        </ol>
      )}
    </div>
  );
}
