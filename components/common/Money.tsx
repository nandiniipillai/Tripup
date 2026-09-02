import type { Cents, CurrencyCode } from '@/lib/types';
import { formatCents, formatConverted } from '@/lib/money';

interface MoneyProps {
  value: Cents;
  tripCurrency?: CurrencyCode;
  homeCurrency?: CurrencyCode;
  /** Primary-string size: hero=text-display, body=text-headline,
   *  subhead=text-subhead, caption=text-body. The `≈` estimate is always
   *  text-caption/muted — it must never read as an exact figure (§2.6). */
  size?: 'hero' | 'body' | 'subhead' | 'caption';
  colorClass?: string; // e.g. 'text-[var(--positive)]'
  className?: string;
  /** Force the two-line stacked layout even at body/caption size (used where a
   * narrow trailing column needs amount-over-conversion, e.g. BalanceRow). */
  stack?: boolean;
  align?: 'left' | 'right' | 'center';
}

/**
 * <Money> — renders the trip-currency amount as the primary string and the
 * converted estimate as a secondary string (always prefixed "≈"). §2.6.
 */
export function Money({ value, tripCurrency = 'EUR', homeCurrency = 'USD', size = 'body', colorClass, className, stack, align = 'left' }: MoneyProps) {
  const primary = formatCents(value, tripCurrency);
  const converted = formatConverted(value, tripCurrency, homeCurrency);

  const primarySize =
    size === 'hero' ? 'text-display'
      : size === 'body' ? 'text-headline'
        : size === 'subhead' ? 'text-subhead'
          : 'text-body';

  if (size === 'hero' || stack) {
    return (
      <div className={className} style={{ textAlign: align }}>
        <div className={`${primarySize} money-tabular ${colorClass ?? ''}`}>{primary}</div>
        {converted && <div className="text-caption money-tabular" style={{ color: 'var(--muted-foreground)' }}>{converted}</div>}
      </div>
    );
  }

  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className ?? ''}`}>
      <span className={`${primarySize} money-tabular ${colorClass ?? ''}`}>{primary}</span>
      {converted && <span className="text-caption money-tabular" style={{ color: 'var(--muted-foreground)' }}>{converted}</span>}
    </span>
  );
}
