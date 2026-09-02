'use client';

import { useEffect } from 'react';
import { useTripStore } from '@/lib/store';
import { ChatFeed } from '@/components/chat/ChatFeed';
import { Composer } from '@/components/chat/Composer';

export default function ChatPage() {
  const setActiveTab = useTripStore((s) => s.setActiveTab);

  useEffect(() => {
    setActiveTab('chat');
  }, [setActiveTab]);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ChatFeed />
      <Composer />
    </div>
  );
}
