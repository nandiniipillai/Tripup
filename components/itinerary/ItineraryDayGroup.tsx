import type { ItineraryItem } from '@/lib/types';
import { formatDayHeader, todayDateStr } from '@/lib/time';
import { ItineraryItemCard } from './ItineraryItemCard';

export function ItineraryDayGroup({ date, items }: { date: string; items: ItineraryItem[] }) {
  const isPast = date < todayDateStr();
  return (
    <div>
      <div className="sticky top-0 py-2 px-4 text-micro" style={{ background: 'var(--surface)', color: 'var(--muted-foreground)' }}>
        {formatDayHeader(date)}
      </div>
      <div className="px-4">
        {items.map((item) => (
          <ItineraryItemCard key={item.id} item={item} pastDay={isPast} />
        ))}
      </div>
    </div>
  );
}
