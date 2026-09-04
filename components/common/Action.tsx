'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * The app's action vocabulary — three treatments, used everywhere, so a
 * reviewer can read importance off shape alone.
 *
 *   PrimaryButton    full-width 48px accent fill        one per screen
 *   SecondaryButton  32px pill, 44px hit target         repeatable actions
 *   QuietButton      bare label, no container, 44px hit tertiary / off-screen-topic
 *   DashedAddRow     full-width 44px dashed add row     "+ Add another …"
 *
 * Before this existed the same action type appeared as a 32px accent-filled
 * pill in one place and bare 40px accent text in another (Group Info "Add" vs
 * the poll card's "Add option"). Everything routes through here now.
 */

type ButtonBase = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  children: ReactNode;
  className?: string;
};

/** Full-width primary CTA. 48px, --radius-md, accent fill, text-callout. */
export function PrimaryButton({ children, className = '', ...rest }: ButtonBase) {
  return (
    <button
      {...rest}
      // shrink-0: these sit in flex-column scroll areas, where the default
      // flex-shrink:1 was quietly compressing the 48px button to 40px and
      // leaving the 15px label looking oversized inside it.
      className={`w-full shrink-0 text-callout press-accent ${className}`}
      style={{
        height: 48,
        borderRadius: 'var(--radius-md)',
        background: 'var(--accent)',
        color: 'var(--accent-foreground)',
      }}
    >
      {children}
    </button>
  );
}

/**
 * The single secondary-action treatment. A 32px pill with a 44px hit box
 * (padding, not a bigger pill — §8.1).
 *
 *   tone="outline"   accent label on a hairline pill  — the default
 *   tone="filled"    accent fill                      — when it is the row's primary act
 *   tone="negative"  negative fill                     — the row's primary act IS paying
 *                     money out (§6.9 Zone 1 "you owe"), matching the hi-fi's
 *                     red Pay button — not the neutral accent used everywhere else
 */
export function SecondaryButton({
  children, tone = 'outline', className = '', ...rest
}: ButtonBase & { tone?: 'outline' | 'filled' | 'negative' }) {
  const filled = tone === 'filled' || tone === 'negative';
  const fillColor = tone === 'negative' ? 'var(--negative)' : 'var(--accent)';
  return (
    // hit-44-after, not min-height: this element IS the visible pill, so a
    // 44px minimum would inflate it into a blob. The invisible ::after does
    // the reaching instead.
    <button
      {...rest}
      className={`hit-44-after inline-flex items-center justify-center shrink-0 px-3 ${filled ? 'press-accent' : 'pressable'} ${className}`}
      style={{
        height: 32,
        borderRadius: 9999,
        fontSize: 13,
        lineHeight: '18px',
        fontWeight: 600,
        background: filled ? fillColor : 'transparent',
        border: filled ? '1px solid transparent' : '1px solid var(--border-strong)',
        color: filled ? '#FFFFFF' : 'var(--accent)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

/**
 * Tertiary action: a bare label, no container. 44px hit height, laid out so
 * the surrounding rhythm does not change.
 *
 *   tone="accent"  the app's standard text button (Cancel / Done / View)
 *   tone="muted"   deliberately quieter than its neighbours (§6.9 Zone 2)
 */
export function QuietButton({
  children, tone = 'accent', className = '', ...rest
}: ButtonBase & { tone?: 'accent' | 'muted' }) {
  return (
    <button
      {...rest}
      className={`hit-44-inset inline-flex items-center gap-1 shrink-0 press-surface ${className}`}
      style={{
        paddingInline: 8,
        marginInline: -8,
        borderRadius: 'var(--radius-sm)',
        fontSize: 13,
        lineHeight: '18px',
        fontWeight: 500,
        color: tone === 'accent' ? 'var(--accent)' : 'var(--muted-foreground)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

/** Full-width dashed "+ Add …" row. 44px, --radius-md, accent label. */
export function DashedAddRow({ children, className = '', ...rest }: ButtonBase) {
  return (
    <button
      {...rest}
      className={`w-full shrink-0 text-left text-callout px-3 press-surface ${className}`}
      style={{
        height: 44,
        color: 'var(--accent)',
        border: '1px dashed var(--border-strong)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      {children}
    </button>
  );
}
