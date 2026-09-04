// lib/store.ts — single Zustand store, module-level, seeded synchronously so
// server/client render identical initial state (no `persist`, no provider).

import { create } from 'zustand';
import { toast } from 'sonner';
import type {
  Trip, Member, MemberId, FeedItem, Poll, PollOption, ItineraryItem, Expense,
  ExpenseLineItem, PaymentMethod, TextMessageItem, StatusPingItem, SystemEventItem,
  ItineraryPreviewItem, PingKind, PollItem, SystemEvent,
} from './types';
import { expenseTotal } from './types';
import { TRIP, MEMBERS, REN, SEED_FEED, EXPENSES, ITINERARY, CURRENT_USER_ID } from './seed';
import { nowPlusMinutes } from './time';
import { formatCents } from './money';
import { computeBalances, computeTransfers, applySettledStatus } from './settle';
import { deriveSlot, startPhaseA, startPhaseB, clearPollTimers } from './pollScript';

let counter = 0;
function genId(prefix: string): string {
  counter += 1;
  return `${prefix}_${counter}`;
}

const POLL_OPTION_LOCATIONS: Record<string, string> = {
  'Cervejaria Ramiro': 'Av. Almirante Reis 1, Lisboa',
  'A Cevicheria': 'Rua Dom Pedro V 129, Príncipe Real',
  'Taberna da Rua das Flores': 'Rua das Flores 103, Lisboa',
  'Time Out Market': 'Av. 24 de Julho 49, Lisboa',
};

export interface DirectoryEntry {
  id: string;
  name: string;
  handle: string;
  initials: string;
}

export interface ExpenseDraft {
  description: string;
  payerId: MemberId;
  lineItems: ExpenseLineItem[];
  fromItineraryItemId?: string;
}

export interface ItineraryDraft {
  title: string;
  date: string;
  time: string;
  location: string;
  estimatedCostPerPerson?: number;
}

export interface PollDraft {
  question: string;
  options: { name: string; descriptor?: string }[];
}

export type SheetName = 'groupInfo' | 'createPoll' | 'addItinerary';

export type DialogState =
  | { type: 'closePoll'; pollId: string }
  | { type: 'tieBreak'; pollId: string }
  | { type: 'settle'; transferId: string; mode: 'pay' | 'receive' | 'record' };

interface UiState {
  activeTab: 'chat' | 'itinerary' | 'expenses';
  itineraryHasUpdate: boolean;
  expensesHasUpdate: boolean;
  openSheet: SheetName | null;
  openDialog: DialogState | null;
  highlightItineraryItemId: string | null;
  remindedTransferIds: Record<string, boolean>;
  clockOffsetMinutes: number;
}

export interface TripUpState {
  trip: Trip;
  members: Record<MemberId, Member>;
  feed: FeedItem[];
  polls: Record<string, Poll>;
  itinerary: ItineraryItem[];
  expenses: Expense[];
  settledTransferIds: Record<string, { method: PaymentMethod; settledAt: string; settledById: MemberId }>;
  ui: UiState;

  // actions
  setActiveTab: (tab: UiState['activeTab']) => void;
  openSheet: (sheet: SheetName) => void;
  closeSheet: () => void;
  setOpenDialog: (dialog: DialogState | null) => void;
  flashItineraryItem: (id: string) => void;
  markReminded: (transferId: string) => void;

  addMember: (entry: DirectoryEntry) => { added: boolean; member?: Member };
  sendMessage: (text: string) => void;
  sendPing: (ping: PingKind) => void;
  toggleReaction: (feedItemId: string) => void;

  createPoll: (draft: PollDraft) => string;
  castVote: (pollId: string, memberId: MemberId, optionId: string) => void;
  addPollOption: (pollId: string, opt: { name: string; descriptor?: string }, byId: MemberId) => string;
  closePoll: (pollId: string, opts: { auto: boolean; byId?: MemberId }) => void;
  resolveTie: (pollId: string, optionId: string) => void;

  addExpense: (draft: ExpenseDraft) => string;
  addItineraryItem: (draft: ItineraryDraft) => string;
  settleTransfer: (transferId: string, method: PaymentMethod) => { allSettled: boolean };
}

const initialMembers: Record<MemberId, Member> = {};
for (const m of MEMBERS) initialMembers[m.id] = m;

