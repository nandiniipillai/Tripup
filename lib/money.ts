// lib/money.ts — cents math, split, rounding, formatting. Never store floats.

import type { Cents, CurrencyCode, MemberId } from './types';

export const FX: Record<CurrencyCode, number> = { EUR: 1, USD: 1.0814, GBP: 0.8412 };
export const HOME_CURRENCY_UNAVAILABLE = false; // flip to true to exercise EXP-EDGE-03

export const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
};

/** Parses a decimal string like "140.00" or "45" into integer cents. Returns 0 for invalid input. */
export function parseAmountToCents(input: string): Cents {
  const cleaned = input.replace(/[^0-9.]/g, '');
  if (!cleaned) return 0;
  const value = parseFloat(cleaned);
  if (Number.isNaN(value)) return 0;
  return Math.round(value * 100);
}

/** Formats integer cents as "€185.00" (no conversion). */
export function formatCents(cents: Cents, currency: CurrencyCode = 'EUR'): string {
  const symbol = CURRENCY_SYMBOL[currency];
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = (abs % 100).toString().padStart(2, '0');
  return `${sign}${symbol}${whole.toLocaleString('en-US')}.${frac}`;
}

/** Converts trip-currency cents into a member's home currency, formatted as "≈ $46.50". */
export function formatConverted(cents: Cents, tripCurrency: CurrencyCode, homeCurrency: CurrencyCode): string | null {
  if (HOME_CURRENCY_UNAVAILABLE) return null; // EXP-EDGE-03
  if (homeCurrency === tripCurrency) return null;
  const tripToEur = cents / FX[tripCurrency];
  const converted = Math.round(tripToEur * FX[homeCurrency]);
  return `≈ ${formatCents(converted, homeCurrency)}`;
}

/**
 * splitEvenly — EXP-EDGE-02: base = floor(amount/n), remainder distributed one cent
 * at a time, starting with the payer if included, then following memberOrder.
 */
export function splitEvenly(
  amount: Cents,
  memberIds: MemberId[],
  payerId: MemberId,
  memberOrder: MemberId[],
): Record<MemberId, Cents> {
  const n = memberIds.length;
  const result: Record<MemberId, Cents> = {};
  if (n === 0) return result;
  const base = Math.floor(amount / n);
  let remainder = amount - base * n;
  for (const id of memberIds) result[id] = base;

  const included = new Set(memberIds);
  const distributionOrder: MemberId[] = [];
  if (included.has(payerId)) distributionOrder.push(payerId);
  for (const id of memberOrder) {
    if (included.has(id) && id !== payerId) distributionOrder.push(id);
  }
  for (let i = 0; i < distributionOrder.length && remainder > 0; i++) {
    result[distributionOrder[i]] += 1;
    remainder -= 1;
  }
  return result;
}
