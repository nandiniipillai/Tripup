'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { PrimaryButton } from '@/components/common/Action';
import { useTripStore } from '@/lib/store';
import { useTransfers } from '@/lib/selectors';
import { Money } from '@/components/common/Money';
import type { PaymentMethod, Transfer } from '@/lib/types';

const METHODS: { value: PaymentMethod; glyph: string; label: string }[] = [
  { value: 'bank', glyph: '🏦', label: 'Bank transfer' },
  { value: 'card', glyph: '💳', label: 'Card' },
  { value: 'other', glyph: '💶', label: 'Cash or other' },
];

export function SettleSheet() {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const openDialog = useTripStore((s) => s.ui.openDialog);
  const setOpenDialog = useTripStore((s) => s.setOpenDialog);
  const members = useTripStore((s) => s.members);
  const settleTransfer = useTripStore((s) => s.settleTransfer);
  const transfers = useTransfers();

  const settleDialog = openDialog?.type === 'settle' ? openDialog : undefined;
  const transfer = settleDialog ? transfers.find((t) => t.id === settleDialog.transferId) : undefined;

  if (!transfer || !settleDialog) return null;
  const mode = settleDialog.mode;

  return (
    <Sheet open onOpenChange={(v) => { if (!v) setOpenDialog(null); }}>
      {/* max-height hugging content, not a fixed 52%. The fixed height left
          the inner scroller ~9px shorter than its content, slicing "Cash or
          other" against the footer border with no scroll affordance. */}
      <SheetContent
        showCloseButton={false}
        side="bottom"
        className="p-0 gap-0 flex flex-col"
        style={{ maxHeight: '84%', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)' }}
      >
        <SettleForm
          key={transfer.id}
          transfer={transfer}
          mode={mode}
          fromName={members[transfer.fromId]?.name ?? ''}
          toName={members[transfer.toId]?.name ?? ''}
          onClose={() => setOpenDialog(null)}
          onConfirm={(method) => {
            const { allSettled } = settleTransfer(transfer.id, method);
            toast('Marked as settled.');
            setOpenDialog(null);
            if (allSettled) router.replace(`/trip/${params.tripId}/settle/done`);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

function SettleForm({
  transfer, mode, fromName, toName, onClose, onConfirm,
}: {
  transfer: Transfer;
  mode: 'pay' | 'receive' | 'record';
  fromName: string;
  toName: string;
  onClose: () => void;
  onConfirm: (method: PaymentMethod) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>('bank');

  const copy = {
    pay: { title: `Pay ${toName}`, methodLabel: 'How are you paying?', cta: 'Confirm payment', footnote: "TripUp doesn't move money — this records the payment for the group." },
    receive: { title: `Record payment from ${fromName}`, methodLabel: `How did ${fromName} pay you?`, cta: 'Mark as received', footnote: "TripUp doesn't move money — this records the payment for the group." },
    record: { title: `Record ${fromName} → ${toName}`, methodLabel: 'How was this paid?', cta: 'Mark as settled', footnote: 'Anyone in the trip can record a payment.' },
  }[mode];

  return (
    <>
      <div className="mx-auto mt-2 shrink-0" style={{ width: 36, height: 4, borderRadius: 9999, background: 'var(--border-strong)' }} />

      {/* Routed through the shared ScreenHeader like every other sheet, rather
          than hand-building a raw × icon button. */}
      <SheetTitle className="sr-only">{copy.title}</SheetTitle>
      <ScreenHeader title={copy.title} backLabel="Cancel" onBack={onClose} />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-2 flex flex-col gap-5 items-center">
        <Money value={transfer.amount} size="hero" align="center" />

        <div className="w-full">
          <p className="text-subhead mb-2" style={{ color: 'var(--muted-foreground)' }}>{copy.methodLabel}</p>
          <RadioGroup value={method} onValueChange={(v) => setMethod(v as PaymentMethod)} className="gap-2">
            {METHODS.map((m) => {
              const selected = method === m.value;
              return (
                <label
                  key={m.value}
                  className="flex items-center gap-2.5 px-3 press-surface cursor-pointer"
                  style={{
                    minHeight: 56,
                    borderRadius: 'var(--radius-md)',
                    // Accent border + ring is the whole selection signal; a
                    // third accent-tint fill on top of it was overload.
                    background: 'var(--surface-raised)',
                    border: selected ? '1px solid var(--accent)' : '1px solid var(--border)',
                    boxShadow: selected ? '0 0 0 1px var(--accent)' : undefined,
                    transition: 'background-color 150ms ease-out, border-color 150ms ease-out',
                  }}
                >
                  <RadioGroupItem value={m.value} id={`method-${m.value}`} />
                  <span aria-hidden="true" style={{ fontSize: 18 }}>{m.glyph}</span>
                  <span className="text-body">{m.label}</span>
                </label>
              );
            })}
          </RadioGroup>
        </div>
      </div>

      <div className="shrink-0 px-4 pt-3 pb-5" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-raised)' }}>
        <p className="text-caption text-center mb-3" style={{ color: 'var(--muted-foreground)' }}>{copy.footnote}</p>
        <PrimaryButton onClick={() => onConfirm(method)}>{copy.cta}</PrimaryButton>
      </div>
    </>
  );
}
