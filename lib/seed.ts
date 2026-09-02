// lib/seed.ts — the exact scenario data. Do not alter names, amounts, or copy. See BUILD-SPEC §2.7.

import type { Expense, FeedItem, ItineraryItem, Member, Trip } from './types';

export const TRIP_ID = 'lisbon-2026';
export const CURRENT_USER_ID = 'm_ari';

export const MEMBERS: Member[] = [
  { id: 'm_jules', name: 'Jules', fullName: 'Jules Amara', initials: 'JA', isCurrentUser: false, homeCurrency: 'EUR', joinedAt: '2026-08-24T10:04:00', avatarTint: 0 },
  { id: 'm_ari', name: 'Ari', fullName: 'Ari Solberg', initials: 'AS', isCurrentUser: true, homeCurrency: 'USD', joinedAt: '2026-08-24T10:04:00', avatarTint: 1 },
  { id: 'm_nic', name: 'Nic', fullName: 'Nic Faraday', initials: 'NF', isCurrentUser: false, homeCurrency: 'GBP', joinedAt: '2026-08-24T10:04:00', avatarTint: 2 },
  { id: 'm_sam', name: 'Sam', fullName: 'Sam Okonkwo', initials: 'SO', isCurrentUser: false, homeCurrency: 'EUR', joinedAt: '2026-08-24T10:04:00', avatarTint: 3 },
  { id: 'm_mia', name: 'Mia', fullName: 'Mia Reyes', initials: 'MR', isCurrentUser: false, homeCurrency: 'EUR', joinedAt: '2026-08-24T10:02:00', avatarTint: 4 },
];

// Ren is NOT seeded as a member — she is added by the user during the demo.
export const REN: Member = {
  id: 'm_ren', name: 'Ren', fullName: 'Ren Okafor', initials: 'RO', isCurrentUser: false, homeCurrency: 'EUR', joinedAt: '', avatarTint: 5,
};

export const TRIP: Trip = {
  id: TRIP_ID,
  name: 'Lisbon Getaway',
  destination: 'Lisbon, Portugal',
  startDate: '2026-08-24',
  endDate: '2026-08-30',
  currency: 'EUR',
  memberIds: ['m_jules', 'm_ari', 'm_nic', 'm_sam', 'm_mia'],
  createdBy: 'm_mia',
  status: 'active',
  // Not a flag: regional-indicator pairs have no glyph on Windows and fall
  // back to bare letters ("PT"), which reads as a rendering bug at hero size.
  // Lisbon's tram is as legible and renders on every platform.
  coverEmoji: '🚋',
};

// Home screen also lists two non-enterable trips.
export const OTHER_TRIPS = [
  { id: 'kyoto-2027', name: 'Kyoto in Spring', destination: 'Kyoto, Japan', startDate: '2027-04-03', endDate: '2027-04-12', memberCount: 4, status: 'upcoming' as const, coverEmoji: '🌸' },
  { id: 'tahoe-2026', name: 'Tahoe Ski Weekend', destination: 'Lake Tahoe, CA', startDate: '2026-02-07', endDate: '2026-02-09', memberCount: 5, status: 'past' as const, coverEmoji: '🎿' },
];

export const EXPENSES: Expense[] = [
  {
    id: 'exp_airbnb', tripId: TRIP_ID, description: 'Airbnb — 6 nights, Alfama',
    payerId: 'm_mia', createdById: 'm_mia', createdAt: '2026-08-24T14:20:00',
    lineItems: [{ id: 'li_airbnb_1', label: 'Accommodation', amount: 30000, includedMemberIds: ['m_jules', 'm_ari', 'm_nic', 'm_sam', 'm_mia'] }],
  },
  {
    id: 'exp_tour', tripId: TRIP_ID, description: 'Sintra day tour',
    payerId: 'm_sam', createdById: 'm_sam', createdAt: '2026-08-28T18:05:00',
    lineItems: [{ id: 'li_tour_1', label: 'Tour tickets', amount: 5000, includedMemberIds: ['m_jules', 'm_ari', 'm_nic', 'm_sam', 'm_mia'] }],
  },
];
// exp_dinner is created by the user during the demo (§6.7).

