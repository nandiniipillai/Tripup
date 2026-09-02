'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useTripStore } from '@/lib/store';
import { POLL_SEED } from '@/lib/seed';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { PrimaryButton, DashedAddRow } from '@/components/common/Action';

interface OptionDraft { name: string; descriptor: string }

function seedOptions(): OptionDraft[] {
  return POLL_SEED.options.map((o) => ({ name: o.name, descriptor: o.descriptor }));
}

export function CreatePollSheet() {
  const openSheet = useTripStore((s) => s.ui.openSheet);
  const closeSheet = useTripStore((s) => s.closeSheet);
  const createPoll = useTripStore((s) => s.createPoll);
  const open = openSheet === 'createPoll';

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) closeSheet(); }}>
      {/* max-height, not a fixed 88%: the form is ~430px of content, so a
          fixed height left a ~330px void above the footer. */}
      <SheetContent
        showCloseButton={false}
        side="bottom"
        className="p-0 gap-0 flex flex-col"
        style={{ maxHeight: '92%', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)' }}
      >
        {/* Keying by `open` remounts the form with fresh seeded state each time
            the sheet opens, instead of resetting state from inside an effect. */}
        <CreatePollForm key={String(open)} onClose={closeSheet} onSubmit={createPoll} />
      </SheetContent>
    </Sheet>
  );
}

function CreatePollForm({
  onClose, onSubmit,
}: { onClose: () => void; onSubmit: (draft: { question: string; options: OptionDraft[] }) => void }) {
  const tripName = useTripStore((s) => s.trip.name);
  const [question, setQuestion] = useState(POLL_SEED.question);
  const [options, setOptions] = useState<OptionDraft[]>(seedOptions());
  const [error, setError] = useState<string | null>(null);

  const updateOption = (i: number, patch: Partial<OptionDraft>) => {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  };

  const removeOption = (i: number) => setOptions((prev) => prev.filter((_, idx) => idx !== i));

  const submit = () => {
    const validOptions = options.filter((o) => o.name.trim());
    if (!question.trim() || validOptions.length < 2) {
      setError('Add a question and at least two options.');
      return;
    }
    setError(null);
    onSubmit({ question, options: validOptions });
  };

  const showRemove = options.length > 2;

  return (
    <>
      <div className="mx-auto mt-2 shrink-0" style={{ width: 36, height: 4, borderRadius: 9999, background: 'var(--border-strong)' }} />
      <SheetTitle className="sr-only">New poll</SheetTitle>
      <ScreenHeader title="New poll" subtitle={tripName} backLabel="Cancel" onBack={onClose} />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-4 flex flex-col gap-5">
        <div>
          <label className="text-subhead block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Question</label>
          <Input value={question} onChange={(e) => setQuestion(e.target.value)} onFocus={(e) => e.target.select()} />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-subhead" style={{ color: 'var(--muted-foreground)' }}>Options</label>
          {options.map((opt, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              {/* The × lives INSIDE the field's trailing padding. It used to sit
                  outside in the right margin, so every option-name input ended
                  ~40px short of the descriptor input directly beneath it — a
                  ragged right edge repeated three times down the sheet. */}
              <div className="relative">
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={opt.name}
                  onChange={(e) => updateOption(i, { name: e.target.value })}
                  style={showRemove ? { paddingRight: 40 } : undefined}
                />
                {showRemove && (
                  <button
                    aria-label={`Remove option ${i + 1}`}
                    onClick={() => removeOption(i)}
                    className="absolute flex items-center justify-center press-surface"
                    style={{
                      right: 2, top: '50%', transform: 'translateY(-50%)',
                      width: 40, height: 40, borderRadius: 9999,
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
              {/* Descriptor is subordinate to the name it describes: it was
                  13/500 in --foreground under a 15/400 name, so the supporting
                  line outweighed the thing it supported. */}
              <Input
                placeholder="Add a short description (optional)"
                value={opt.descriptor}
                onChange={(e) => updateOption(i, { descriptor: e.target.value })}
                aria-label={`Description for option ${i + 1}`}
                className="text-[13px] leading-[18px] font-normal text-[var(--muted-foreground)]"
              />
            </div>
          ))}
          {options.length < 6 && (
            <DashedAddRow onClick={() => setOptions((prev) => [...prev, { name: '', descriptor: '' }])}>
              + Add another option
            </DashedAddRow>
          )}
        </div>
      </div>

      <div className="shrink-0 px-4 pt-3 pb-5" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-raised)' }}>
        {error && <p className="text-caption mb-2" style={{ color: 'var(--negative)' }}>{error}</p>}
        <PrimaryButton onClick={submit}>Send poll</PrimaryButton>
      </div>
    </>
  );
}
