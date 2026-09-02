// lib/settle.ts — balance computation and creditor-driven greedy consolidation.
// See BUILD-SPEC §2.5. Do not "simplify" the pairing loop — the exact ordering
// (creditors desc, debtors desc, largest-creditor-first) is required to
// reproduce the locked ledger.

import type { Balance, Cents, Expense, MemberId, PaymentMethod, Transfer } from './types';
import { expenseTotal } from './types';
import { splitEvenly } from './money';

export function computeBalances(expenses: Expense[], memberIds: MemberId[]): Record<MemberId, Balance> {
  const balances: Record<MemberId, Balance> = {};
  for (const id of memberIds) {
    balances[id] = { memberId: id, net: 0, paid: 0, share: 0 };
  }

  for (const expense of expenses) {
    const total = expenseTotal(expense);
    if (balances[expense.payerId]) {
      balances[expense.payerId].paid += total;
    } else {
      balances[expense.payerId] = { memberId: expense.payerId, net: 0, paid: total, share: 0 };
    }

    for (const li of expense.lineItems) {
      const shares = splitEvenly(li.amount, li.includedMemberIds, expense.payerId, memberIds);
      for (const [memberId, cents] of Object.entries(shares)) {
        if (!balances[memberId]) balances[memberId] = { memberId, net: 0, paid: 0, share: 0 };
        balances[memberId].share += cents;
      }
    }
  }

  let sumNet = 0;
  for (const id of Object.keys(balances)) {
    balances[id].net = balances[id].paid - balances[id].share;
    sumNet += balances[id].net;
  }

  if (process.env.NODE_ENV !== 'production' && sumNet !== 0) {
    console.error(`[TripUp] computeBalances invariant violated: sum(net) = ${sumNet}, expected 0`);
  }

  return balances;
}

interface Ledger {
  memberId: MemberId;
  remaining: Cents; // positive
  index: number; // tie-break by trip.memberIds order
}

/**
 * computeTransfers — creditor-driven greedy consolidation.
 * 1. Split into creditors (net>0) / debtors (net<0).
 * 2. Sort creditors desc by net, ties by memberIds index.
 * 3. Sort debtors desc by |net|, ties by memberIds index.
 * 4. Take the largest remaining creditor; repeatedly pair with the largest
 *    remaining debtor, transferring min(creditorRemaining, debtorRemaining),
 *    until the creditor reaches zero. Then move to the next creditor.
 */
export function computeTransfers(balances: Record<MemberId, Balance>, memberOrder: MemberId[]): Transfer[] {
  const indexOf = (id: MemberId) => {
    const i = memberOrder.indexOf(id);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };

  const creditors: Ledger[] = [];
  const debtors: Ledger[] = [];

  for (const b of Object.values(balances)) {
    if (b.net > 0) creditors.push({ memberId: b.memberId, remaining: b.net, index: indexOf(b.memberId) });
    else if (b.net < 0) debtors.push({ memberId: b.memberId, remaining: -b.net, index: indexOf(b.memberId) });
  }

  creditors.sort((a, b) => b.remaining - a.remaining || a.index - b.index);
  debtors.sort((a, b) => b.remaining - a.remaining || a.index - b.index);

  const transfers: Transfer[] = [];

  for (const creditor of creditors) {
    while (creditor.remaining > 0) {
      // largest remaining debtor
      let largestIdx = -1;
      for (let i = 0; i < debtors.length; i++) {
        if (debtors[i].remaining <= 0) continue;
        if (largestIdx === -1) { largestIdx = i; continue; }
        const a = debtors[i];
        const b = debtors[largestIdx];
        if (a.remaining > b.remaining || (a.remaining === b.remaining && a.index < b.index)) {
          largestIdx = i;
        }
      }
      if (largestIdx === -1) break; // no debtors left (shouldn't happen if sum(net)===0)

      const debtor = debtors[largestIdx];
      const amount = Math.min(creditor.remaining, debtor.remaining);
      transfers.push({
        id: `t_${debtor.memberId}_${creditor.memberId}`,
        fromId: debtor.memberId,
        toId: creditor.memberId,
        amount,
        status: 'outstanding',
      });
      creditor.remaining -= amount;
      debtor.remaining -= amount;
    }
  }

  return transfers;
}

/**
 * Naive payment count (banner denominator): for each expense, the number of
 * distinct members appearing in any line item's includedMemberIds excluding
 * the payer, summed across expenses.
 */
export function computeNaivePaymentCount(expenses: Expense[]): number {
  let count = 0;
  for (const expense of expenses) {
    const distinct = new Set<MemberId>();
    for (const li of expense.lineItems) {
      for (const memberId of li.includedMemberIds) {
        if (memberId !== expense.payerId) distinct.add(memberId);
      }
    }
    count += distinct.size;
  }
  return count;
}

export function applySettledStatus(
  transfers: Transfer[],
  settledTransferIds: Record<string, { method: PaymentMethod; settledAt: string; settledById: MemberId }>,
): Transfer[] {
  return transfers.map((t) => {
    const settled = settledTransferIds[t.id];
    if (!settled) return t;
    return { ...t, status: 'settled', settledAt: settled.settledAt, settledById: settled.settledById, method: settled.method };
  });
}
