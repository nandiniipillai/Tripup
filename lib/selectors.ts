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
import type { ItineraryItem } from './types';
import { useTripStore } from './store';
import { CURRENT_USER_ID } from './seed';
import { computeBalances, computeTransfers, computeNaivePaymentCount, applySettledStatus } from './settle';

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
