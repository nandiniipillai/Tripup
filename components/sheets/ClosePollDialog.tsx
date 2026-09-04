'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useTripStore } from '@/lib/store';
import { CURRENT_USER_ID } from '@/lib/seed';
import { joinNames, capitalize } from '@/lib/utils';

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
  const outstandingIds = poll.eligibleVoterIds.filter((id) => !votedIds.has(id));
  // "Ari" is the current user everywhere else in the app; naming them in the
  // third person here ("Jules and Ari haven't voted") was the one screen that
  // broke the app's own "you" convention.
  const outstandingNames = outstandingIds.map((id) => (id === CURRENT_USER_ID ? 'you' : members[id]?.name ?? 'Someone'));
  const tally: Record<string, number> = {};
  for (const o of poll.options) tally[o.id] = 0;
  for (const optId of Object.values(poll.votes)) tally[optId] = (tally[optId] ?? 0) + 1;
  const counts = Object.values(tally);
  const maxCount = counts.length ? Math.max(...counts) : 0;
  const leaders = poll.options.filter((o) => tally[o.id] === maxCount);
  const isTie = leaders.length > 1 && maxCount > 0;
  const everyoneVoted = outstandingIds.length === 0;

  // "leading with 1 votes" — the count is live, so it has to pluralise.
  const voteWord = maxCount === 1 ? 'vote' : 'votes';

  // Singular "hasn't" only fits a single NAMED person ("Jules hasn't voted");
  // "you" (sole or among others) always takes "haven't".
  const soleOutstandingIsNotYou = outstandingIds.length === 1 && outstandingIds[0] !== CURRENT_USER_ID;
  const verb = soleOutstandingIsNotYou ? "hasn't" : "haven't";

  // Never assert a winner that doesn't exist: on a tie, say so and flag that
  // closing now triggers a tie-break rather than naming the first-listed
  // option as "leading".
  const tieLine = `${leaders.length} options are tied at ${maxCount} ${voteWord} each — closing now will trigger a tie-break.`;
  const standingLine = isTie
    ? tieLine
    : maxCount === 0
      ? 'No votes yet.'
      : `${leaders[0]?.name} is leading with ${maxCount} ${voteWord} and will be added to the itinerary.`;

  const body = everyoneVoted
    ? (isTie
      ? `Everyone's voted. ${tieLine}`
      : `Everyone's voted. ${leaders[0]?.name} wins with ${maxCount} ${voteWord} and will be added to the itinerary.`)
    : `${capitalize(joinNames(outstandingNames))} ${verb} voted yet. ${standingLine}`;

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
