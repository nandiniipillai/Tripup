'use client';

import { useRouter } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { AvatarStack } from '@/components/common/AvatarStack';
import { formatDateRange } from '@/lib/time';

export function TripHeader() {
  const router = useRouter();
  const trip = useTripStore((s) => s.trip);
  const members = useTripStore((s) => s.members);
  const openSheet = useTripStore((s) => s.openSheet);
  const memberList = trip.memberIds.map((id) => members[id]).filter(Boolean);

  return (
    <header
      className="flex items-center gap-2 px-2 shrink-0"
      style={{ height: 56, background: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}
    >
      <button
        aria-label="Back"
        onClick={() => router.push('/')}
        className="flex items-center justify-center shrink-0"
        style={{ width: 44, height: 44 }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 4L6.5 10L12.5 16" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-headline truncate">{trip.name}</div>
        <div className="text-caption truncate" style={{ color: 'var(--muted-foreground)' }}>
          {formatDateRange(trip.startDate, trip.endDate)} · Lisbon
        </div>
      </div>
      <button
        aria-label="Trip members"
        onClick={() => openSheet('groupInfo')}
        className="flex items-center justify-center pr-2 shrink-0"
        style={{ minWidth: 44, height: 44 }}
      >
        <AvatarStack members={memberList} />
      </button>
    </header>
  );
}
