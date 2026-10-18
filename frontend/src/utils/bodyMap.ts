import type { BodyPart, SkinCondition } from '@/types/record';
import { BODY_MAP_PARTS, SCORE_MAX } from '@/utils/constants';
import { bodyPartScore } from '@/utils/recordScore';

export type BodyMapScores = Partial<Record<BodyPart, number>>;

/** 예전 부위를 마네킹 부위로 옮겨 칠할 때 쓰는 대응표 */
const LEGACY_PART_MAP: Partial<Record<BodyPart, BodyPart[]>> = {
  CHEST: ['TRUNK'],
  BACK: ['TRUNK'],
  ABDOMEN: ['TRUNK'],
  ARM: ['RIGHT_UPPER_ARM', 'RIGHT_FOREARM', 'LEFT_UPPER_ARM', 'LEFT_FOREARM'],
  HAND: ['RIGHT_FOREARM', 'LEFT_FOREARM'],
  LEG: ['RIGHT_THIGH', 'RIGHT_LOWER_LEG', 'LEFT_THIGH', 'LEFT_LOWER_LEG'],
  FOOT: ['RIGHT_LOWER_LEG', 'LEFT_LOWER_LEG'],
};

export const isBodyMapPart = (part: BodyPart) => BODY_MAP_PARTS.includes(part);

/**
 * 마네킹 부위별 고통 점수. 부위에 증상이 여러 개 기록돼 있으면(예전 기록) 평균을 쓴다.
 * withLegacy면 예전 부위(팔·다리 등)도 대응하는 마네킹 부위에 칠한다 — 한 부위에 겹치면 높은 점수.
 */
export function bodyMapScores(skinConditions: SkinCondition[], { withLegacy = false } = {}): BodyMapScores {
  const scores: BodyMapScores = {};
  for (const condition of skinConditions) {
    const score = bodyPartScore(condition);
    if (score === null) continue;
    const targets = isBodyMapPart(condition.bodyPart)
      ? [condition.bodyPart]
      : withLegacy
        ? (LEGACY_PART_MAP[condition.bodyPart] ?? [])
        : [];
    for (const part of targets) scores[part] = Math.max(scores[part] ?? 0, score);
  }
  return scores;
}

/** 기록 안 한 부위와 0점 부위 색 — 고통이 없으면 색을 칠하지 않는다 */
export const BODY_MAP_EMPTY_COLOR = '#e5e7eb';

/** 고통 점수 색: 1점은 아주 연한 분홍, 10점은 진한 빨강 — 점수가 높을수록 붉어진다. 0점·기록 없음은 무색 */
export function painColor(score: number | undefined): string {
  if (score === undefined || score <= 0) return BODY_MAP_EMPTY_COLOR;
  const t = Math.min((score - 1) / (SCORE_MAX - 1), 1);
  const saturation = 80 + t * 5;
  const lightness = 88 - t * 47;
  return `hsl(0 ${saturation}% ${lightness}%)`;
}
