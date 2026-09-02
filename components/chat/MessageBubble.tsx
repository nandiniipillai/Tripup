'use client';

import type { TextMessageItem, Member } from '@/lib/types';
import { CURRENT_USER_ID } from '@/lib/seed';
import { useTripStore } from '@/lib/store';

export function MessageBubble({
  item, author, showAuthorLabel, showTimestamp,
}: { item: TextMessageItem; author?: Member; showAuthorLabel: boolean; showTimestamp: boolean }) {
  const toggleReaction = useTripStore((s) => s.toggleReaction);
  const isOwn = item.authorId === CURRENT_USER_ID;
  const reaction = item.reactions.find((r) => r.emoji === '👍');
  const iReacted = !!reaction?.memberIds.includes(CURRENT_USER_ID);
  const time = item.createdAt.slice(11, 16);

  return (
    <div className={`flex flex-col animate-feed-in ${isOwn ? 'items-end' : 'items-start'}`}>
      {showAuthorLabel && !isOwn && (
        <span className="text-subhead px-1 mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{author?.name ?? 'Someone'}</span>
      )}
      <div className="relative" style={{ maxWidth: '76%' }}>
        <button
          role="button"
          aria-label={iReacted ? 'Remove your thumbs up' : 'React with a thumbs up'}
          onClick={() => toggleReaction(item.id)}
          className="text-left px-3 py-2 pressable cursor-pointer"
          style={{
            background: isOwn ? 'var(--accent-tint)' : 'var(--surface-raised)',
            color: 'var(--foreground)',
            border: isOwn ? 'none' : '1px solid var(--border)',
            borderRadius: 18,
            borderBottomRightRadius: isOwn ? 6 : 18,
            borderBottomLeftRadius: isOwn ? 18 : 6,
          }}
        >
          <span className="text-body whitespace-pre-wrap break-words">{item.text}</span>
        </button>
        {reaction && reaction.memberIds.length > 0 && (
          <span
            className="absolute animate-chip-in text-caption inline-flex items-center gap-1 px-1.5"
            style={{
              bottom: -8, [isOwn ? 'left' : 'right']: 8, height: 20, borderRadius: 9999,
              background: 'var(--surface-raised)', border: '1px solid var(--border)',
            }}
          >
            👍 {reaction.memberIds.length}
          </span>
        )}
      </div>
      {showTimestamp && (
        <span className="text-caption px-1 mt-1" style={{ color: 'var(--muted-foreground)' }}>{time}</span>
      )}
    </div>
  );
}
