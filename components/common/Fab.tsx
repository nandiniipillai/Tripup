'use client';

import type { ReactNode } from 'react';

/**
 * Floating action button.
 *
 * Positioning: the Fab must be a SIBLING of the scroll area and a child of the
 * screen's `relative` outer container — never a child of the scroller — so its
 * position is scroll-independent. Every screen that mounts it does this, and
 * each pairs it with bottom padding (or a spacer) on the scroll area so the
 * last row can always be scrolled clear of it.
 *
 * Elevation: --shadow-float, the floating tier of the ladder. It previously
 * used `0 8px 20px rgba(37,99,235,0.35)` — a coloured accent glow that is not
 * in the system and made the Fab the loudest object on two screens.
 */
export function Fab({ label, onClick, icon }: { label: string; onClick: () => void; icon?: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="absolute flex items-center gap-1.5 text-callout press-accent"
      style={{
        right: 16,
        bottom: 16,
        height: 48,
        padding: '0 20px',
        borderRadius: 9999,
        background: 'var(--accent)',
        color: 'var(--accent-foreground)',
        boxShadow: 'var(--shadow-float)',
        minWidth: 44,
        minHeight: 44,
      }}
    >
      {icon}
      {label}
    </button>
  );
}
