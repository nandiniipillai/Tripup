'use client';

import { useEffect } from 'react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { TRIP_ID } from '@/lib/seed';
import { TripHeader } from '@/components/nav/TripHeader';
import { TabBar } from '@/components/nav/TabBar';
import { GroupInfoSheet } from '@/components/sheets/GroupInfoSheet';
import { CreatePollSheet } from '@/components/sheets/CreatePollSheet';
import { ClosePollDialog } from '@/components/sheets/ClosePollDialog';
import { TieBreakDialog } from '@/components/sheets/TieBreakDialog';
import { SettleSheet } from '@/components/sheets/SettleSheet';
import { AddItineraryItemSheet } from '@/components/sheets/AddItineraryItemSheet';

const TAB_ROUTES = ['chat', 'itinerary', 'expenses'];

export default function TripLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams<{ tripId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (params.tripId !== TRIP_ID) {
      router.replace('/');
    }
  }, [params.tripId, router]);

  if (params.tripId !== TRIP_ID) {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  const lastSeg = segments[segments.length - 1];
  const isTabRoute = TAB_ROUTES.includes(lastSeg);

  return (
    <>
      {isTabRoute && <TripHeader />}
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
      {isTabRoute && <TabBar />}

      <GroupInfoSheet />
      <CreatePollSheet />
      <ClosePollDialog />
      <TieBreakDialog />
      <SettleSheet />
      <AddItineraryItemSheet />
    </>
  );
}
