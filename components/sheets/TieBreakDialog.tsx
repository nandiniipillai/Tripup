'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTripStore } from '@/lib/store';
import type { Poll } from '@/lib/types';
import { joinNames, bothAllEach } from '@/lib/utils';

export function TieBreakDialog() {
  const openDialog = useTripStore((s) => s.ui.openDialog);
  const setOpenDialog = useTripStore((s) => s.setOpenDialog);
  const polls = useTripStore((s) => s.polls);
  const resolveTie = useTripStore((s) => s.resolveTie);

  const tieDialog = openDialog?.type === 'tieBreak' ? openDialog : undefined;
  const poll = tieDialog ? polls[tieDialog.pollId] : undefined;

  if (!poll || !poll.tieOptionIds) return null;

  return (
    <Dialog open onOpenChange={(v) => { if (!v) setOpenDialog(null); }}>
      <DialogContent showCloseButton={false} className="max-w-[320px]">
        {/* Keying by pollId gives a fresh selection state each time a new tie appears. */}
        <TieBreakForm key={poll.id} poll={poll} onCancel={() => setOpenDialog(null)} onResolve={(optId) => resolveTie(poll.id, optId)} />
      </DialogContent>
    </Dialog>
  );
}

function TieBreakForm({ poll, onCancel, onResolve }: { poll: Poll; onCancel: () => void; onResolve: (optionId: string) => void }) {
  const [selected, setSelected] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const tied = poll.options.filter((o) => poll.tieOptionIds!.includes(o.id));
  const tally: Record<string, number> = {};
  for (const optId of Object.values(poll.votes)) tally[optId] = (tally[optId] ?? 0) + 1;
  const count = tally[tied[0]?.id] ?? 0;
  const names = joinNames(tied.map((t) => t.name));

  return (
    <>
      <DialogHeader>
        <DialogTitle>It&apos;s a tie</DialogTitle>
        <DialogDescription>{`${names} ${bothAllEach(tied.length)} have ${count} ${count === 1 ? 'vote' : 'votes'}. Pick one to lock in — anyone can decide.`}</DialogDescription>
      </DialogHeader>
      <RadioGroup value={selected} onValueChange={setSelected} className="gap-2">
        {tied.map((opt) => (
          <label key={opt.id} className="flex items-center gap-2 px-3 py-2" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <RadioGroupItem value={opt.id} id={opt.id} />
            <Label htmlFor={opt.id} className="text-body">{opt.name}</Label>
          </label>
        ))}
      </RadioGroup>
      {error && <p className="text-caption" style={{ color: 'var(--negative)' }}>{error}</p>}
      <DialogFooter className="sm:justify-between gap-2">
        <button
          onClick={onCancel}
          className="text-callout flex-1 press-surface"
          style={{ height: 44, borderRadius: 'var(--radius-md)', color: 'var(--muted-foreground)' }}
        >
          Back to the poll
        </button>
        <button
          onClick={() => {
            if (!selected) { setError('Pick an option to lock in.'); return; }
            onResolve(selected);
          }}
          className="text-callout flex-1 press-accent"
          style={{ height: 44, borderRadius: 'var(--radius-md)', background: 'var(--accent)', color: 'var(--accent-foreground)' }}
        >
          Lock it in
        </button>
      </DialogFooter>
    </>
  );
}
