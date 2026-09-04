'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import type { FeedItem } from '@/lib/types';
import { useTripStore } from '@/lib/store';
import { todayDateStr, formatDayHeader } from '@/lib/time';
import { DayDivider } from './DayDivider';
import { MessageBubble } from './MessageBubble';
import { PingPill } from './PingPill';
import { SystemLine } from './SystemLine';
import { PollCard } from './PollCard';
import { ItineraryPreviewCard } from './ItineraryPreviewCard';
import { EmptyState } from '@/components/common/EmptyState';

export function ChatFeed() {
  const feed = useTripStore((s) => s.feed);
  const members = useTripStore((s) => s.members);
  const polls = useTripStore((s) => s.polls);
  const openSheet = useTripStore((s) => s.openSheet);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const stickToBottom = useRef(true);

  // Land at the true bottom on mount, before paint — `scrollIntoView` on a
  // trailing sentinel was landing a bubble-and-a-half short inside this nested
  // flex scroller, so the feed opened mid-message.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    mounted.current = true;
  }, []);

  // Smooth on every append thereafter (§6.2). The reduced-motion media query
  // in globals.css forces `scroll-behavior: auto`, so this stays honest.
  useEffect(() => {
    if (!mounted.current) return;
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [feed.length]);

  // A live poll card GROWS in place — an option folds in, vote rows appear —
  // without appending a feed item, so a length-keyed effect never fires and
  // the card's footer slides silently under the composer. Stay pinned to the
  // bottom whenever the user is already there, and get out of the way the
  // moment they scroll up to read history.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Stickiness is released by an explicit user gesture, never by a scroll
    // event: a smooth programmatic scroll fires scroll events from far above
    // the bottom, and reading those would cancel the very scroll that emitted
    // them. Re-arm as soon as the user returns to the bottom.
    const onScroll = () => {
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 48) stickToBottom.current = true;
    };
    const onUserScrollUp = (e: WheelEvent) => {
      if (e.deltaY < 0) stickToBottom.current = false;
    };
    const onTouch = () => {
      if (el.scrollHeight - el.scrollTop - el.clientHeight >= 48) stickToBottom.current = false;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('wheel', onUserScrollUp, { passive: true });
    el.addEventListener('touchmove', onTouch, { passive: true });

    const ro = new ResizeObserver(() => {
      if (stickToBottom.current) el.scrollTop = el.scrollHeight;
    });
    for (const child of Array.from(el.children)) ro.observe(child);

    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('wheel', onUserScrollUp);
      el.removeEventListener('touchmove', onTouch);
      ro.disconnect();
    };
  }, [feed.length]);

  if (feed.length === 0) {
    return <EmptyState glyph="💬" title="No messages yet" body="Start the conversation, or put a decision to the group." actionLabel="Create a poll" onAction={() => openSheet('createPoll')} />;
  }

  const today = todayDateStr();

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-3 flex flex-col" style={{ background: 'var(--surface)' }}>
      {feed.map((item, i) => {
        const itemDate = item.createdAt.slice(0, 10);
        const prev = feed[i - 1];
        const next = feed[i + 1];
        const prevDate = prev ? prev.createdAt.slice(0, 10) : null;
        const showDivider = itemDate !== prevDate;

        // §5.2: 12px between distinct feed items, 4px between messages from
        // the same author in a run. A flat `gap-3` gave everything 12px, so a
        // run of messages read as unrelated separate posts.
        const continuesRun =
          !showDivider &&
          item.kind === 'message' &&
          prev?.kind === 'message' &&
          prev.authorId === item.authorId;

        const dividerLabel = itemDate === today ? 'TODAY' : formatDayHeader(itemDate);

        return (
          <div key={item.id} className="flex flex-col" style={{ marginTop: i === 0 ? 0 : continuesRun ? 4 : 12 }}>
            {showDivider && <DayDivider label={dividerLabel} />}
            {renderItem(item, {
              members, polls,
              showAuthorLabel: item.kind === 'message' && !continuesRun,
              showTimestamp: item.kind === 'message' && (!next || next.kind !== 'message' || next.authorId !== item.authorId),
            })}
          </div>
        );
      })}
    </div>
  );
}

function renderItem(
  item: FeedItem,
  ctx: { members: ReturnType<typeof useTripStore.getState>['members']; polls: ReturnType<typeof useTripStore.getState>['polls']; showAuthorLabel: boolean; showTimestamp: boolean },
) {
  switch (item.kind) {
    case 'message':
      return <MessageBubble item={item} author={ctx.members[item.authorId]} showAuthorLabel={ctx.showAuthorLabel} showTimestamp={ctx.showTimestamp} />;
    case 'ping':
      return <PingPill item={item} author={ctx.members[item.authorId]} />;
    case 'system':
      // poll_sent is a confirmation, not ambient history — it gets the same
      // positive-pill language as a settled state, not the muted dash-line
      // every other system event uses.
      return item.event.type === 'poll_sent'
        ? <SystemLine text={item.text} variant="positive" glyph="✓" />
        : <SystemLine text={item.text} />;
    case 'poll': {
      const poll = ctx.polls[item.pollId];
      return poll ? <PollCard poll={poll} /> : null;
    }
    case 'itinerary_preview':
      return <ItineraryPreviewCard itineraryItemId={item.itineraryItemId} />;
    default: {
      const _exhaustive: never = item;
      return _exhaustive;
    }
  }
}
