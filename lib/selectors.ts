// lib/selectors.ts — derived balances/transfers/badges.
//
// IMPORTANT: Zustand's `useStore(selector)` requires the selector's return
// value to be referentially stable when nothing relevant changed (React's
// `useSyncExternalStore` contract — "the result of getSnapshot should be
// cached"). A selector that builds a new array/object every call (e.g.
// `computeBalances(...)`) breaks that contract and throws an infinite-loop
// error the moment it's passed straight to `useTripStore(...)`. So every
// derived value here is exposed as a `use*` hook that subscribes to the raw,
// reference-stable state slices and memoizes the actual computation with
// `useMemo` — never as a plain selector function handed to `useTripStore`.

import { useMemo } from 'react';
import type { Balance, ItineraryItem, MemberId } from './types';
import { useTripStore } from './store';
import { CURRENT_USER_ID } from './seed';
import { computeBalances, computeTransfers, computeNaivePaymentCount, applySettledStatus } from './settle';

// Raw balances, straight from expenses — no settlement applied. This is the
// input computeTransfers consolidates against, so it must stay untouched by
// settledTransferIds: recomputing the consolidated set off partially-netted
// balances would change which pairs/amounts it produces mid-settle, which is
// exactly the "fixed 5 transfers" guarantee useTransfers + the settle screen
// depend on. Internal — screens that DISPLAY a balance to the user should use
// useDisplayBalances below instead.
export function useBalances() {
  const expenses = useTripStore((s) => s.expenses);
  const memberIds = useTripStore((s) => s.trip.memberIds);
  return useMemo(() => computeBalances(expenses, memberIds), [expenses, memberIds]);
}

export function useTransfers() {
  const balances = useBalances();
  const memberIds = useTripStore((s) => s.trip.memberIds);
  const settledTransferIds = useTripStore((s) => s.settledTransferIds);
  return useMemo(
    () => applySettledStatus(computeTransfers(balances, memberIds), settledTransferIds),
    [balances, memberIds, settledTransferIds],
  );
}

/**
 * Balances as they should be DISPLAYED to the user: raw (expense-derived)
 * balances, netted down by whatever's already been settled.
 *
 * Bug this fixes: the Settle Up hero, the Expenses balance list, and the Home
 * hero's "You owe" line all used to read straight off useBalances(), which
 * only reflects expenses — never settledTransferIds. So settling every
 * transfer produced a "You're all squared up!" confirmation screen, and then
 * every other screen you navigated back to still showed the original
 * pre-settlement debts. This selector is the fix: for each transfer in the
 * locked consolidated set that's been settled, move its amount off both
 * parties' `net` (debtor's net moves up toward zero, creditor's moves down
 * toward zero) — without touching computeTransfers' own output (that set
 * stays fixed for the whole settle flow; see useTransfers above).
 */
export function useDisplayBalances(): Record<MemberId, Balance> {
  const balances = useBalances();
  const memberIds = useTripStore((s) => s.trip.memberIds);
  const settledTransferIds = useTripStore((s) => s.settledTransferIds);
  return useMemo(() => {
    const transfers = computeTransfers(balances, memberIds);
    const next: Record<MemberId, Balance> = {};
    for (const [id, b] of Object.entries(balances)) next[id] = { ...b };
    for (const t of transfers) {
      if (!settledTransferIds[t.id]) continue;
      if (next[t.fromId]) next[t.fromId] = { ...next[t.fromId], net: next[t.fromId].net + t.amount };
      if (next[t.toId]) next[t.toId] = { ...next[t.toId], net: next[t.toId].net - t.amount };
    }
    return next;
  }, [balances, memberIds, settledTransferIds]);
}

export function useMyTransfers() {
  const transfers = useTransfers();
  return useMemo(
    () => transfers.filter((t) => t.fromId === CURRENT_USER_ID || t.toId === CURRENT_USER_ID),
    [transfers],
  );
}

export function useOtherTransfers() {
  const transfers = useTransfers();
  return useMemo(
    () => transfers.filter((t) => t.fromId !== CURRENT_USER_ID && t.toId !== CURRENT_USER_ID),
    [transfers],
  );
}

export function useNaivePaymentCount() {
  const expenses = useTripStore((s) => s.expenses);
  return useMemo(() => computeNaivePaymentCount(expenses), [expenses]);
}

export function useAllSettled() {
  const transfers = useTransfers();
  return transfers.length > 0 && transfers.every((t) => t.status === 'settled');
}

export function useItineraryByDay(): [string, ItineraryItem[]][] {
  const itinerary = useTripStore((s) => s.itinerary);
  return useMemo(() => {
    const groups: Record<string, ItineraryItem[]> = {};
    for (const item of itinerary) {
      (groups[item.date] ??= []).push(item);
    }
    for (const date of Object.keys(groups)) {
      groups[date].sort((a, b) => a.time.localeCompare(b.time));
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [itinerary]);
}
