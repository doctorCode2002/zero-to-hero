
import { nanoid } from 'nanoid';

export const id = () => nanoid(10);

export function nowISO() {
  return new Date().toISOString();
}

export function dateKey(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function minutesBetween(startISO: string, endISO: string) {
  const s = new Date(startISO).getTime();
  const e = new Date(endISO).getTime();
  return Math.max(0, Math.round((e - s) / 60000));
}

export function formatCurrency(n: number, currency = 'ILS') {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(n);
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function calculateSessionCost(session: { checkInAt: string; checkOutAt?: string }, hourlyRate: number) {
  if (!session.checkOutAt) return 0;
  const mins = minutesBetween(session.checkInAt, session.checkOutAt);
  return round2((mins / 60) * hourlyRate);
}

/**
 * Checks if a target date string (ISO or YYYY-MM-DD) is between start and end dates inclusive.
 */
export function isDateInRange(target: string, start?: string, end?: string): boolean {
  if (!start && !end) return true;
  
  // Normalize target to start of day for simple date comparison if it's YYYY-MM-DD
  const targetTime = new Date(target).getTime();
  
  if (start) {
    const startTime = new Date(start).setHours(0, 0, 0, 0);
    if (targetTime < startTime) return false;
  }
  
  if (end) {
    const endTime = new Date(end).setHours(23, 59, 59, 999);
    if (targetTime > endTime) return false;
  }
  
  return true;
}
