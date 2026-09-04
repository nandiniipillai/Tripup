'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { useDisplayBalances, useTransfers } from '@/lib/selectors';
import { CURRENT_USER_ID } from '@/lib/seed';
import { BalanceRow } from '@/components/expenses/BalanceRow';
import { ExpenseListRow } from '@/components/expenses/ExpenseListRow';
import { ExpenseDetailSheet } from '@/components/expenses/ExpenseDetailSheet';
import { PrimaryButton, QuietButton } from '@/components/common/Action';
import { EmptyState } from '@/components/common/EmptyState';
import { Separator } from '@/components/ui/separator';

export default function ExpensesPage() {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const setActiveTab = useTripStore((s) => s.setActiveTab);
  const trip = useTripStore((s) => s.trip);
  const members = useTripStore((s) => s.members);
  const expenses = useTripStore((s) => s.expenses);
  const balances = useDisplayBalances();
  const transfers = useTransfers();
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const selectedExpense = expenses.find((e) => e.id === selectedExpenseId) ?? null;
  const tripMemberList = trip.memberIds.map((id) => members[id]).filter(Boolean);

  useEffect(() => {
    setActiveTab('expenses');
  }, [setActiveTab]);

  const outstandingCount = transfers.filter((t) => t.status === 'outstanding').length;

  const orderedMemberIds = [
    CURRENT_USER_ID,
    ...trip.memberIds
      .filter((id) => id !== CURRENT_USER_ID)
      .sort((a, b) => Math.abs(balances[b]?.net ?? 0) - Math.abs(balances[a]?.net ?? 0)),
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col relative" style={{ background: 'var(--surface)' }}>
      {/* "Log expense" lives in the header, not a FAB: this screen's primary
          action is already "Settle up" (full-width accent), and a second
          accent-filled floating button both competed with it for primacy and
          occluded the first expense row at the default scroll position. */}
      <div className="px-4 pt-3 pb-1 shrink-0 flex items-center justify-between gap-3">
        <div className="text-title">Expenses</div>
        <QuietButton onClick={() => router.push(`/trip/${params.tripId}/expenses/new`)}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Log expense
        </QuietButton>
      </div>
      {/* The "N payments instead of M" line now lives on Settle Up only
          (matches the hi-fi) — showing it here too repeated the app's best
          line one tap before the screen that actually delivers on it. */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 flex flex-col gap-4">
        <div>
          <div className="text-micro mb-2" style={{ color: 'var(--muted-foreground)' }}>BALANCES</div>
          {/* overflow:hidden so the current-user row's tinted ground clips to
              the card's rounded corners instead of squaring them off. */}
          <div style={{ borderRadius: 'var(--radius-lg)', background: 'var(--surface-raised)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {orderedMemberIds.map((id, i) => {
              const member = members[id];
              const balance = balances[id];
              if (!member || !balance) return null;
              return (
                <div key={id}>
                  {i > 0 && <div style={{ borderTop: '1px solid var(--border)' }} />}
                  <BalanceRow member={member} balance={balance} />
                </div>
              );
            })}
          </div>
        </div>

        {outstandingCount > 0 ? (
          <PrimaryButton onClick={() => router.push(`/trip/${params.tripId}/settle`)}>Settle up</PrimaryButton>
        ) : transfers.length > 0 ? (
          // Same positive/settled language as ConsolidationBanner's allSquare
          // variant — a check on --positive-tint, not just an empty gap where
          // "Settle up" used to be.
          <div
            className="w-full shrink-0 flex items-center justify-center gap-2"
            style={{ height: 48, borderRadius: 'var(--radius-md)', background: 'var(--positive-tint)', color: 'var(--positive)' }}
          >
            <span aria-hidden="true">✓</span>
            <span className="text-callout">All settled</span>
          </div>
        ) : null}

        <Separator />

        <div>
          <div className="text-micro mb-2" style={{ color: 'var(--muted-foreground)' }}>EXPENSES</div>
          {expenses.length === 0 ? (
            <EmptyState glyph="🧾" title="No expenses yet" body="Log what you've paid for and TripUp works out who owes what." actionLabel="Log an expense" onAction={() => router.push(`/trip/${params.tripId}/expenses/new`)} />
          ) : (
            <div style={{ borderRadius: 'var(--radius-lg)', background: 'var(--surface-raised)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              {expenses.map((exp, i) => (
                <div key={exp.id}>
                  {i > 0 && <div style={{ borderTop: '1px solid var(--border)' }} />}
                  <ExpenseListRow expense={exp} payer={members[exp.payerId]} onClick={() => setSelectedExpenseId(exp.id)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ExpenseDetailSheet
        expense={selectedExpense}
        payer={selectedExpense ? members[selectedExpense.payerId] : undefined}
        tripMembers={tripMemberList}
        tripName={trip.name}
        onClose={() => setSelectedExpenseId(null)}
      />
    </div>
  );
}
