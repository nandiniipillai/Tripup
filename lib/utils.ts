import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Joins names with a real Oxford-comma list ("A", "A and B", "A, B, and C") —
 * not a chain of "and"s, which used to render as literal
 * "Cervejaria Ramiro and A Cevicheria and Time Out Market" for 3+ items.
 */
export function joinNames(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

/** Capitalizes the first character — for sentences that may start with "you". */
export function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

/** "both" only ever fits exactly two items; 3+ need "all"/"each" instead. */
export function bothAllEach(count: number): 'both' | 'all' {
  return count === 2 ? 'both' : 'all';
}