// A real group's plan for a week in Lisbon, not a skeleton: a reviewer opening
// any day should find something there, and the day strip only earns its place
// if the days behind it are populated. Costs are per-person, in cents.
export const ITINERARY: ItineraryItem[] = [
  // Mon 24 — arrival
  { id: 'itin_land', tripId: TRIP_ID, title: 'Land at LIS', date: '2026-08-24', time: '14:05', location: 'Humberto Delgado Airport, T1', source: 'manual', createdById: 'm_mia', createdAt: '2026-08-10T18:00:00' },
  { id: 'itin_checkin', tripId: TRIP_ID, title: 'Check in to the Airbnb', date: '2026-08-24', time: '16:00', location: 'Rua dos Remédios, Alfama', note: 'Key box code in the group chat', source: 'manual', createdById: 'm_mia', createdAt: '2026-08-10T18:02:00' },
  { id: 'itin_d1_dinner', tripId: TRIP_ID, title: 'First night — Time Out Market', date: '2026-08-24', time: '20:00', location: 'Mercado da Ribeira', source: 'manual', createdById: 'm_jules', createdAt: '2026-08-23T11:20:00', estimatedCostPerPerson: 2200 },

  // Tue 25 — the old city
  { id: 'itin_alfama', tripId: TRIP_ID, title: 'Alfama walking tour', date: '2026-08-25', time: '10:00', location: 'Largo do Chafariz de Dentro', source: 'manual', createdById: 'm_nic', createdAt: '2026-08-22T09:15:00', estimatedCostPerPerson: 1800 },
  { id: 'itin_tram', tripId: TRIP_ID, title: 'Tram 28 to Graça', date: '2026-08-25', time: '15:30', location: 'Martim Moniz stop', note: 'Go early or the queue is brutal', source: 'manual', createdById: 'm_nic', createdAt: '2026-08-22T09:18:00' },
  { id: 'itin_fado', tripId: TRIP_ID, title: 'Fado night', date: '2026-08-25', time: '21:00', location: 'Clube de Fado, São João da Praça', source: 'manual', createdById: 'm_mia', createdAt: '2026-08-24T22:40:00', estimatedCostPerPerson: 3500 },

  // Wed 26 — west side
  { id: 'itin_lx', tripId: TRIP_ID, title: 'LX Factory', date: '2026-08-26', time: '11:00', location: 'Rua Rodrigues de Faria 103', source: 'manual', createdById: 'm_sam', createdAt: '2026-08-25T19:05:00' },
  { id: 'itin_maat', tripId: TRIP_ID, title: 'MAAT museum', date: '2026-08-26', time: '15:00', location: 'Av. Brasília, Belém', source: 'manual', createdById: 'm_jules', createdAt: '2026-08-25T19:12:00', estimatedCostPerPerson: 1100 },
  { id: 'itin_sunset', tripId: TRIP_ID, title: 'Sunset at Senhora do Monte', date: '2026-08-26', time: '19:45', location: 'Miradouro da Senhora do Monte', source: 'manual', createdById: 'm_ari', createdAt: '2026-08-25T19:20:00' },

  // Thu 27 — coast
  { id: 'itin_cascais', tripId: TRIP_ID, title: 'Train to Cascais', date: '2026-08-27', time: '08:45', location: 'Cais do Sodré station', source: 'manual', createdById: 'm_sam', createdAt: '2026-08-26T21:30:00', estimatedCostPerPerson: 480 },
  { id: 'itin_beach', tripId: TRIP_ID, title: 'Beach day — Praia da Rainha', date: '2026-08-27', time: '11:00', location: 'Cascais', source: 'manual', createdById: 'm_sam', createdAt: '2026-08-26T21:32:00' },
  { id: 'itin_seafood', tripId: TRIP_ID, title: 'Seafood dinner in Cascais', date: '2026-08-27', time: '19:30', location: 'Mar do Inferno', source: 'manual', createdById: 'm_nic', createdAt: '2026-08-27T12:10:00', estimatedCostPerPerson: 3000 },

  // Fri 28 — Sintra
  { id: 'itin_sintra', tripId: TRIP_ID, title: 'Sintra day tour', date: '2026-08-28', time: '09:30', location: 'Rossio Station', source: 'manual', createdById: 'm_sam', createdAt: '2026-08-26T20:10:00' },
  { id: 'itin_regaleira', tripId: TRIP_ID, title: 'Quinta da Regaleira', date: '2026-08-28', time: '14:30', location: 'R. Barbosa du Bocage 5, Sintra', source: 'manual', createdById: 'm_jules', createdAt: '2026-08-27T08:05:00', estimatedCostPerPerson: 1200 },
  { id: 'itin_sintra_dinner', tripId: TRIP_ID, title: 'Late dinner back in Lisbon', date: '2026-08-28', time: '21:30', location: 'Bairro Alto', source: 'manual', createdById: 'm_mia', createdAt: '2026-08-28T17:45:00' },

  // Sat 29 — today. Dinner is intentionally absent: the poll fills it.
  { id: 'itin_belem', tripId: TRIP_ID, title: 'Belém & pastéis de nata', date: '2026-08-29', time: '10:30', location: 'Pastéis de Belém, Rua de Belém 84', source: 'manual', createdById: 'm_jules', createdAt: '2026-08-27T21:44:00', estimatedCostPerPerson: 900 },
  { id: 'itin_jeronimos', tripId: TRIP_ID, title: 'Jerónimos Monastery', date: '2026-08-29', time: '12:30', location: 'Praça do Império', source: 'manual', createdById: 'm_nic', createdAt: '2026-08-28T20:02:00', estimatedCostPerPerson: 1000 },
  { id: 'itin_ren', tripId: TRIP_ID, title: 'Ren lands at LIS', date: '2026-08-29', time: '16:10', location: 'Humberto Delgado Airport, T1', source: 'manual', createdById: 'm_ari', createdAt: '2026-08-28T22:15:00' },

  // Sun 30 — out
  { id: 'itin_checkout', tripId: TRIP_ID, title: 'Check out', date: '2026-08-30', time: '09:00', location: 'Rua dos Remédios, Alfama', note: 'Leave keys in the box', source: 'manual', createdById: 'm_mia', createdAt: '2026-08-24T10:28:00' },
  { id: 'itin_home', tripId: TRIP_ID, title: 'Flights home', date: '2026-08-30', time: '11:20', location: 'Humberto Delgado Airport', source: 'manual', createdById: 'm_mia', createdAt: '2026-08-24T10:30:00' },
];

