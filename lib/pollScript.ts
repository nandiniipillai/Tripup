// lib/pollScript.ts — simulated-vote choreography (BUILD-SPEC §6.5) + deriveSlot.
//
// NOTE on the circular import with ./store: store.ts calls startPhaseA/startPhaseB
// from inside action bodies (closures), and this file calls useTripStore.getState()
// only from inside setTimeout callbacks / function bodies — never at module-eval
// time — so the require cycle is safe under ES module live bindings.

import type { ItinerarySlot } from './types';
import { todayDateStr } from './time';
import { SAM_SUGGESTED_OPTION } from './seed';
import { useTripStore } from './store';

export function deriveSlot(question: string): ItinerarySlot {
  const q = question.toLowerCase();
  const table: [RegExp, string, string][] = [
    [/\b(eat|dinner|restaurant|food)\b/, 'Dinner', '20:00'],
    [/\blunch\b/, 'Lunch', '13:00'],
    [/\b(breakfast|coffee|brunch)\b/, 'Breakfast', '09:30'],
    [/\b(drink|bar|night)\b/, 'Drinks', '22:00'],
  ];
  for (const [re, label, time] of table) {
    if (re.test(q)) return { date: todayDateStr(), time, label };
  }
  return { date: todayDateStr(), time: '18:00', label: 'Plan' };
}

const timers = new Map<string, ReturnType<typeof setTimeout>[]>();

function schedule(pollId: string, fn: () => void, delay: number) {
  const id = setTimeout(() => {
    const poll = useTripStore.getState().polls[pollId];
    if (!poll || poll.status !== 'open') return; // no-op if already closed
    fn();
  }, delay);
  const arr = timers.get(pollId) ?? [];
  arr.push(id);
  timers.set(pollId, arr);
}

/** Clears every pending timer for a poll. Must be called on unmount and on close. */
export function clearPollTimers(pollId: string) {
  const arr = timers.get(pollId);
  if (arr) {
    arr.forEach(clearTimeout);
    timers.delete(pollId);
  }
}

/**
 * Phase A — starts the moment the poll is sent, runs regardless of what Ari does.
 * Bot votes target option INDEX (captured at poll-creation time), not option name,
 * so the choreography still works if the reviewer edits the pre-filled option text.
 */
export function startPhaseA(pollId: string) {
  const poll = useTripStore.getState().polls[pollId];
  if (!poll) return;
  const optRamiroId = poll.options[0]?.id;
  const optCevicheriaId = poll.options[1]?.id;

  if (optRamiroId) {
    schedule(pollId, () => {
      useTripStore.getState().castVote(pollId, 'm_nic', optRamiroId);
    }, 1200);
  }

  if (optCevicheriaId) {
    schedule(pollId, () => {
      useTripStore.getState().castVote(pollId, 'm_mia', optCevicheriaId);
    }, 2600);
  }

  schedule(pollId, () => {
    const newOptId = useTripStore.getState().addPollOption(pollId, SAM_SUGGESTED_OPTION, 'm_sam');
    schedule(pollId, () => {
      useTripStore.getState().castVote(pollId, 'm_sam', newOptId);
    }, 800); // 5000 - 4200
  }, 4200);
}

/** Phase B — starts when Ari casts their first vote. */
export function startPhaseB(pollId: string) {
  const poll = useTripStore.getState().polls[pollId];
  if (!poll) return;
  const optCevicheriaId = poll.options[1]?.id;
  if (!optCevicheriaId) return;

  schedule(pollId, () => {
    useTripStore.getState().castVote(pollId, 'm_jules', optCevicheriaId);
  }, 1400);

  schedule(pollId, () => {
    const trip = useTripStore.getState().trip;
    if (!trip.memberIds.includes('m_ren')) return; // Ren never added -> no-op
    useTripStore.getState().castVote(pollId, 'm_ren', optCevicheriaId);
  }, 2800);
}
