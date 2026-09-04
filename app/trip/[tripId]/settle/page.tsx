'use client';

import { useRouter, useParams } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { useDisplayBalances, useMyTransfers, useOtherTransfers, useTransfers, useNaivePaymentCount } from '@/lib/selectors';
import { CURRENT_USER_ID } from '@/lib/seed';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { BalanceHero } from '@/components/settle/BalanceHero';
import { TransferRow } from '@/components/settle/TransferRow';
import { OtherTransfersSection } from '@/components/settle/OtherTransfersSection';
import { ConsolidationBanner } from '@/components/expenses/ConsolidationBanner';
import type { Transfer } from '@/lib/types';

export default function SettlePage() {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const trip = useTripStore((s) => s.trip);
  const members = useTripStore((s) => s.members);
  const remindedTransferIds = useTripStore((s) => s.ui.remindedTransferIds);
  const markReminded = useTripStore((s) => s.markReminded);
  const setOpenDialog = useTripStore((s) => s.setOpenDialog);

  const balances = useDisplayBalances();
  const myTransfers = useMyTransfers();
  const otherTransfers = useOtherTransfers();
  const allTransfers = useTransfers();
  const naiveCount = useNaivePaymentCount();

  const myNet = balances[CURRENT_USER_ID]?.net ?? 0;
  const settledCount = allTransfers.filter((t) => t.status === 'settled').length;
  const outstandingCount = allTransfers.filter((t) => t.status === 'outstanding').length;

  const openTransfer = (t: Transfer, mode: 'pay' | 'receive' | 'record') => {
    setOpenDialog({ type: 'settle', transferId: t.id, mode });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col" style={{ background: 'var(--surface)' }}>
      <ScreenHeader title="Settle up" subtitle={trip.name} onBack={() => router.push(`/trip/${params.tripId}/expenses`)} />
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Floating card, not a full-bleed bordered section — the balance is
            the other moment (with the live poll) that earns the app's own
            --shadow-float tier instead of sitting flush with the page. The
            consolidation line moved here from Expenses-only: this is the
            screen the brief names as the direct Splitwise comparison, and it
            was the one place that never said the debts had been netted down. */}
        <div className="mx-4 mt-4 px-4 pt-5 pb-5 flex flex-col gap-4" style={{ background: 'var(--surface-raised)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)' }}>
          <BalanceHero net={myNet} />
          {/* transferCount is the TOTAL consolidated set (fixed for the whole
              settle flow), not outstandingCount — otherwise "Simplified to 5
              payments instead of 13" would count down to "4", "3"... as the
              user settles, which makes the app's core claim false mid-demo.
              allSquare (the positive-tint "squared up" variant) is driven by
              outstandingCount separately, so it still flips once everything
              is settled. */}
          <ConsolidationBanner transferCount={allTransfers.length} naiveCount={naiveCount} allSquare={outstandingCount === 0} />
          {myTransfers.length > 0 && (
            <div className="flex flex-col gap-2">
              {myTransfers.map((t) => {
                const incoming = t.toId === CURRENT_USER_ID;
                const otherId = incoming ? t.fromId : t.toId;
                const other = members[otherId];
                if (!other) return null;
                return (
                  <TransferRow
                    key={t.id}
                    variant="hero"
                    transfer={t}
                    direction={incoming ? 'incoming' : 'outgoing'}
                    otherMember={other}
                    reminded={!!remindedTransferIds[t.id]}
                    onRemind={() => markReminded(t.id)}
                    onOpen={() => openTransfer(t, incoming ? 'receive' : 'pay')}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-2">
          <OtherTransfersSection transfers={otherTransfers} members={members} onOpenTransfer={(t) => openTransfer(t, 'record')} />
        </div>

        {/* Directly under the content it describes. A `flex-1` spacer used to
            pin this to the bottom of the scroll box, 450–750px away from the
            transfers it counts, leaving a hollow middle. */}
        <div className="px-4 pt-4 pb-8">
          <p className="text-caption text-center" style={{ color: 'var(--muted-foreground)' }}>
            {settledCount} of {allTransfers.length} transfers settled
          </p>
          {/* Thin progress bar, new per the hi-fi. Fill color is an inference,
              not confirmed in the screenshot: --accent while in progress,
              switching to --positive once fully settled — consistent with
              the app's existing semantic split (blue = in progress, green =
              fully resolved, as elsewhere in Settle Up/TransferRow). */}
          <div
            className="mt-2 mx-auto"
            style={{ maxWidth: 240, height: 4, borderRadius: 9999, background: 'var(--border)', overflow: 'hidden' }}
            role="progressbar"
            aria-label="Transfers settled"
            aria-valuenow={settledCount}
            aria-valuemin={0}
            aria-valuemax={allTransfers.length}
          >
            <div
              style={{
                height: '100%',
                borderRadius: 9999,
                width: allTransfers.length > 0 ? `${(settledCount / allTransfers.length) * 100}%` : '0%',
                background: settledCount === allTransfers.length && allTransfers.length > 0 ? 'var(--positive)' : 'var(--accent)',
                transition: 'width 200ms ease-out, background-color 200ms ease-out',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
