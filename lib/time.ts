// lib/time.ts — fixed clock so the prototype looks identical whenever it's opened.

export const NOW = '2026-08-29T21:35:00';

// Parsed as UTC explicitly (note the appended 'Z'). Without it, `new Date(...)`
// treats a timezone-less ISO string as the *viewer's local time*, so
// `.toISOString()` below would silently shift every generated timestamp by
// the browser's UTC offset — e.g. a viewer in IST (UTC+5:30) would see
// "21:35" become "16:05" once round-tripped. Forcing UTC keeps the fixed
// clock's wall-clock time identical for every viewer, regardless of timezone.
const NOW_MS = new Date(`${NOW}Z`).getTime();

/** Returns an ISO timestamp (UTC wall-clock, no trailing Z) offset from the fixed NOW by n minutes. */
export function nowPlusMinutes(n: number): string {
  return new Date(NOW_MS + n * 60_000).toISOString().slice(0, 19);
}

export function isSameDay(iso: string, dateStr: string): boolean {
  return iso.slice(0, 10) === dateStr;
}

export function todayDateStr(): string {
  return NOW.slice(0, 10);
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseDateStr(dateStr: string): Date {
  // dateStr is 'YYYY-MM-DD'; parse as UTC to avoid TZ drift affecting the day-of-week.
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** '29 Aug' */
export function formatDayMonth(dateStr: string): string {
  const d = parseDateStr(dateStr);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** 'SAT 29 AUG' */
export function formatDayHeader(dateStr: string): string {
  const d = parseDateStr(dateStr);
  return `${WEEKDAYS[d.getUTCDay()].toUpperCase()} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].toUpperCase()}`;
}

/** 'Sat 29 Aug' */
export function formatDayHeaderTitleCase(dateStr: string): string {
  const d = parseDateStr(dateStr);
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** 'Sat' — weekday alone, for the Itinerary day strip. */
export function formatWeekdayShort(dateStr: string): string {
  return WEEKDAYS[parseDateStr(dateStr).getUTCDay()];
}

/** Day-of-month alone ('29'), for the Itinerary day strip. */
export function dayOfMonth(dateStr: string): number {
  return parseDateStr(dateStr).getUTCDate();
}

/** Every date from start to end inclusive, as 'YYYY-MM-DD'. Drives the day strip. */
export function enumerateDays(startStr: string, endStr: string): string[] {
  const out: string[] = [];
  const end = parseDateStr(endStr).getTime();
  for (let t = parseDateStr(startStr).getTime(); t <= end; t += 86_400_000) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

/** 1-based trip day for a date ('Day 6 of 7'), clamped to the trip's span. */
export function tripDayNumber(dateStr: string, startStr: string, endStr: string): number {
  const total = enumerateDays(startStr, endStr).length;
  const n = Math.round((parseDateStr(dateStr).getTime() - parseDateStr(startStr).getTime()) / 86_400_000) + 1;
  return Math.min(Math.max(n, 1), total);
}

/** Date-range formatting per spec §6.1: same-month -> '24–30 Aug'; cross-month -> '28 Feb – 3 Mar'. */
export function formatDateRange(startStr: string, endStr: string): string {
  const start = parseDateStr(startStr);
  const end = parseDateStr(endStr);
  if (start.getUTCMonth() === end.getUTCMonth()) {
    return `${start.getUTCDate()}–${end.getUTCDate()} ${MONTHS[end.getUTCMonth()]}`;
  }
  return `${start.getUTCDate()} ${MONTHS[start.getUTCMonth()]} – ${end.getUTCDate()} ${MONTHS[end.getUTCMonth()]}`;
}

/** 'HH:MM' -> 24h passthrough (already stored 24h, sorts lexically). */
export function formatTime(time: string): string {
  return time;
}

export function monthsBetween(fromIso: string, toDateStr: string): number {
  const from = new Date(fromIso);
  const to = parseDateStr(toDateStr);
  return (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
}

export { MONTHS_LONG };