// Directory backing the mocked "+ Add member" search (§6.3)
export const DIRECTORY = [
  { id: 'm_ren', name: 'Ren Okafor', handle: '@ren', initials: 'RO' },
  { id: 'd_theo', name: 'Theo Lindqvist', handle: '@theo', initials: 'TL' },
  { id: 'd_priya', name: 'Priya Raman', handle: '@priya', initials: 'PR' },
  { id: 'd_dani', name: 'Dani Marchetti', handle: '@dani', initials: 'DM' },
];

// Seeded chat feed — exact copy. [YOU] = Ari, rendered right-aligned.
export const SEED_FEED: FeedItem[] = [
  { id: 'f_sys_created', kind: 'system', createdAt: '2026-08-24T10:02:00', event: { type: 'trip_created', actorId: 'm_mia' }, text: 'Mia created the trip' },
  { id: 'f_m1', kind: 'message', authorId: 'm_mia', createdAt: '2026-08-29T09:41:00', text: 'Morning! Last full day ☀️', reactions: [] },
  { id: 'f_m2', kind: 'message', authorId: 'm_nic', createdAt: '2026-08-29T09:44:00', text: 'Still recovering from that tour honestly 😅', reactions: [] },
  { id: 'f_m3', kind: 'message', authorId: 'm_jules', createdAt: '2026-08-29T09:46:00', text: 'Worth every euro. Ramiro tonight?', reactions: [{ emoji: '👍', memberIds: ['m_mia', 'm_sam'] }] },
  { id: 'f_p1', kind: 'ping', authorId: 'm_sam', createdAt: '2026-08-29T10:02:00', ping: 'late10' },
  { id: 'f_m4', kind: 'message', authorId: 'm_sam', createdAt: '2026-08-29T10:14:00', text: 'Made it. Coffee first.', reactions: [] },
  { id: 'f_m5', kind: 'message', authorId: 'm_ari', createdAt: '2026-08-29T10:20:00', text: "Ren lands at 4 — she's joining us for dinner", reactions: [] },
  { id: 'f_m6', kind: 'message', authorId: 'm_mia', createdAt: '2026-08-29T10:22:00', text: 'Amazing. Someone start a poll before this becomes a 40-message thread', reactions: [] },
];

// Poll option seed — pre-filled into the Create Poll sheet (§6.4). Not yet a Poll.
export const POLL_SEED = {
  question: 'Where should we eat tonight?',
  options: [
    { name: 'Cervejaria Ramiro', descriptor: 'seafood, loud & casual' },
    { name: 'A Cevicheria', descriptor: 'Peruvian-Portuguese, trendy' },
    { name: 'Taberna da Rua das Flores', descriptor: 'traditional tavern, intimate' },
  ],
};

// The option Sam adds live during the choreography (§6.5, Phase A t=4200ms).
export const SAM_SUGGESTED_OPTION = { name: 'Time Out Market', descriptor: 'casual, lots of choice' };
