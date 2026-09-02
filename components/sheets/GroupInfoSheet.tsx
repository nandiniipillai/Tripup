'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useTripStore } from '@/lib/store';
import { CURRENT_USER_ID, DIRECTORY } from '@/lib/seed';
import { Avatar } from '@/components/common/Avatar';
import { SecondaryButton, QuietButton } from '@/components/common/Action';

export function GroupInfoSheet() {
  const openSheet = useTripStore((s) => s.ui.openSheet);
  const closeSheet = useTripStore((s) => s.closeSheet);
  const trip = useTripStore((s) => s.trip);
  const members = useTripStore((s) => s.members);
  const addMember = useTripStore((s) => s.addMember);

  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const open = openSheet === 'groupInfo';
  const memberList = trip.memberIds.map((id) => members[id]).filter(Boolean);

  const results = query.trim()
    ? DIRECTORY.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()) || d.handle.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) { closeSheet(); setSearching(false); setQuery(''); } }}>
      {/* max-height, not a fixed 72% — six member rows plus the add row is
          ~400px, so the fixed height opened a ~330px void beneath them. */}
      <SheetContent
        showCloseButton={false}
        side="bottom"
        className="p-0 gap-0 flex flex-col"
        style={{ maxHeight: '88%', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)' }}
      >
        <div className="mx-auto mt-2 shrink-0" style={{ width: 36, height: 4, borderRadius: 9999, background: 'var(--border-strong)' }} />
        <SheetHeader className="flex-row items-start justify-between px-4 pt-3 pb-3 space-y-0 shrink-0">
          <div className="min-w-0">
            <p className="text-caption truncate" style={{ color: 'var(--muted-foreground)' }}>{trip.name}</p>
            <SheetTitle className="text-title text-left">Trip members</SheetTitle>
            <p className="text-caption" style={{ color: 'var(--muted-foreground)' }}>{memberList.length} people · anyone can add someone</p>
          </div>
          <QuietButton onClick={closeSheet}>Done</QuietButton>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
          {memberList.map((m, i) => (
            <div
              key={m.id}
              className="flex items-center gap-3 animate-feed-in"
              style={{ height: 56, borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}
            >
              <Avatar member={m} size={40} />
              <span className="text-body flex-1 min-w-0 truncate">{m.name}</span>
              <span className="text-caption shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                {m.id === CURRENT_USER_ID ? 'You' : m.id === 'm_ren' ? 'Added by Ari' : ''}
              </span>
            </div>
          ))}

          {!searching ? (
            <button
              onClick={() => setSearching(true)}
              className="w-full flex items-center gap-3 mt-2 press-surface"
              style={{ height: 56, borderRadius: 'var(--radius-md)', marginInline: -8, paddingInline: 8, width: 'calc(100% + 16px)' }}
            >
              <div className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, border: '1px dashed var(--border-strong)' }}>
                <span style={{ fontSize: 18, color: 'var(--muted-foreground)' }}>+</span>
              </div>
              <span className="text-body" style={{ color: 'var(--accent)' }}>Add member</span>
            </button>
          ) : (
            <div className="mt-3 pb-6">
              <Input autoFocus placeholder="Search by name" value={query} onChange={(e) => setQuery(e.target.value)} />
              <div className="mt-2 flex flex-col gap-1">
                {query.trim() && results.length === 0 && (
                  <p className="text-caption text-center py-4" style={{ color: 'var(--muted-foreground)' }}>No one found by that name.</p>
                )}
                {results.map((r) => {
                  const already = trip.memberIds.includes(r.id);
                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 px-1"
                      style={{ height: 56, opacity: already ? 0.45 : 1 }}
                    >
                      <div
                        className="rounded-full flex items-center justify-center shrink-0 text-subhead font-semibold"
                        style={{ width: 36, height: 36, background: 'var(--surface)', color: 'var(--foreground)' }}
                      >
                        {r.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-body truncate">{r.name}</div>
                        <div className="text-caption truncate" style={{ color: 'var(--muted-foreground)' }}>{r.handle}</div>
                      </div>
                      {already ? (
                        <span className="text-caption shrink-0" style={{ color: 'var(--muted-foreground)' }}>Already in this trip</span>
                      ) : (
                        // Same SecondaryButton the poll card's "Add option"
                        // uses — one treatment for one action type, and a 44px
                        // hit box behind the 32px pill.
                        <SecondaryButton
                          onClick={() => {
                            addMember({ id: r.id, name: r.name, handle: r.handle, initials: r.initials });
                            setQuery('');
                          }}
                        >
                          Add
                        </SecondaryButton>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
