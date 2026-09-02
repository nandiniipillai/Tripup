'use client';

import { useRouter, useParams } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { formatDayHeaderTitleCase } from '@/lib/time';

export function ItineraryPreviewCard({ itineraryItemId }: { itineraryItemId: string }) {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const item = useTripStore((s) => s.itinerary.find((i) => i.id === itineraryItemId));
  const setActiveTab = useTripStore((s) => s.setActiveTab);
  const flashItineraryItem = useTripStore((s) => s.flashItineraryItem);

  if (!item) return null;

  return (
    <button
      onClick={() => {
        setActiveTab('itinerary');
        flashItineraryItem(item.id);
        router.replace(`/trip/${params.tripId}/itinerary`);
      }}
      className="w-full text-left animate-feed-in pressable"
      // Border, not border + --shadow-card (§5.7).
      style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface-raised)', padding: 12 }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-body font-semibold min-w-0 truncate">📍 {item.time} · {item.title}</span>
        <span className="text-subhead shrink-0" style={{ color: 'var(--accent)' }}>View →</span>
      </div>
      <div className="text-caption mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
        Added to your itinerary · {formatDayHeaderTitleCase(item.date)}
      </div>
    </button>
  );
}
