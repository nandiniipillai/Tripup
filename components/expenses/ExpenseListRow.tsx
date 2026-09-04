import type { Expense, Member } from '@/lib/types';
import { expenseTotal } from '@/lib/types';
import { formatDayMonth } from '@/lib/time';
import { Money } from '@/components/common/Money';

const KEYWORD_GLYPHS: [RegExp, string][] = [
  [/airbnb|hotel|stay|accommodation/i, '🏠'],
  [/tour|bus|transport|taxi|flight/i, '🚌'],
  [/dinner|lunch|breakfast|food|restaurant/i, '🍽'],
];

function glyphFor(description: string): string {
  for (const [re, glyph] of KEYWORD_GLYPHS) {
    if (re.test(description)) return glyph;
  }
  return '🧾';
}

// Tappable — was a plain, non-interactive <div> styled identically to every
// other (genuinely tappable) row in the app, a false affordance made worse by
// there being nothing to tap through to: no way to check which line items
// included/excluded whom one screen after logging them.
export function ExpenseListRow({ expense, payer, onClick }: { expense: Expense; payer?: Member; onClick?: () => void }) {
  const total = expenseTotal(expense);
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 text-left press-surface" style={{ height: 64 }}>
      <div className="flex items-center justify-center shrink-0" style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--surface)', fontSize: 18 }}>
        {glyphFor(expense.description)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-body truncate">{expense.description}</div>
        <div className="text-caption" style={{ color: 'var(--muted-foreground)' }}>
          {payer?.name ?? 'Someone'} paid · {formatDayMonth(expense.createdAt.slice(0, 10))}
        </div>
      </div>
      <Money value={total} size="body" stack align="right" />
    </button>
  );
}