export const useTripStore = create<TripUpState>((set, get) => {
  function finalizePollClose(
    pollId: string,
    winningOptionId: string,
    opts: { auto: boolean; byId?: MemberId; tieBreakActorId?: MemberId },
  ) {
    const state = get();
    const poll = state.polls[pollId];
    if (!poll) return;
    const winner = poll.options.find((o) => o.id === winningOptionId);
    if (!winner) return;

    const tally: Record<string, number> = {};
    for (const o of poll.options) tally[o.id] = 0;
    for (const optId of Object.values(poll.votes)) tally[optId] = (tally[optId] ?? 0) + 1;
    const winnerVotes = tally[winningOptionId] ?? 0;
    const total = Object.keys(poll.votes).length;

    const offset = state.ui.clockOffsetMinutes + 1;
    const closedAt = nowPlusMinutes(offset);

    const location = POLL_OPTION_LOCATIONS[winner.name] ?? 'Lisbon, Portugal';
    const itineraryId = winner.name === 'A Cevicheria' ? 'itin_dinner' : genId('itin');
    const newItem: ItineraryItem = {
      id: itineraryId,
      tripId: state.trip.id,
      title: `${poll.itinerarySlot.label} @ ${winner.name}`,
      date: poll.itinerarySlot.date,
      time: poll.itinerarySlot.time,
      location,
      note: winner.descriptor,
      source: 'poll',
      createdById: CURRENT_USER_ID,
      createdAt: closedAt,
      sourcePollId: pollId,
      votesLabel: `${winnerVotes} of ${total} votes`,
    };

    let systemText: string;
    let event: SystemEvent;
    if (opts.tieBreakActorId) {
      systemText = `— Ari broke the tie · ${winner.name} wins —`;
      event = { type: 'poll_tie_broken', pollId, winningOptionId, actorId: opts.tieBreakActorId };
    } else if (!opts.auto) {
      systemText = `— Poll closed early by Ari · ${winner.name} wins with ${winnerVotes} of ${total} votes —`;
      event = { type: 'poll_closed_early', pollId, winningOptionId, votes: winnerVotes, total };
    } else {
      systemText = `— ${winner.name} wins with ${winnerVotes} of ${total} votes —`;
      event = { type: 'poll_closed', pollId, winningOptionId, votes: winnerVotes, total };
    }

    const systemFeedItem: SystemEventItem = { id: genId('f_sys'), kind: 'system', createdAt: closedAt, event, text: systemText };
    const previewFeedItem: ItineraryPreviewItem = { id: genId('f_itin'), kind: 'itinerary_preview', createdAt: closedAt, itineraryItemId: newItem.id };

    set((s) => ({
      polls: {
        ...s.polls,
        [pollId]: {
          ...s.polls[pollId],
          status: 'closed',
          winningOptionId,
          closedAt,
          closedById: opts.byId,
          closedEarly: !opts.auto,
          createdItineraryItemId: newItem.id,
        },
      },
      itinerary: [...s.itinerary, newItem],
      feed: [...s.feed, systemFeedItem, previewFeedItem],
      ui: {
        ...s.ui,
        clockOffsetMinutes: offset,
        itineraryHasUpdate: s.ui.activeTab !== 'itinerary' ? true : s.ui.itineraryHasUpdate,
        openDialog: null,
      },
    }));

    setTimeout(() => {
      const s = get();
      const off = s.ui.clockOffsetMinutes + 1;
      const text = winner.name === 'A Cevicheria' ? 'Booked for 8. See you all there 🦐' : 'Great choice! See you all there 🎉';
      const msg: TextMessageItem = { id: genId('f_m'), kind: 'message', authorId: 'm_mia', createdAt: nowPlusMinutes(off), text, reactions: [] };
      set((st) => ({ feed: [...st.feed, msg], ui: { ...st.ui, clockOffsetMinutes: off } }));
    }, 1200);
  }

  return {
    trip: TRIP,
    members: initialMembers,
    feed: SEED_FEED,
    polls: {},
    itinerary: ITINERARY,
    expenses: EXPENSES,
    settledTransferIds: {},
    ui: {
      activeTab: 'chat',
      itineraryHasUpdate: false,
      expensesHasUpdate: false,
      openSheet: null,
      openDialog: null,
      highlightItineraryItemId: null,
      remindedTransferIds: {},
      clockOffsetMinutes: 0,
    },

    setActiveTab: (tab) => set((s) => ({
      ui: {
        ...s.ui,
        activeTab: tab,
        itineraryHasUpdate: tab === 'itinerary' ? false : s.ui.itineraryHasUpdate,
        expensesHasUpdate: tab === 'expenses' ? false : s.ui.expensesHasUpdate,
      },
    })),

    openSheet: (sheet) => set((s) => ({ ui: { ...s.ui, openSheet: sheet } })),
    closeSheet: () => set((s) => ({ ui: { ...s.ui, openSheet: null } })),
    setOpenDialog: (dialog) => set((s) => ({ ui: { ...s.ui, openDialog: dialog } })),

    flashItineraryItem: (id) => {
      set((s) => ({ ui: { ...s.ui, highlightItineraryItemId: id } }));
      setTimeout(() => {
        set((s) => (s.ui.highlightItineraryItemId === id ? { ui: { ...s.ui, highlightItineraryItemId: null } } : {}));
      }, 1200);
    },

    markReminded: (transferId) => set((s) => ({ ui: { ...s.ui, remindedTransferIds: { ...s.ui.remindedTransferIds, [transferId]: true } } })),

    addMember: (entry) => {
      const state = get();
      if (state.trip.memberIds.includes(entry.id)) {
        const firstName = entry.name.split(' ')[0];
        toast(`${firstName}'s already in this trip.`);
        return { added: false };
      }
      const offset = state.ui.clockOffsetMinutes + 1;
      const newMember: Member = entry.id === REN.id
        ? { ...REN, joinedAt: nowPlusMinutes(offset) }
        : {
          id: entry.id,
          name: entry.name.split(' ')[0],
          fullName: entry.name,
          initials: entry.initials,
          isCurrentUser: false,
          homeCurrency: 'EUR',
          joinedAt: nowPlusMinutes(offset),
          avatarTint: Object.keys(state.members).length % 6,
        };
      const feedItem: SystemEventItem = {
        id: genId('f_sys'),
        kind: 'system',
        createdAt: nowPlusMinutes(offset),
        event: { type: 'member_added', actorId: CURRENT_USER_ID, subjectId: newMember.id },
        text: `— Ari added ${newMember.name} to the trip —`,
      };
      set((s) => {
        const polls = { ...s.polls };
        for (const pid of Object.keys(polls)) {
          const p = polls[pid];
          if (p.status === 'open' && !p.eligibleVoterIds.includes(newMember.id)) {
            polls[pid] = { ...p, eligibleVoterIds: [...p.eligibleVoterIds, newMember.id] };
          }
        }
        return {
          members: { ...s.members, [newMember.id]: newMember },
          trip: { ...s.trip, memberIds: [...s.trip.memberIds, newMember.id] },
          feed: [...s.feed, feedItem],
          polls,
          ui: { ...s.ui, clockOffsetMinutes: offset },
        };
      });
      return { added: true, member: newMember };
    },

    sendMessage: (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const state = get();
      const offset = state.ui.clockOffsetMinutes + 1;
      const item: TextMessageItem = { id: genId('f_m'), kind: 'message', authorId: CURRENT_USER_ID, text: trimmed, reactions: [], createdAt: nowPlusMinutes(offset) };
      set((s) => ({ feed: [...s.feed, item], ui: { ...s.ui, clockOffsetMinutes: offset } }));
    },

    sendPing: (pingKind) => {
      const state = get();
      const offset = state.ui.clockOffsetMinutes + 1;
      const item: StatusPingItem = { id: genId('f_p'), kind: 'ping', authorId: CURRENT_USER_ID, ping: pingKind, createdAt: nowPlusMinutes(offset) };
      set((s) => ({ feed: [...s.feed, item], ui: { ...s.ui, clockOffsetMinutes: offset } }));
    },

    toggleReaction: (feedItemId) => {
      set((s) => ({
        feed: s.feed.map((item) => {
          if (item.id !== feedItemId || item.kind !== 'message') return item;
          const existing = item.reactions.find((r) => r.emoji === '👍');
          if (existing?.memberIds.includes(CURRENT_USER_ID)) {
            const memberIds = existing.memberIds.filter((id) => id !== CURRENT_USER_ID);
            const reactions = memberIds.length
              ? item.reactions.map((r) => (r.emoji === '👍' ? { ...r, memberIds } : r))
              : item.reactions.filter((r) => r.emoji !== '👍');
            return { ...item, reactions };
          }
          const reactions = existing
            ? item.reactions.map((r) => (r.emoji === '👍' ? { ...r, memberIds: [...r.memberIds, CURRENT_USER_ID] } : r))
            : [...item.reactions, { emoji: '👍', memberIds: [CURRENT_USER_ID] }];
          return { ...item, reactions };
        }),
      }));
    },

    createPoll: (draft) => {
      const state = get();
      const offset = state.ui.clockOffsetMinutes + 1;
      const pollId = genId('poll');
      const createdAt = nowPlusMinutes(offset);
      const options: PollOption[] = draft.options
        .filter((o) => o.name.trim())
        .map((o) => ({
          id: genId('opt'),
          name: o.name.trim(),
          descriptor: o.descriptor?.trim() || undefined,
          addedById: CURRENT_USER_ID,
          addedAt: createdAt,
          isSuggested: false,
        }));
      const poll: Poll = {
        id: pollId,
        tripId: state.trip.id,
        question: draft.question.trim(),
        options,
        votes: {},
        status: 'open',
        createdById: CURRENT_USER_ID,
        createdAt,
        closedEarly: false,
        eligibleVoterIds: [...state.trip.memberIds],
        itinerarySlot: deriveSlot(draft.question),
      };
      const feedItem: PollItem = { id: genId('f_poll'), kind: 'poll', pollId, authorId: CURRENT_USER_ID, createdAt };
      // Per the hi-fi: the scenario's "everyone is notified" beat had no
      // representation anywhere — not the wireflow, not the build. A system
      // line right after the poll card is the cheapest honest way to show
      // the group was actually reached, not just that Ari sent something.
      const sentCount = poll.eligibleVoterIds.filter((id) => id !== CURRENT_USER_ID).length;
      const sentItem: SystemEventItem = {
        id: genId('f_sys'), kind: 'system', createdAt,
        event: { type: 'poll_sent', pollId, count: sentCount },
        text: `Sent to ${sentCount} people`,
      };
      set((s) => ({
        polls: { ...s.polls, [pollId]: poll },
        // Confirmation sits above the card, per the hi-fi — "you're about to
        // see this land" before the card that's about to fill with votes.
        feed: [...s.feed, sentItem, feedItem],
        ui: { ...s.ui, clockOffsetMinutes: offset, openSheet: null },
      }));
      startPhaseA(pollId);
      return pollId;
    },

    castVote: (pollId, memberId, optionId) => {
      const state = get();
      const poll = state.polls[pollId];
      if (!poll || poll.status !== 'open') return;
      const isFirstAriVote = memberId === CURRENT_USER_ID && !(CURRENT_USER_ID in poll.votes);
      const newVotes = { ...poll.votes, [memberId]: optionId };
      set((s) => ({
        polls: { ...s.polls, [pollId]: { ...s.polls[pollId], votes: newVotes } },
      }));
      if (isFirstAriVote) {
        startPhaseB(pollId);
      }
      const voteCount = Object.keys(newVotes).length;
      if (voteCount >= poll.eligibleVoterIds.length) {
        setTimeout(() => {
          const p = get().polls[pollId];
          if (p && p.status === 'open') get().closePoll(pollId, { auto: true });
        }, 900);
      }
    },

    addPollOption: (pollId, optDraft, byId) => {
      const state = get();
      const poll = state.polls[pollId];
      if (!poll) return '';
      const offset = state.ui.clockOffsetMinutes + 1;
      const newOption: PollOption = {
        id: genId('opt'),
        name: optDraft.name,
        descriptor: optDraft.descriptor,
        addedById: byId,
        addedAt: nowPlusMinutes(offset),
        isSuggested: true,
      };
      const authorName = state.members[byId]?.name ?? 'Someone';
      const captionText = byId === CURRENT_USER_ID ? 'You added an option' : `${authorName} added an option`;
      set((s) => ({
        polls: {
          ...s.polls,
          [pollId]: {
            ...s.polls[pollId],
            options: [...s.polls[pollId].options, newOption],
            addedOptionCaption: { text: captionText, expiresAt: Date.now() + 6000 },
          },
        },
        ui: { ...s.ui, clockOffsetMinutes: offset },
      }));
      setTimeout(() => {
        set((s) => {
          const p = s.polls[pollId];
          if (!p || !p.addedOptionCaption) return {};
          return { polls: { ...s.polls, [pollId]: { ...p, addedOptionCaption: null } } };
        });
      }, 6000);
      return newOption.id;
    },

    closePoll: (pollId, opts) => {
      const state = get();
      const poll = state.polls[pollId];
      if (!poll || poll.status === 'closed') return;
      clearPollTimers(pollId);

      const tally: Record<string, number> = {};
      for (const o of poll.options) tally[o.id] = 0;
      for (const optId of Object.values(poll.votes)) tally[optId] = (tally[optId] ?? 0) + 1;
      const counts = Object.values(tally);
      const maxCount = counts.length ? Math.max(...counts) : 0;
      const leaders = poll.options.filter((o) => tally[o.id] === maxCount);

      if (leaders.length > 1 && maxCount > 0) {
        set((s) => ({
          polls: {
            ...s.polls,
            [pollId]: {
              ...s.polls[pollId],
              status: 'tie_break',
              tieOptionIds: leaders.map((o) => o.id),
              closedEarly: !opts.auto,
              closedById: opts.byId,
            },
          },
          ui: { ...s.ui, openDialog: { type: 'tieBreak', pollId } },
        }));
        return;
      }

      const winner = leaders[0] ?? poll.options[0];
      if (!winner) return;
      finalizePollClose(pollId, winner.id, { auto: opts.auto, byId: opts.byId });
    },

    resolveTie: (pollId, optionId) => {
      finalizePollClose(pollId, optionId, { auto: false, byId: CURRENT_USER_ID, tieBreakActorId: CURRENT_USER_ID });
    },

    addExpense: (draft) => {
      const state = get();
      const offset = state.ui.clockOffsetMinutes + 1;
      const id = genId('exp');
      const expense: Expense = {
        id,
        tripId: state.trip.id,
        description: draft.description,
        payerId: draft.payerId,
        lineItems: draft.lineItems,
        createdAt: nowPlusMinutes(offset),
        createdById: CURRENT_USER_ID,
        fromItineraryItemId: draft.fromItineraryItemId,
      };
      const total = expenseTotal(expense);
      const feedItem: SystemEventItem = {
        id: genId('f_sys'),
        kind: 'system',
        createdAt: nowPlusMinutes(offset),
        event: { type: 'expense_logged', expenseId: id, actorId: CURRENT_USER_ID },
        text: `— Ari logged ${draft.description} — ${formatCents(total)} —`,
      };
      set((s) => {
        const itinerary = draft.fromItineraryItemId
          ? s.itinerary.map((it) => (it.id === draft.fromItineraryItemId ? { ...it, convertedToExpenseId: id } : it))
          : s.itinerary;
        return {
          expenses: [...s.expenses, expense],
          itinerary,
          feed: [...s.feed, feedItem],
          ui: {
            ...s.ui,
            clockOffsetMinutes: offset,
            expensesHasUpdate: s.ui.activeTab !== 'expenses' ? true : s.ui.expensesHasUpdate,
          },
        };
      });
      return id;
    },

    addItineraryItem: (draft) => {
      const state = get();
      const offset = state.ui.clockOffsetMinutes + 1;
      const id = genId('itin');
      const item: ItineraryItem = {
        id,
        tripId: state.trip.id,
        title: draft.title,
        date: draft.date,
        time: draft.time,
        location: draft.location,
        estimatedCostPerPerson: draft.estimatedCostPerPerson,
        source: 'manual',
        createdById: CURRENT_USER_ID,
        createdAt: nowPlusMinutes(offset),
      };
      const feedItem: SystemEventItem = {
        id: genId('f_sys'),
        kind: 'system',
        createdAt: nowPlusMinutes(offset),
        event: { type: 'itinerary_added', itemId: id, source: 'manual', actorId: CURRENT_USER_ID },
        text: `— Ari added ${draft.title} to the itinerary —`,
      };
      set((s) => ({
        itinerary: [...s.itinerary, item],
        feed: [...s.feed, feedItem],
        ui: {
          ...s.ui,
          clockOffsetMinutes: offset,
          itineraryHasUpdate: s.ui.activeTab !== 'itinerary' ? true : s.ui.itineraryHasUpdate,
        },
      }));
      return id;
    },

    settleTransfer: (transferId, method) => {
      const state = get();
      const offset = state.ui.clockOffsetMinutes + 1;
      const settledAt = nowPlusMinutes(offset);
      set((s) => ({
        settledTransferIds: { ...s.settledTransferIds, [transferId]: { method, settledAt, settledById: CURRENT_USER_ID } },
        ui: { ...s.ui, clockOffsetMinutes: offset, openDialog: null },
      }));
      const after = get();
      const balances = computeBalances(after.expenses, after.trip.memberIds);
      const transfers = applySettledStatus(computeTransfers(balances, after.trip.memberIds), after.settledTransferIds);
      const allSettled = transfers.length > 0 && transfers.every((t) => t.status === 'settled');
      return { allSettled };
    },
  };
});
