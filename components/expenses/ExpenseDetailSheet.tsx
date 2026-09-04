'use client';

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { Avatar } from '@/components/common/Avatar';
import { Money } from '@/components/common/Money';
import { CURRENT_USER_ID } from '@/lib/seed';
import { expenseTotal } from '@/lib/types';
import type { Expense, Member } from '@/lib/types';

/**
 * Read-only mirror of MemberChip (components/expenses/MemberChip.tsx) — same
 * pill, same on/off signal (opacity + strikethrough on the excluded state) —
 * so a line item's split looks the same here as it did the moment it was
 * entered on the New Expense form. A <span>, not a <button>: nothing here is
 * editable.
 */
function StaticMemberChip({ member, included }: { member: Member; included: boolean }) {
  const label = member.id === CURRENT_USER_ID ? 'You' : member.name;
  return (
    <span
      className="inline-flex items-center gap-1.5 pl-1 pr-2.5"
      style={{
        height: 32,
        borderRadius: 9999,
        background: included ? 'var(--surface-raised)' : 'var(--surface)',
        border: included ? '1px solid var(--border-strong)' : '1px solid var(--border)',
        opacity: included ? 1 : 0.45,
      }}
    >
      <Avatar member={member} size={22} />
      <span className="text-caption" style={{ textDecoration: included ? 'none' : 'line-through' }}>{label}</span>
    </span>
  );
}

/**
 * Expense detail — the app's most distinctive feature (per-line-item
 * include/exclude splitting) used to become unverifiable one screen after
 * logging it: the expense list row was a plain, non-tappable div with
 * nowhere to check "who was actually on the wine." This is that screen.
 */
export function ExpenseDetailSheet({
  expense, payer, tripMembers, tripName, onClose,
}: {
  expense: Expense | null;
  payer?: Member;
  tripMembers: Member[];
  tripName: string;
  onClose: () => void;
}) {
  const open = !!expense;
  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent
        showCloseButton={false}
        side="bottom"
        className="p-0 gap-0 flex flex-col"
        style={{ maxHeight: '88%', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)' }}
      >
        {expense && (
          <>
            <div className="mx-auto mt-2 shrink-0" style={{ width: 36, height: 4, borderRadius: 9999, background: 'var(--border-strong)' }} />
            <SheetTitle className="sr-only">{expense.description}</SheetTitle>
            <ScreenHeader title={expense.description} subtitle={tripName} backLabel="Done" onBack={onClose} />

            <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-6 flex flex-col gap-5">
              <div className="text-center">
                <div className="text-micro mb-1" style={{ color: 'var(--muted-foreground)' }}>TOTAL</div>
                <Money value={expenseTotal(expense)} size="hero" align="center" />
              </div>

              {payer && (
                <div className="flex items-center gap-3">
                  <Avatar member={payer} size={40} />
                  <div className="min-w-0">
                    <div className="text-body truncate">{payer.id === CURRENT_USER_ID ? 'You' : payer.name} paid</div>
                    <div className="text-caption" style={{ color: 'var(--muted-foreground)' }}>Everyone else&apos;s share nets against this.</div>
                  </div>
                </div>
              )}

              <div>
                <div className="text-subhead mb-2" style={{ color: 'var(--muted-foreground)' }}>Line items</div>
                <div className="flex flex-col gap-3">
                  {expense.lineItems.map((li) => {
                    const includedIds = new Set(li.includedMemberIds);
                    return (
                      <div
                        key={li.id}
                        className="flex flex-col gap-3 p-3"
                        style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface-raised)' }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-body truncate">{li.label}</span>
                          <Money value={li.amount} size="subhead" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tripMembers.map((m) => (
                            <StaticMemberChip key={m.id} member={m} included={includedIds.has(m.id)} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
