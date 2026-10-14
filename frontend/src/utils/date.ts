/** 로컬 시간 기준 yyyy-MM-dd (toISOString은 UTC라 새벽에 날짜가 어긋난다) */
export function toDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const today = () => toDateString();

export function addDays(dateString: string, days: number): string {
  const d = new Date(`${dateString}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toDateString(d);
}

/** 2026-10-14 → 10월 14일 (화) */
export function formatKoreanDate(dateString: string): string {
  const d = new Date(`${dateString}T00:00:00`);
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

export const isValidDateString = (value: string | undefined): value is string =>
  !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
