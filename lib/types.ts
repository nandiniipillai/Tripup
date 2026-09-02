// lib/types.ts — TripUp domain types. See BUILD-SPEC §2.

export type MemberId = string; // 'm_ari'
export type TripId = string; // 'lisbon-2026'
export type Cents = number; // integer, trip currency

export type CurrencyCode = 'EUR' | 'USD' | 'GBP';

export interface Member {
  id: MemberId;
  name: string; // 'Ari'
  fullName: string; // 'Ari Solberg' — used in Group Info only
  initials: string; // 'AS' — Avatar fallback
  isCurrentUser: boolean; // true only for m_ari
  homeCurrency: CurrencyCode; // EXP-05; only the current user's is used for display
  joinedAt: string; // ISO
  avatarTint: number; // 0-5, index into the neutral tint ramp
}

export interface Trip {
  id: TripId;
  name: string; // 'Lisbon Getaway'
  destination: string; // 'Lisbon, Portugal'
  startDate: string; // '2026-08-24'
  endDate: string; // '2026-08-30'
  currency: CurrencyCode; // 'EUR'
  memberIds: MemberId[]; // ordered; drives avatar stacks and tie-breaks
  createdBy: MemberId;
  status: 'upcoming' | 'active' | 'past';
  coverEmoji: string; // '🚋' — Home hero/row glyph. Avoid flags: no glyph on Windows.
}

// ---- Chat feed — discriminated union ----

interface FeedItemBase {
  id: string;
  createdAt: string; // ISO
}

export interface Reaction {
  emoji: string; // always '👍' in the prototype
  memberIds: MemberId[]; // order = arrival order
}

export interface TextMessageItem extends FeedItemBase {
  kind: 'message';
  authorId: MemberId;
  text: string;
  reactions: Reaction[];
}

export type PingKind = 'omw' | 'late10' | 'here';

export interface StatusPingItem extends FeedItemBase {
  kind: 'ping';
  authorId: MemberId;
  ping: PingKind;
}

export interface PollItem extends FeedItemBase {
  kind: 'poll';
  pollId: string;
  authorId: MemberId;
}

export type SystemEvent =
  | { type: 'trip_created'; actorId: MemberId }
  | { type: 'member_added'; actorId: MemberId; subjectId: MemberId }
  | { type: 'poll_closed'; pollId: string; winningOptionId: string; votes: number; total: number }
  | { type: 'poll_closed_early'; pollId: string; winningOptionId: string; votes: number; total: number }
  | { type: 'poll_tie_broken'; pollId: string; winningOptionId: string; actorId: MemberId }
  | { type: 'itinerary_added'; itemId: string; source: 'poll' | 'manual'; actorId: MemberId }
  | { type: 'expense_logged'; expenseId: string; actorId: MemberId };

export interface SystemEventItem extends FeedItemBase {
  kind: 'system';
  event: SystemEvent;
  text: string; // pre-rendered copy
}

export interface ItineraryPreviewItem extends FeedItemBase {
  kind: 'itinerary_preview';
  itineraryItemId: string;
}

export type FeedItem =
  | TextMessageItem
  | StatusPingItem
  | PollItem
  | SystemEventItem
  | ItineraryPreviewItem;

export const PING_LABELS: Record<PingKind, { glyph: string; label: string }> = {
  omw: { glyph: '🚶', label: 'On my way' },
  late10: { glyph: '⏱️', label: 'Running late 10' },
  here: { glyph: '📍', label: 'Here!' },
};

// ---- Polls ----

export type PollStatus = 'open' | 'closed' | 'tie_break';

export interface PollOption {
  id: string;
  name: string; // 'A Cevicheria'
  descriptor?: string; // 'Peruvian-Portuguese, trendy'
  addedById: MemberId;
  addedAt: string;
  isSuggested: boolean; // true = added after the poll was sent (POLL-05)
}

export interface ItinerarySlot {
  date: string; // '2026-08-29'
  time: string; // '20:00'
  label: string; // 'Dinner'
}

export interface Poll {
  id: string;
  tripId: TripId;
  question: string;
  options: PollOption[]; // display order = creation order
  votes: Record<MemberId, string>; // memberId -> optionId
  status: PollStatus;
  createdById: MemberId;
  createdAt: string;
  closedAt?: string;
  closedById?: MemberId; // set only on manual close
  closedEarly: boolean;
  winningOptionId?: string;
  eligibleVoterIds: MemberId[];
  itinerarySlot: ItinerarySlot;
  createdItineraryItemId?: string;
  tieOptionIds?: string[]; // options tied for the lead, when status === 'tie_break'
  addedOptionCaption?: { text: string; expiresAt: number } | null;
}

// ---- Itinerary, expenses ----

export interface ItineraryItem {
  id: string;
  tripId: TripId;
  title: string;
  date: string; // '2026-08-29'
  time: string; // '20:00' 24h
  location: string;
  note?: string;
  estimatedCostPerPerson?: Cents;
  source: 'poll' | 'manual';
  createdById: MemberId;
  createdAt: string;
  sourcePollId?: string;
  convertedToExpenseId?: string;
  votesLabel?: string; // e.g. '4 of 6 votes' — provenance line for poll-created items
}

export interface ExpenseLineItem {
  id: string;
  label: string; // 'Food'
  amount: Cents; // 14000
  includedMemberIds: MemberId[]; // EXP-02
}

export interface Expense {
  id: string;
  tripId: TripId;
  description: string;
  payerId: MemberId;
  lineItems: ExpenseLineItem[]; // >= 1
  createdAt: string;
  createdById: MemberId;
  fromItineraryItemId?: string;
}

export function expenseTotal(expense: Expense): Cents {
  return expense.lineItems.reduce((sum, li) => sum + li.amount, 0);
}

// ---- Derived: balances, transfers ----

export interface Balance {
  memberId: MemberId;
  net: Cents; // >0 = is owed, <0 = owes, 0 = square
  paid: Cents;
  share: Cents;
}

export type TransferStatus = 'outstanding' | 'settled';
export type PaymentMethod = 'bank' | 'card' | 'other';

export interface Transfer {
  id: string; // stable: `t_${fromId}_${toId}`
  fromId: MemberId; // the debtor
  toId: MemberId; // the creditor
  amount: Cents;
  status: TransferStatus;
  settledAt?: string;
  settledById?: MemberId;
  method?: PaymentMethod;
}
