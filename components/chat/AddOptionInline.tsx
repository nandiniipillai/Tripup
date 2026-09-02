'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { SecondaryButton, DashedAddRow } from '@/components/common/Action';

export function AddOptionInline({ onAdd }: { onAdd: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  if (!open) {
    return <DashedAddRow onClick={() => setOpen(true)}>+ Add an option</DashedAddRow>;
  }

  return (
    <div className="flex items-center gap-2 animate-fold-in">
      <Input
        autoFocus
        placeholder="Name the place"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && name.trim()) {
            onAdd(name.trim());
            setName('');
            setOpen(false);
          }
        }}
        className="flex-1"
      />
      {/* Same treatment as Group Info's "Add" — this was bare 40px accent
          text there and a 32px accent-filled pill here, for the same act. */}
      <SecondaryButton
        onClick={() => {
          if (!name.trim()) return;
          onAdd(name.trim());
          setName('');
          setOpen(false);
        }}
      >
        Add
      </SecondaryButton>
    </div>
  );
}
