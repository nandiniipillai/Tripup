import { formatCents, formatConverted } from '@/lib/money';

export function BalanceHero({ net }: { net: number }) {
  if (net === 0) {
    return (
      <div>
        <div className="text-subhead mb-1" style={{ color: 'var(--muted-foreground)' }}>Your position</div>
        <div className="text-display">You&apos;re all square</div>
      </div>
    );
  }
  const owed = net > 0;
  const converted = formatConverted(Math.abs(net), 'EUR', 'USD');
  return (
    <div>
      <div className="text-subhead mb-1" style={{ color: 'var(--muted-foreground)' }}>Your position</div>
      <div className="text-display money-tabular" style={{ color: owed ? 'var(--positive)' : 'var(--negative)' }}>
        {owed ? `You're owed ${formatCents(net)}` : `You owe ${formatCents(-net)}`}
      </div>
      {converted && <div className="text-caption mt-1" style={{ color: 'var(--muted-foreground)' }}>{converted}</div>}
    </div>
  );
}
