import type { BodyPart, SkinCondition } from '@/types/record';
import { BODY_MAP_PARTS, SCORE_MAX } from '@/utils/constants';
import { bodyPartScore } from '@/utils/recordScore';

export type BodyMapScores = Partial<Record<BodyPart, number>>;

/** 예전 부위를 마네킹 부위로 옮겨 칠할 때 쓰는 대응표 */
const LEGACY_PART_MAP: Partial<Record<BodyPart, BodyPart[]>> = {
  CHEST: ['TRUNK'],
  BACK: ['TRUNK'],
  ABDOMEN: ['TRUNK'],
  ARM: ['UPPER_ARM', 'FOREARM'],
  HAND: ['FOREARM'],
  LEG: ['THIGH', 'LOWER_LEG'],
  FOOT: ['LOWER_LEG'],
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

/** 기록 안 한 부위 색 */
export const BODY_MAP_EMPTY_COLOR = '#e5e7eb';

/** 고통 점수 색: 0점은 아주 연한 분홍, 10점은 진한 빨강 — 점수가 높을수록 붉어진다 */
export function painColor(score: number): string {
  const t = Math.min(Math.max(score / SCORE_MAX, 0), 1);
  const saturation = 70 + t * 15;
  const lightness = 93 - t * 52;
  return `hsl(0 ${saturation}% ${lightness}%)`;
}
