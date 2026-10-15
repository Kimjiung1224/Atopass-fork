import type { BodyPart, Lifestyle, PhotoRef, SkinCondition, SymptomKey } from './record';

export interface TrendParams {
  startDate: string;
  endDate: string;
  bodyPart: BodyPart;
  symptom: SymptomKey;
}

export interface TrendPoint {
  date: string;
  score: number;
  recordId: number;
}

export interface TrendResponse {
  points: TrendPoint[];
}

/** SYMPTOM_CHANGE(부위·증상 점수 변화) 또는 PAIN_INDEX_CHANGE(고통 지수 변화) */
export type InsightType = 'SYMPTOM_CHANGE' | 'PAIN_INDEX_CHANGE';

export interface Insight {
  type: InsightType;
  message: string;
  /** 고통 지수 변화(PAIN_INDEX_CHANGE)이면 null */
  bodyPart: BodyPart | null;
  /** 고통 지수 변화(PAIN_INDEX_CHANGE)이면 null */
  symptom: SymptomKey | null;
  /** 평균보다 높게(HIGH) 또는 낮게(LOW) 기록된 구간 */
  direction?: 'HIGH' | 'LOW';
  startDate?: string;
  endDate?: string;
}

export interface AnalysisSummary {
  period: { startDate: string; endDate: string };
  recordCount: number;
  availableForComparison: boolean;
  insights: Insight[];
}

export interface ComparisonDay {
  date: string;
  recordId: number;
  skinConditions: SkinCondition[];
  sleepHours: number | null;
  lifestyle: Lifestyle | null;
  notes: string | null;
  photos: PhotoRef[];
}

export interface ComparisonResponse {
  A: ComparisonDay | null;
  B: ComparisonDay | null;
}
