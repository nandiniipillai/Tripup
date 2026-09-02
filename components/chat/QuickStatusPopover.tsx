'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PING_LABELS } from '@/lib/types';
import type { PingKind } from '@/lib/types';
import { useTripStore } from '@/lib/store';
import { useState } from 'react';

const PING_ORDER: PingKind[] = ['omw', 'late10', 'here'];

export function QuickStatusPopover() {
  const [open, setOpen] = useState(false);
  const sendPing = useTripStore((s) => s.sendPing);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Quick status"
        className="flex items-center justify-center shrink-0 pressable"
        style={{ width: 44, height: 44, borderRadius: 9999 }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 5V17M5 11H17" stroke="var(--foreground)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="p-2 w-56 rounded-[var(--radius-lg)] border-[var(--border)] shadow-[var(--shadow-float)]"
      >
        <div className="text-micro px-2 pb-1 pt-0.5" style={{ color: 'var(--muted-foreground)' }}>Quick status</div>
        {PING_ORDER.map((kind) => (
          <button
            key={kind}
            onClick={() => { sendPing(kind); setOpen(false); }}
            className="w-full text-left flex items-center gap-2 px-2 rounded-[var(--radius-sm)] press-surface hover:bg-[var(--surface)]"
            style={{ height: 44 }}
          >
            <span>{PING_LABELS[kind].glyph}</span>
            <span className="text-body">{PING_LABELS[kind].label}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
