import type { ApiSuccess } from '@/types/api';
import type { AnalysisSummary, ComparisonResponse, TrendParams, TrendResponse } from '@/types/analysis';
import { client, unwrap } from './client';

export const analysisApi = {
  getTrends: (params: TrendParams) =>
    client.get<ApiSuccess<TrendResponse>>('/analysis/trends', { params }).then(unwrap),

  getSummary: (params: { startDate: string; endDate: string }) =>
    client.get<ApiSuccess<AnalysisSummary>>('/analysis/summary', { params }).then(unwrap),

  getComparison: (params: { dateA: string; dateB: string }) =>
    client.get<ApiSuccess<ComparisonResponse>>('/analysis/comparison', { params }).then(unwrap),
};
