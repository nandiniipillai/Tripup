'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTripStore } from '@/lib/store';
import { CURRENT_USER_ID } from '@/lib/seed';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { Avatar } from '@/components/common/Avatar';
import { Input } from '@/components/ui/input';
import { PrimaryButton, DashedAddRow } from '@/components/common/Action';
import { LineItemCard, type LineItemDraft } from '@/components/expenses/LineItemCard';
import { formatCents, formatConverted, parseAmountToCents } from '@/lib/money';
import { todayDateStr } from '@/lib/time';

let lineItemCounter = 0;
function newLineItemId() {
  lineItemCounter += 1;
  return `draft_li_${lineItemCounter}`;
}

export default function LogExpensePage() {
  return (
    <Suspense fallback={null}>
      <LogExpenseForm />
    </Suspense>
  );
}

function LogExpenseForm() {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const searchParams = useSearchParams();
  const fromItemId = searchParams.get('fromItem');

  const trip = useTripStore((s) => s.trip);
  const members = useTripStore((s) => s.members);
  const itinerary = useTripStore((s) => s.itinerary);
  const addExpense = useTripStore((s) => s.addExpense);

  const tripMembers = trip.memberIds.map((id) => members[id]).filter(Boolean);
  const fromItem = fromItemId ? itinerary.find((i) => i.id === fromItemId) : undefined;

  const initial = useMemo(() => {
    const tripMemberIds = new Set(tripMembers.map((m) => m.id));

    if (fromItem?.estimatedCostPerPerson) {
      const total = fromItem.estimatedCostPerPerson * tripMembers.length;
      return {
        description: fromItem.title,
        lineItems: [{ id: newLineItemId(), label: fromItem.title, amountInput: (total / 100).toFixed(2), includedMemberIds: tripMembers.map((m) => m.id) }],
      };
    }

    // The poll-created dinner item has no estimatedCostPerPerson (nobody
    // typed one), but it's the scenario's actual expense — pre-fill it with
    // the exact Food/Wine split the scenario describes (excluding Nic and
    // Ren from the wine) instead of leaving arbitrary blanks nobody can
    // reproduce the hi-fi numbers from. See scripts/verify-settle-flow.ts for
    // the locked ledger these numbers reproduce.
    if (fromItem?.id === 'itin_dinner') {
      const foodIds = ['m_ari', 'm_nic', 'm_sam', 'm_mia', 'm_ren'].filter((id) => tripMemberIds.has(id));
      const wineIds = ['m_ari', 'm_sam', 'm_mia'].filter((id) => tripMemberIds.has(id));
      return {
        description: fromItem.title,
        lineItems: [
          { id: newLineItemId(), label: 'Food', amountInput: '140.00', includedMemberIds: foodIds },
          { id: newLineItemId(), label: 'Wine', amountInput: '45.00', includedMemberIds: wineIds },
        ],
      };
    }

    // No cost estimate to prefill amounts from, but the description should
    // still carry over — "Log as expense" from an itinerary item shouldn't
    // discard the one thing it already knows.
    if (fromItem) {
      return {
        description: fromItem.title,
        lineItems: [{ id: newLineItemId(), label: '', amountInput: '', includedMemberIds: tripMembers.map((m) => m.id) }],
      };
    }

    return {
      description: '',
      lineItems: [{ id: newLineItemId(), label: '', amountInput: '', includedMemberIds: tripMembers.map((m) => m.id) }],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [description, setDescription] = useState(initial.description);
  const [payerId, setPayerId] = useState(CURRENT_USER_ID);
  const [lineItems, setLineItems] = useState<LineItemDraft[]>(initial.lineItems);
  const [descError, setDescError] = useState<string | null>(null);
  const [lineErrors, setLineErrors] = useState<Record<string, string>>({});
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const today = todayDateStr();
  // Plain slice(0,3) in itinerary order used to offer "Belém & pastéis de
  // nata", "Jerónimos Monastery" and "Ren lands at LIS" (an arrival — never a
  // plausible expense) while cutting off "Dinner @ ..." — the poll-created
  // item appended last, and the one expense the scenario is actually about.
  // Poll-created items sort first; obvious arrival/transit-only titles sort
  // last instead of being hard-excluded, so nothing silently vanishes if a
  // day is short on other options.
  const ARRIVAL_OR_TRANSIT_RE = /\blands?\b|\bflight(s)?\b|check[- ]?(in|out)/i;
  const todaysItems = itinerary.filter((i) => i.date === today);
  const rankedToday = [...todaysItems].sort((a, b) => {
    const score = (item: typeof a) => (item.source === 'poll' ? 0 : ARRIVAL_OR_TRANSIT_RE.test(item.title) ? 2 : 1);
    return score(a) - score(b);
  });
  const suggestionChips = rankedToday.map((i) => i.title).slice(0, 4);

  const totalCents = lineItems.reduce((sum, li) => sum + parseAmountToCents(li.amountInput), 0);
  const converted = formatConverted(totalCents, trip.currency, 'USD');

  const updateLineItem = (id: string, patch: Partial<LineItemDraft>) => {
    setLineItems((prev) => prev.map((li) => (li.id === id ? { ...li, ...patch } : li)));
  };

  const removeLineItem = (id: string) => setLineItems((prev) => prev.filter((li) => li.id !== id));

  const addLineItem = () => setLineItems((prev) => [...prev, { id: newLineItemId(), label: '', amountInput: '', includedMemberIds: tripMembers.map((m) => m.id) }]);

  const submit = () => {
    if (!description.trim()) {
      setDescError('Give this expense a description.');
      return;
    }
    setDescError(null);

    for (const li of lineItems) {
      const amount = parseAmountToCents(li.amountInput);
      if (amount <= 0) {
        setLineErrors({ [li.id]: 'Add an amount for this item.' });
        cardRefs.current[li.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    for (const li of lineItems) {
      if (li.includedMemberIds.length === 0) {
        setLineErrors({ [li.id]: li.label.trim() ? `Include at least one person in "${li.label.trim()}".` : 'Include at least one person in this item.' });
        cardRefs.current[li.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    setLineErrors({});

    addExpense({
      description: description.trim(),
      payerId,
      lineItems: lineItems.map((li) => ({
        id: li.id.replace('draft_', 'li_'),
        label: li.label.trim() || 'Item',
        amount: parseAmountToCents(li.amountInput),
        includedMemberIds: li.includedMemberIds,
      })),
      fromItineraryItemId: fromItem?.id,
    });
    toast('Expense saved');
    router.push(`/trip/${params.tripId}/expenses`);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ScreenHeader title="New expense" subtitle={trip.name} backLabel="Cancel" onBack={() => router.back()} />
      <div className="flex-1 overflow-y-auto px-4 pt-4 flex flex-col gap-5 pb-4">
        <div className="text-center">
          <div className="text-micro mb-1" style={{ color: 'var(--muted-foreground)' }}>TOTAL</div>
          <div className="text-display money-tabular">{formatCents(totalCents, trip.currency)}</div>
          {converted && <div className="text-caption mt-1 money-tabular" style={{ color: 'var(--muted-foreground)' }}>{converted}</div>}
        </div>

        <div>
          <label className="text-subhead block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Description</label>
          {/* The shared Input — this screen used to hand-roll its own 44px
              field next to shadcn's 32px one, giving the app three inputs. */}
          <Input
            placeholder="What was it for?"
            aria-label="Description"
            aria-invalid={!!descError}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {descError && <p className="text-caption mt-1.5" style={{ color: 'var(--negative)' }}>{descError}</p>}
          {suggestionChips.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {suggestionChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setDescription(chip)}
                  className="hit-44-after text-caption px-3 max-w-full pressable"
                  style={{
                    height: 32, borderRadius: 9999,
                    border: '1px solid var(--border)', background: 'var(--surface-raised)',
                    color: 'var(--muted-foreground)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-subhead mb-2" style={{ color: 'var(--muted-foreground)' }}>Paid by</div>
          <div className="flex gap-3">
            {tripMembers.map((m) => (
              <button key={m.id} onClick={() => setPayerId(m.id)} className="flex flex-col items-center gap-1 pressable" style={{ width: 56 }}>
                <Avatar member={m} size={40} ringed={payerId === m.id} />
                <span className="text-caption truncate w-full text-center">{m.id === CURRENT_USER_ID ? 'You' : m.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-subhead" style={{ color: 'var(--muted-foreground)' }}>Line items</div>
          <p className="text-caption mb-2" style={{ color: 'var(--muted-foreground)' }}>Split each item with whoever shared it.</p>
          <div className="flex flex-col gap-3">
            {lineItems.map((li) => (
              <div key={li.id} ref={(el) => { cardRefs.current[li.id] = el; }}>
                <LineItemCard
                  item={li}
                  tripMembers={tripMembers}
                  showRemove={lineItems.length > 1}
                  onChange={(patch) => updateLineItem(li.id, patch)}
                  onRemove={() => removeLineItem(li.id)}
                  error={lineErrors[li.id]}
                />
              </div>
            ))}
            <DashedAddRow onClick={addLineItem}>+ Add line item</DashedAddRow>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-4 pt-3 pb-5" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-raised)' }}>
        <PrimaryButton onClick={submit}>Save expense</PrimaryButton>
      </div>
    </div>
  );
}
