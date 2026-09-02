'use client';

import { useRouter, useParams } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { useBalances, useMyTransfers, useOtherTransfers, useTransfers } from '@/lib/selectors';
import { CURRENT_USER_ID } from '@/lib/seed';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { BalanceHero } from '@/components/settle/BalanceHero';
import { TransferRow } from '@/components/settle/TransferRow';
import { OtherTransfersSection } from '@/components/settle/OtherTransfersSection';
import type { Transfer } from '@/lib/types';

export default function SettlePage() {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const trip = useTripStore((s) => s.trip);
  const members = useTripStore((s) => s.members);
  const remindedTransferIds = useTripStore((s) => s.ui.remindedTransferIds);
  const markReminded = useTripStore((s) => s.markReminded);
  const setOpenDialog = useTripStore((s) => s.setOpenDialog);

  const balances = useBalances();
  const myTransfers = useMyTransfers();
  const otherTransfers = useOtherTransfers();
  const allTransfers = useTransfers();

  const myNet = balances[CURRENT_USER_ID]?.net ?? 0;
  const settledCount = allTransfers.filter((t) => t.status === 'settled').length;

  const openTransfer = (t: Transfer, mode: 'pay' | 'receive' | 'record') => {
    setOpenDialog({ type: 'settle', transferId: t.id, mode });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col" style={{ background: 'var(--surface)' }}>
      <ScreenHeader title="Settle up" subtitle={trip.name} onBack={() => router.push(`/trip/${params.tripId}/expenses`)} />
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="px-4 pt-5 pb-5 flex flex-col gap-4" style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
          <BalanceHero net={myNet} />
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
        <p className="text-caption text-center px-4 pt-4 pb-8" style={{ color: 'var(--muted-foreground)' }}>
          {settledCount} of {allTransfers.length} transfers settled
        </p>
      </div>
    </div>
  );
}
