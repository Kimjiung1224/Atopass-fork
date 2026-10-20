import { toDateString } from './date';

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 해당 달의 1일 ~ 말일 (yyyy-MM-dd) */
export function monthRange(year: number, month: number) {
  return { startDate: toDateString(new Date(year, month, 1)), endDate: toDateString(new Date(year, month + 1, 0)) };
}

/** 달력 칸: 앞쪽 빈칸(null) + 1일부터 말일까지 */
export function monthCells(year: number, month: number): (string | null)[] {
  const blanks = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  return [
    ...Array<null>(blanks).fill(null),
    ...Array.from({ length: days }, (_, i) => toDateString(new Date(year, month, i + 1))),
  ];
}
