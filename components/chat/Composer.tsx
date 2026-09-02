'use client';

import { useState } from 'react';
import { useTripStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { QuickStatusPopover } from './QuickStatusPopover';

export function Composer() {
  const [text, setText] = useState('');
  const sendMessage = useTripStore((s) => s.sendMessage);
  const openSheet = useTripStore((s) => s.openSheet);

  const canSend = !!text.trim();

  const submit = () => {
    if (!canSend) return;
    sendMessage(text);
    setText('');
  };

  return (
    <div
      className="flex items-center gap-1 px-2 shrink-0"
      // 8px all round. The safe-area inset belongs to the TabBar directly
      // beneath this, so the extra 20px the composer used to add on the bottom
      // was a second, doubled safe area — a band of dead white above the tabs.
      style={{ paddingTop: 8, paddingBottom: 8, background: 'var(--surface-raised)', borderTop: '1px solid var(--border)' }}
    >
      <QuickStatusPopover />

      {/* One input treatment app-wide; the composer takes the pill variant
          (§6.2 — --radius-full on --surface), not its own hand-rolled field. */}
      <Input
        variant="pill"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        placeholder="Message the group"
        aria-label="Message the group"
        className="flex-1 min-w-0 px-4"
      />

      {/* Ghost, per §6.2 — the poll icon and the send button were identical
          44px filled accent circles, so neither read as the primary act. The
          solid accent circle is reserved for send. */}
      <button
        aria-label="Create a poll"
        onClick={() => openSheet('createPoll')}
        className="flex items-center justify-center shrink-0 pressable"
        style={{ width: 44, height: 44, borderRadius: 9999, background: 'transparent' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          {/* checklist / ballot glyph — reads unambiguously as "poll", not signal bars */}
          <circle cx="4" cy="5.5" r="1.4" fill="var(--foreground)" />
          <rect x="7.5" y="4.3" width="9" height="2.4" rx="1.2" fill="var(--foreground)" />
          <circle cx="4" cy="10" r="1.4" fill="var(--foreground)" />
          <rect x="7.5" y="8.8" width="9" height="2.4" rx="1.2" fill="var(--foreground)" />
          <path d="M2.7 14.5L3.7 15.5L5.4 13.4" stroke="var(--foreground)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="7.5" y="13.3" width="9" height="2.4" rx="1.2" fill="var(--foreground)" />
        </svg>
      </button>

      {canSend && (
        <button
          aria-label="Send message"
          onClick={submit}
          className="flex items-center justify-center shrink-0 press-accent animate-send-in"
          style={{ width: 44, height: 44, borderRadius: 9999, background: 'var(--accent)' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 15L15 3M15 3H6M15 3V12" stroke="var(--accent-foreground)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
