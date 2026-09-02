'use client';

import { useRouter, useParams } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { CURRENT_USER_ID } from '@/lib/seed';

// Itinerary leads: it is the trip's landing tab, and platform convention puts
// the default destination leftmost.
const TABS: { key: 'chat' | 'itinerary' | 'expenses'; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    key: 'itinerary', label: 'Itinerary', icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3.5" y="4" width="15" height="14" rx="2" stroke={active ? 'var(--foreground)' : 'var(--muted-foreground)'} strokeWidth="1.6" />
        <path d="M3.5 8.5H18.5" stroke={active ? 'var(--foreground)' : 'var(--muted-foreground)'} strokeWidth="1.6" />
        <path d="M7 2.5V5.5M15 2.5V5.5" stroke={active ? 'var(--foreground)' : 'var(--muted-foreground)'} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'chat', label: 'Chat', icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 4.5C3 3.67 3.67 3 4.5 3H17.5C18.33 3 19 3.67 19 4.5V13.5C19 14.33 18.33 15 17.5 15H8L4 18.5V15H4.5C3.67 15 3 14.33 3 13.5V4.5Z"
          stroke={active ? 'var(--foreground)' : 'var(--muted-foreground)'} strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'expenses', label: 'Expenses', icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="7.5" stroke={active ? 'var(--foreground)' : 'var(--muted-foreground)'} strokeWidth="1.6" />
        <path d="M11 7V15M13.2 8.8C13.2 7.8 12.2 7 11 7C9.6 7 8.8 7.8 8.8 8.7C8.8 11 13.2 9.9 13.2 12.2C13.2 13.2 12.2 14 11 14C9.8 14 8.8 13.2 8.8 12.2"
          stroke={active ? 'var(--foreground)' : 'var(--muted-foreground)'} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function TabBar() {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const activeTab = useTripStore((s) => s.ui.activeTab);
  const itineraryHasUpdate = useTripStore((s) => s.ui.itineraryHasUpdate);
  const expensesHasUpdate = useTripStore((s) => s.ui.expensesHasUpdate);
  const setActiveTab = useTripStore((s) => s.setActiveTab);

  // Chat now badges too. It used to be the landing tab, so an open poll was
  // impossible to miss; landing on Itinerary instead means a poll waiting on
  // your vote needs to announce itself from another tab.
  const polls = useTripStore((s) => s.polls);
  const pollNeedsMe = Object.values(polls).some((p) => p.status === 'open' && !p.votes[CURRENT_USER_ID]);

  const badges: Record<string, boolean> = { chat: pollNeedsMe, itinerary: itineraryHasUpdate, expenses: expensesHasUpdate };

  return (
    <nav
      role="tablist"
      className="flex shrink-0"
      // §7: 56px of content PLUS 34px of safe area. This was `height: 56` with
      // `paddingBottom: 20` under border-box sizing, which left a 35px content
      // box for ~40px of icon + label.
      style={{ minHeight: 56, paddingBottom: 34, background: 'var(--surface-raised)', borderTop: '1px solid var(--border)' }}
    >
      {TABS.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active}
            aria-label={badges[tab.key] ? `${tab.label}, 1 update` : tab.label}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative press-surface"
            style={{ minHeight: 56 }}
            onClick={() => {
              setActiveTab(tab.key);
              router.replace(`/trip/${params.tripId}/${tab.key}`);
            }}
          >
            <span className="relative">
              {tab.icon(active)}
              {badges[tab.key] && (
                <span
                  className="absolute rounded-full"
                  style={{ width: 8, height: 8, top: -2, right: -4, background: 'var(--accent)' }}
                />
              )}
            </span>
            <span className="text-caption" style={{ color: active ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: active ? 600 : 400 }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
