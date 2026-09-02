'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import type { Member, Transfer } from '@/lib/types';
import { TransferRow } from './TransferRow';

export function OtherTransfersSection({
  transfers, members, onOpenTransfer,
}: { transfers: Transfer[]; members: Record<string, Member>; onOpenTransfer: (t: Transfer) => void }) {
  // Expanded by default: the consolidated transfer list IS the payoff of debt
  // simplification ("4 payments instead of 8"), so hiding it behind a tap both
  // buries the idea and leaves the screen with a large hollow middle.
  const [open, setOpen] = useState(true);
  if (transfers.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      {/* px-4, matching "Your position" above it and every other screen gutter.
          This was px-3, giving the two section headings a 4px left-edge jog. */}
      <CollapsibleTrigger
        className="w-full flex items-center justify-between px-4 text-left press-surface"
        style={{ minHeight: 52, background: 'transparent' }}
      >
        <span className="text-subhead">Other transfers in this trip ({transfers.length})</span>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease-out' }}
        >
          <path d="M3 5L7 9L11 5" stroke="var(--muted-foreground)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </CollapsibleTrigger>
      <p className="text-caption px-4 -mt-1 pb-1" style={{ color: 'var(--muted-foreground)' }}>
        Anyone can record a payment.
      </p>
      <CollapsibleContent>
        <div className="px-4 flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
          {transfers.map((t) => (
            <TransferRow
              key={t.id}
              variant="quiet"
              transfer={t}
              fromMember={members[t.fromId]}
              toMember={members[t.toId]}
              onOpen={() => onOpenTransfer(t)}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
