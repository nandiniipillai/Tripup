'use client';

import { useRouter, useParams } from 'next/navigation';
import type { ItineraryItem } from '@/lib/types';
import { useTripStore } from '@/lib/store';
import { Money } from '@/components/common/Money';
import { SecondaryButton } from '@/components/common/Action';

/**
 * Location, note, cost and poll-provenance used to render as four identical
 * grey caption lines, so "From the poll · 3 of 5 votes" — the one genuinely
 * differentiating fact on the screen — looked like a street address. And
 * "Log as expense" was bare accent text in the same run, reading as a fourth
 * metadata line that happened to be blue.
 *
 * Now: provenance is a chip, the cost goes through <Money>, and the action
 * gets a real container.
 */
export function ItineraryItemCard({ item, pastDay }: { item: ItineraryItem; pastDay: boolean }) {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const highlightId = useTripStore((s) => s.ui.highlightItineraryItemId);
  const isHighlighted = highlightId === item.id;

  const showLogAsExpense = item.estimatedCostPerPerson != null && !item.convertedToExpenseId;

  return (
    <div
      className={`flex gap-3 py-3 ${isHighlighted ? 'animate-highlight-flash' : ''}`}
      style={{ opacity: pastDay ? 0.6 : 1, borderBottom: '1px solid var(--border)' }}
    >
      <div className="text-subhead money-tabular shrink-0" style={{ width: 44, paddingTop: 2, color: 'var(--muted-foreground)' }}>
        {item.time}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-headline">{item.title}</div>

        <div className="text-caption truncate" style={{ color: 'var(--muted-foreground)' }}>{item.location}</div>
        {item.note && (
          <div className="text-caption truncate" style={{ color: 'var(--muted-foreground)' }}>{item.note}</div>
        )}

        {item.estimatedCostPerPerson != null && (
          // A labelled value, not a fourth grey sentence. <Money> owns the
          // formatting, which also kills the doubled "≈ €9.00 … (≈ $9.73)"
          // this line used to hand-roll.
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-caption shrink-0" style={{ color: 'var(--muted-foreground)' }}>Est. per person</span>
            <Money value={item.estimatedCostPerPerson} size="subhead" />
          </div>
        )}

        {/* Provenance reads as a badge, not as another address line. */}
        {item.source === 'poll' && item.votesLabel && (
          <span
            className="inline-flex items-center gap-1 mt-1.5 px-2"
            style={{
              height: 22,
              borderRadius: 9999,
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              fontSize: 11,
              lineHeight: '14px',
              fontWeight: 600,
              letterSpacing: '0.02em',
              color: 'var(--muted-foreground)',
            }}
          >
            <span aria-hidden="true">🗳</span>
            From the poll · {item.votesLabel}
          </span>
        )}

        {showLogAsExpense && (
          <div className="mt-2">
            <SecondaryButton onClick={() => router.push(`/trip/${params.tripId}/expenses/new?fromItem=${item.id}`)}>
              Log as expense
            </SecondaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
