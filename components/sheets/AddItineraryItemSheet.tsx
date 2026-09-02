'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useTripStore } from '@/lib/store';
import { todayDateStr } from '@/lib/time';
import { parseAmountToCents } from '@/lib/money';
import type { ItineraryDraft } from '@/lib/store';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { PrimaryButton } from '@/components/common/Action';

export function AddItineraryItemSheet() {
  const openSheet = useTripStore((s) => s.ui.openSheet);
  const closeSheet = useTripStore((s) => s.closeSheet);
  const addItineraryItem = useTripStore((s) => s.addItineraryItem);
  const open = openSheet === 'addItinerary';

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) closeSheet(); }}>
      {/* Sizes to its content rather than a fixed 68%. */}
      <SheetContent showCloseButton={false} side="bottom" className="p-0 gap-0 flex flex-col" style={{ maxHeight: '92%', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)' }}>
        <AddItineraryForm key={String(open)} onClose={closeSheet} onSubmit={addItineraryItem} />
      </SheetContent>
    </Sheet>
  );
}

function AddItineraryForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (draft: ItineraryDraft) => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayDateStr());
  const [time, setTime] = useState('18:00');
  const [location, setLocation] = useState('');
  const [cost, setCost] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!title.trim() || !date || !time || !location.trim()) {
      setError('Fill in the title, date, time and location.');
      return;
    }
    setError(null);
    onSubmit({
      title: title.trim(), date, time, location: location.trim(),
      estimatedCostPerPerson: cost.trim() ? parseAmountToCents(cost) : undefined,
    });
    onClose();
  };

  return (
    <>
      <div className="mx-auto mt-2 shrink-0" style={{ width: 36, height: 4, borderRadius: 9999, background: 'var(--border-strong)' }} />
      <SheetTitle className="sr-only">Add to itinerary</SheetTitle>
      <ScreenHeader title="Add to itinerary" backLabel="Cancel" onBack={onClose} />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-4 flex flex-col gap-4">
        <div>
          <label className="text-subhead block mb-1" style={{ color: 'var(--muted-foreground)' }}>Title</label>
          <Input placeholder="Fado show" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-subhead block mb-1" style={{ color: 'var(--muted-foreground)' }}>Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="text-subhead block mb-1" style={{ color: 'var(--muted-foreground)' }}>Time</label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-subhead block mb-1" style={{ color: 'var(--muted-foreground)' }}>Location</label>
          <Input placeholder="Alfama" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div>
          <label className="text-subhead block mb-1" style={{ color: 'var(--muted-foreground)' }}>Cost estimate per person (optional)</label>
          <Input placeholder="€20.00" value={cost} onChange={(e) => setCost(e.target.value)} inputMode="decimal" />
        </div>
      </div>

      <div className="shrink-0 px-4 pt-3 pb-5" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-raised)' }}>
        {error && <p className="text-caption mb-2" style={{ color: 'var(--negative)' }}>{error}</p>}
        <PrimaryButton onClick={submit}>Add to itinerary</PrimaryButton>
      </div>
    </>
  );
}
