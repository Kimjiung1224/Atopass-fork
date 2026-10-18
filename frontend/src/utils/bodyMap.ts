import type { BodyPart, SkinCondition, SkinSign } from '@/types/record';
import { BODY_MAP_PARTS, SCORE_MAX, SKIN_SIGN_LABELS } from '@/utils/constants';
import { bodyPartScore } from '@/utils/recordScore';

export type BodyMapScores = Partial<Record<BodyPart, number>>;

/** 예전 부위를 마네킹 부위로 옮겨 칠할 때 쓰는 대응표 */
const LEGACY_PART_MAP: Partial<Record<BodyPart, BodyPart[]>> = {
  CHEST: ['TRUNK'],
  ABDOMEN: ['TRUNK'],
  ARM: ['RIGHT_UPPER_ARM', 'RIGHT_FOREARM', 'LEFT_UPPER_ARM', 'LEFT_FOREARM'],
  HAND: ['RIGHT_HAND', 'LEFT_HAND'],
  LEG: ['RIGHT_THIGH', 'RIGHT_LOWER_LEG', 'LEFT_THIGH', 'LEFT_LOWER_LEG'],
  FOOT: ['RIGHT_FOOT', 'LEFT_FOOT'],
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

const SKIN_SIGN_ORDER = Object.keys(SKIN_SIGN_LABELS) as SkinSign[];

/** 증상을 정해진 순서(피부건조증, 홍반, 각질 …)로 중복 없이 정렬한다 */
export const sortSkinSigns = (signs: Iterable<SkinSign>): SkinSign[] => {
  const set = new Set(signs);
  return SKIN_SIGN_ORDER.filter((sign) => set.has(sign));
};

/** 부위마다 고른 증상을 모두 합친 것 */
export const partSkinSigns = (skinConditions: SkinCondition[] | undefined): SkinSign[] =>
  sortSkinSigns((skinConditions ?? []).flatMap((c) => c.skinSigns ?? []));

/**
 * 그날 나타난 증상 — 부위마다 고른 증상과 부위 없이 고른 증상(예전 기록·챗봇)을 합친다.
 * 예: 목에 홍반, 왼손에 각질 → [홍반, 각질]
 */
export const allSkinSigns = (record: { skinConditions?: SkinCondition[]; skinSigns?: SkinSign[] | null }): SkinSign[] =>
  sortSkinSigns([...partSkinSigns(record.skinConditions), ...(record.skinSigns ?? [])]);

/** 부위에 속하지 않는 증상만 남긴다 — 서버의 하루 증상은 부위 증상을 합친 값이라, 수정할 때 부위 증상을 빼야 지운 증상이 남지 않는다 */
export const dailyOnlySkinSigns = (record: { skinConditions?: SkinCondition[]; skinSigns?: SkinSign[] | null }): SkinSign[] => {
  const fromParts = new Set(partSkinSigns(record.skinConditions));
  return sortSkinSigns((record.skinSigns ?? []).filter((sign) => !fromParts.has(sign)));
};

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
