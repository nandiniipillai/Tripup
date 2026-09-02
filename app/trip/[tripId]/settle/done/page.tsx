'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { useBalances, useTransfers } from '@/lib/selectors';
import { CURRENT_USER_ID } from '@/lib/seed';
import { expenseTotal } from '@/lib/types';
import { formatCents, formatConverted } from '@/lib/money';
import { PrimaryButton } from '@/components/common/Action';

export default function ConfirmationPage() {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const expenses = useTripStore((s) => s.expenses);
  const balances = useBalances();
  const transfers = useTransfers();

  const totalSpent = expenses.reduce((sum, e) => sum + expenseTotal(e), 0);
  const myShare = balances[CURRENT_USER_ID]?.share ?? 0;
  const settledCount = transfers.filter((t) => t.status === 'settled').length;
  const allSettled = transfers.length > 0 && settledCount === transfers.length;

  // Reachable by direct URL (a reviewer poking at routes), where it would
  // otherwise claim "all squared up" over a "0 of 4" summary. Send them back
  // to the work that isn't finished instead of showing a contradiction.
  useEffect(() => {
    if (!allSettled) router.replace(`/trip/${params.tripId}/settle`);
  }, [allSettled, router, params.tripId]);

  if (!allSettled) return null;

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-8" style={{ background: 'var(--background)' }}>
      {/* Success, so --positive-tint / --positive rather than the accent —
          the accent is for "interactive / live", not "done". */}
      <div
        className="flex items-center justify-center rounded-full animate-circle-scale-in"
        style={{ width: 96, height: 96, background: 'var(--positive-tint)' }}
      >
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
          <path d="M12 22L19 29L32 15" stroke="var(--positive)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="48" className="animate-checkmark-draw" />
        </svg>
      </div>
      <h1 className="text-display text-center mt-6">You&apos;re all squared up!</h1>
      <p className="text-body text-center mt-2 max-w-[280px]" style={{ color: 'var(--muted-foreground)' }}>Ready for the next adventure.</p>

      <div className="w-full mt-8 p-4" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface-raised)' }}>
        <div className="text-micro mb-3" style={{ color: 'var(--muted-foreground)' }}>THIS TRIP</div>
        <div className="flex flex-col gap-3">
          {/* Values carry their ≈ estimate like every other screen (§10), and
              are now heavier than their labels — this had it backwards, with
              13/500 values under 15/400 labels. */}
          <SummaryRow label="Total spent" value={formatCents(totalSpent)} converted={formatConverted(totalSpent, 'EUR', 'USD')} />
          <SummaryRow label="Your share" value={formatCents(myShare)} converted={formatConverted(myShare, 'EUR', 'USD')} />
          <SummaryRow label="Transfers settled" value={`${settledCount} of ${transfers.length}`} />
        </div>
      </div>

      <div className="w-full mt-8 flex flex-col gap-1">
        <PrimaryButton onClick={() => router.replace(`/trip/${params.tripId}/expenses`)}>
          Back to the trip
        </PrimaryButton>
        {/* The standard secondary-action treatment: accent text. This was
            bold black with no chrome, out-shouting the primary above it. */}
        <button
          onClick={() => router.push('/')}
          className="w-full text-callout press-surface"
          style={{ height: 48, borderRadius: 'var(--radius-md)', color: 'var(--accent)' }}
        >
          See all trips
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, converted }: { label: string; value: string; converted?: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-body shrink-0" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
      <span className="text-right min-w-0">
        <span className="text-headline money-tabular block">{value}</span>
        {converted && (
          <span className="text-caption money-tabular block" style={{ color: 'var(--muted-foreground)' }}>{converted}</span>
        )}
      </span>
    </div>
  );
}
