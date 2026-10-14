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
  sleepHours: number | null;
  lifestyle: Lifestyle | null;
  notes: string | null;
  photos: PhotoRef[];
}

export interface ComparisonResponse {
  A: ComparisonDay | null;
  B: ComparisonDay | null;
}
