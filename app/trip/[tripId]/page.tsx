'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function TripIndexPage() {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();

  useEffect(() => {
    // Itinerary, not Chat: opening a trip should answer "what's the plan?"
    // before "what did people say?". Chat stays one tap away in the tab bar.
    router.replace(`/trip/${params.tripId}/itinerary`);
  }, [router, params.tripId]);

  return null;
}
