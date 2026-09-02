// Confirms the Confirmation screen's new guard can't lock out the real flow:
// after every transfer is settled, allSettled must be true (page renders), and
// before that it must be false (page redirects to /settle).
// Run: npx tsx scripts/verify-confirmation-guard.ts
import { useTripStore } from '../lib/store';
import { computeBalances, computeTransfers, applySettledStatus } from '../lib/settle';

function log(label: string, ok: boolean, detail?: string) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}${detail ? ` (${detail})` : ''}`);
  if (!ok) process.exitCode = 1;
}

function currentTransfers() {
  const s = useTripStore.getState();
  return applySettledStatus(
    computeTransfers(computeBalances(s.expenses, s.trip.memberIds), s.trip.memberIds),
    s.settledTransferIds,
  );
}

// Seed state: nothing settled → guard must redirect.
let transfers = currentTransfers();
const settledAtStart = transfers.filter((t) => t.status === 'settled').length;
log(
  'Fresh state: not all settled, so Confirmation redirects rather than claiming "all squared up"',
  transfers.length > 0 && settledAtStart !== transfers.length,
  `${settledAtStart} of ${transfers.length} settled`,
);

// Settle every transfer, exactly as the UI does.
for (const t of transfers) {
  useTripStore.getState().settleTransfer(t.id, 'bank');
}

transfers = currentTransfers();
const settledAtEnd = transfers.filter((t) => t.status === 'settled').length;
const allSettled = transfers.length > 0 && settledAtEnd === transfers.length;
log(
  'After settling everything: guard passes, so Confirmation actually renders',
  allSettled,
  `${settledAtEnd} of ${transfers.length} settled`,
);

console.log('\nDone.');
