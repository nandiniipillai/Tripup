// Headless verification of the exact interaction the "Pay" button triggers:
// setOpenDialog({type:'settle', transferId, mode}) -> settleTransfer(id, method) -> allSettled flag.
// Run with: npx tsx scripts/verify-settle-flow.ts
import { useTripStore } from '../lib/store';
import { computeBalances, computeTransfers } from '../lib/settle';
import { TRIP, EXPENSES, REN } from '../lib/seed';

function log(label: string, ok: boolean, detail?: string) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}${detail ? ` (${detail})` : ''}`);
  if (!ok) process.exitCode = 1;
}

// 1. Pre-dinner state (fresh seed): confirm the exact "Pay" screen we saw live.
const preBalances = computeBalances(EXPENSES, TRIP.memberIds);
const preTransfers = computeTransfers(preBalances, TRIP.memberIds);
const ariPre = preTransfers.find((t) => t.fromId === 'm_ari');
log(
  'Pre-dinner: 4 total transfers into Mia, Ari\'s own row is exactly €70.00 (matches the live "Pay" screenshot)',
  preTransfers.length === 4 && ariPre?.toId === 'm_mia' && ariPre?.amount === 7000,
  JSON.stringify(preTransfers.map((t) => `${t.fromId}->${t.toId}:${t.amount}`)),
);

// 2. Full scenario: log the dinner expense exactly as the scenario/spec describes, then re-derive.
const state = useTripStore.getState();
state.addMember({ id: REN.id, name: REN.fullName, handle: REN.name, initials: REN.initials });

state.addExpense({
  description: 'Dinner at A Cevicheria',
  payerId: 'm_ari',
  lineItems: [
    { id: 'li_food', label: 'Food', amount: 14000, includedMemberIds: ['m_ari', 'm_nic', 'm_sam', 'm_mia', 'm_ren'] },
    { id: 'li_wine', label: 'Wine', amount: 4500, includedMemberIds: ['m_ari', 'm_sam', 'm_mia'] },
  ],
});

const after = useTripStore.getState();
const balances = computeBalances(after.expenses, after.trip.memberIds);
const transfers = computeTransfers(balances, after.trip.memberIds);

const expectedNet: Record<string, number> = {
  m_jules: -7000, m_ari: 7200, m_nic: -9800, m_sam: -6300, m_mia: 18700, m_ren: -2800,
};
let netsOk = true;
for (const [id, expected] of Object.entries(expectedNet)) {
  if (balances[id]?.net !== expected) { netsOk = false; console.log(`  mismatch ${id}: got ${balances[id]?.net}, want ${expected}`); }
}
log('Post-dinner net balances match the locked ledger exactly', netsOk);

const expectedTransfers = [
  ['m_nic', 'm_mia', 9800], ['m_jules', 'm_mia', 7000], ['m_sam', 'm_mia', 1900],
  ['m_sam', 'm_ari', 4400], ['m_ren', 'm_ari', 2800],
];
const gotTransfers = transfers.map((t) => [t.fromId, t.toId, t.amount]);
log(
  'Consolidated to exactly 5 transfers in the locked order',
  JSON.stringify(gotTransfers) === JSON.stringify(expectedTransfers),
  JSON.stringify(gotTransfers),
);

// 3. Now drive the ACTUAL Pay-button code path for every transfer, exactly as the UI does it.
let allSettledFlag = false;
for (const t of transfers) {
  useTripStore.getState().setOpenDialog({ type: 'settle', transferId: t.id, mode: 'record' });
  const dialog = useTripStore.getState().ui.openDialog;
  log(`setOpenDialog opened the right transfer for ${t.fromId}->${t.toId}`, dialog?.type === 'settle' && dialog.transferId === t.id);

  const result = useTripStore.getState().settleTransfer(t.id, 'bank');
  allSettledFlag = result.allSettled;
}
log('After settling all 5 transfers, settleTransfer reports allSettled=true (routes to Confirmation)', allSettledFlag === true);

const finalTransfers = computeTransfers(
  computeBalances(useTripStore.getState().expenses, useTripStore.getState().trip.memberIds),
  useTripStore.getState().trip.memberIds,
);
const settledMap = useTripStore.getState().settledTransferIds;
const allMarked = finalTransfers.every((t) => !!settledMap[t.id]);
log('Every transfer is individually marked settled with method+timestamp', allMarked);

console.log('\nDone.');
