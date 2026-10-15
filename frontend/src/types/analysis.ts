import type { BodyPart, Lifestyle, PhotoRef, SkinCondition, SkinSign, SymptomKey } from './record';

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

export interface AnalysisSummary {
  period: { startDate: string; endDate: string };
  recordCount: number;
  availableForComparison: boolean;
  insights: { type: string; message: string }[];
}

export interface ComparisonDay {
  date: string;
  recordId: number;
  skinConditions: SkinCondition[];
  /** 고통 지수 0~10 (0도 기록한 값). 기록하지 않았으면 null */
  painIndex: number | null;
  sleepHours: number | null;
  /** 수면 점수 1~5. 수면 시간이 없으면 null */
  sleepScore: number | null;
  /** 약 복용 여부. 기록하지 않았으면 null */
  medication: boolean | null;
  /** 나타난 증상. 없으면 빈 배열 */
  skinSigns: SkinSign[];
  lifestyle: Lifestyle | null;
  notes: string | null;
  photos: PhotoRef[];
}

export interface ComparisonResponse {
  A: ComparisonDay | null;
  B: ComparisonDay | null;
}
