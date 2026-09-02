'use client';

import { useState } from 'react';
import type { Member } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { MemberChip } from './MemberChip';
import { QuietButton } from '@/components/common/Action';
import { formatCents, parseAmountToCents } from '@/lib/money';

export interface LineItemDraft {
  id: string;
  label: string;
  amountInput: string;
  includedMemberIds: string[];
}

export function LineItemCard({
  item, tripMembers, showRemove, onChange, onRemove, error,
}: {
  item: LineItemDraft;
  tripMembers: Member[];
  showRemove: boolean;
  onChange: (patch: Partial<LineItemDraft>) => void;
  onRemove: () => void;
  error?: string;
}) {
  // "Add an amount." used to render in --negative the instant the card mounted,
  // so a pristine form greeted the user with a validation error. Red is now
  // reserved for state the user actually reached: a touched field, or a
  // submit attempt (which arrives as `error`).
  const [amountTouched, setAmountTouched] = useState(false);

  const amountCents = parseAmountToCents(item.amountInput);
  const includedCount = item.includedMemberIds.length;
  const allOn = includedCount === tripMembers.length;

  const toggleMember = (id: string) => {
    const next = item.includedMemberIds.includes(id)
      ? item.includedMemberIds.filter((m) => m !== id)
      : [...item.includedMemberIds, id];
    onChange({ includedMemberIds: next });
  };

  const toggleAll = () => {
    onChange({ includedMemberIds: allOn ? [] : tripMembers.map((m) => m.id) });
  };

  let caption: { text: string; tone: 'negative' | 'muted' };
  if (includedCount === 0) {
    // The user had to deselect everyone to get here, so this one is earned.
    caption = { text: 'Include at least one person.', tone: 'negative' };
  } else if (amountCents === 0) {
    caption = { text: 'Add an amount.', tone: amountTouched ? 'negative' : 'muted' };
  } else {
    const each = Math.floor(amountCents / includedCount);
    caption = { text: `${formatCents(each)} each · ${includedCount} ${includedCount === 1 ? 'person' : 'people'}`, tone: 'muted' };
  }

  const captionColor = error || caption.tone === 'negative' ? 'var(--negative)' : 'var(--muted-foreground)';

  return (
    <div className="flex flex-col gap-3 p-3" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface-raised)' }}>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Item, e.g. Food"
          aria-label="Item name"
          value={item.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className="flex-1"
        />
        <div className="relative shrink-0" style={{ width: 104 }}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body pointer-events-none" style={{ color: 'var(--muted-foreground)' }}>€</span>
          <Input
            inputMode="decimal"
            aria-label="Amount"
            value={item.amountInput}
            onChange={(e) => onChange({ amountInput: e.target.value })}
            onBlur={() => setAmountTouched(true)}
            className="text-right pl-7 money-tabular"
          />
        </div>
        {showRemove && (
          <button
            aria-label="Remove line item"
            onClick={onRemove}
            className="shrink-0 flex items-center justify-center press-surface"
            style={{ width: 44, height: 44, borderRadius: 9999, color: 'var(--muted-foreground)' }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-subhead" style={{ color: 'var(--muted-foreground)' }}>Split between</span>
        <QuietButton onClick={toggleAll}>{allOn ? 'Deselect all' : 'Select all'}</QuietButton>
      </div>

      <div className="flex flex-wrap gap-2">
        {tripMembers.map((m) => (
          <MemberChip key={m.id} member={m} on={item.includedMemberIds.includes(m.id)} onToggle={() => toggleMember(m.id)} />
        ))}
      </div>

      <div className="text-caption" style={{ color: captionColor }}>
        {error ?? caption.text}
      </div>
    </div>
  );
}
