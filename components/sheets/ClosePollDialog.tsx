'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useTripStore } from '@/lib/store';

function joinNames(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export function ClosePollDialog() {
  const openDialog = useTripStore((s) => s.ui.openDialog);
  const setOpenDialog = useTripStore((s) => s.setOpenDialog);
  const polls = useTripStore((s) => s.polls);
  const members = useTripStore((s) => s.members);
  const closePoll = useTripStore((s) => s.closePoll);

  const isThis = openDialog?.type === 'closePoll';
  const poll = isThis ? polls[openDialog.pollId] : undefined;

  if (!poll) return null;

  const votedIds = new Set(Object.keys(poll.votes));
  const outstanding = poll.eligibleVoterIds.filter((id) => !votedIds.has(id)).map((id) => members[id]?.name ?? 'Someone');
  const tally: Record<string, number> = {};
  for (const o of poll.options) tally[o.id] = 0;
  for (const optId of Object.values(poll.votes)) tally[optId] = (tally[optId] ?? 0) + 1;
  const counts = Object.values(tally);
  const maxCount = counts.length ? Math.max(...counts) : 0;
  const leader = poll.options.find((o) => tally[o.id] === maxCount);
  const everyoneVoted = outstanding.length === 0;

  // "leading with 1 votes" — the count is live, so it has to pluralise.
  const voteWord = maxCount === 1 ? 'vote' : 'votes';

  const body = everyoneVoted
    ? `Everyone's voted. ${leader?.name} wins with ${maxCount} ${voteWord} and will be added to the itinerary.`
    : `${joinNames(outstanding)} ${outstanding.length === 1 ? "hasn't" : "haven't"} voted yet. ${leader?.name} is leading with ${maxCount} ${voteWord} and will be added to the itinerary.`;

  return (
    <Dialog open onOpenChange={(v) => { if (!v) setOpenDialog(null); }}>
      {/* No shadcn × — this dialog has two explicit, labelled exits. */}
      <DialogContent showCloseButton={false} className="max-w-[320px]">
        <DialogHeader>
          <DialogTitle>Close this poll now?</DialogTitle>
          <DialogDescription>{body}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between gap-2">
          <button
            onClick={() => setOpenDialog(null)}
            className="text-callout flex-1 press-surface"
            style={{ height: 44, borderRadius: 'var(--radius-md)', color: 'var(--muted-foreground)' }}
          >
            Keep it open
          </button>
          <button
            onClick={() => closePoll(poll.id, { auto: false, byId: 'm_ari' })}
            className="text-callout flex-1 press-accent"
            style={{ height: 44, borderRadius: 'var(--radius-md)', background: 'var(--accent)', color: 'var(--accent-foreground)' }}
          >
            Close poll
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
