import type { ClinicVisit } from '@/types/visit';

export interface VisitCycle {
  /** 오늘 이전의 가장 최근 재진. 없으면 null */
  lastVisit: string | null;
  /** 오늘을 포함해 가장 가까운 앞으로의 재진. 없으면 null */
  nextVisit: string | null;
}

/**
 * 지난 재진과 다음 재진. 오늘이 재진 날이면 오늘이 다음 재진(D-day)이 되고,
 * 그 전 재진부터 오늘까지가 이번 주기다.
 */
export function visitCycle(visits: ClinicVisit[], todayString: string): VisitCycle {
  const dates = visits.map((v) => v.visitDate).sort();
  return {
    lastVisit: dates.filter((d) => d < todayString).at(-1) ?? null,
    nextVisit: dates.find((d) => d >= todayString) ?? null,
  };
}

/** 지난 재진 주기 목록(최근 순). 이미 다녀온 재진 두 날짜 사이를 하나의 주기로 본다 */
export function pastCycles(visits: ClinicVisit[], todayString: string) {
  const dates = visits.map((v) => v.visitDate).filter((d) => d <= todayString).sort();
  return dates
    .slice(1)
    .map((endDate, i) => ({ startDate: dates[i], endDate }))
    .reverse();
}

/** 오늘부터 그날까지 남은 날 수 (오늘이면 0) */
export function daysUntil(dateString: string, todayString: string) {
  const ms = new Date(`${dateString}T00:00:00`).getTime() - new Date(`${todayString}T00:00:00`).getTime();
  return Math.round(ms / 86_400_000);
}

/** D-10, D-day */
export const dDayLabel = (days: number) => (days === 0 ? 'D-day' : `D-${days}`);
