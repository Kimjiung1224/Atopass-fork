import type { BodyPart, SkinCondition } from '@/types/record';

/**
 * 부위 증상 점수: 그 부위에 기록한 증상 점수의 평균 (소수점 첫째 자리 반올림).
 * 증상을 하나씩 다 보여 주면 한눈에 보기 어려워 부위마다 점수 하나로 묶는다.
 * 기록한 증상이 없으면 null (0으로 채우지 않는다).
 */
export function bodyPartScore(condition: SkinCondition | undefined): number | null {
  const scores = Object.values(condition?.symptoms ?? {}).filter((score): score is number => typeof score === 'number');
  if (!scores.length) return null;
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Math.round(average * 10) / 10;
}

/** 기록 중 해당 부위의 증상 점수. 그 부위를 기록하지 않았으면 null */
export function bodyPartScoreOf(skinConditions: SkinCondition[] | undefined, bodyPart: BodyPart): number | null {
  return bodyPartScore(skinConditions?.find((condition) => condition.bodyPart === bodyPart));
}
