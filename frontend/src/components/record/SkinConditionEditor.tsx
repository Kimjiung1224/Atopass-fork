import { useState } from 'react';
import type { BodyPart, SkinCondition } from '@/types/record';
import { bodyMapScores, isBodyMapPart } from '@/utils/bodyMap';
import { BODY_PART_LABELS, PART_PAIN_SYMPTOM, SCORE_MAX, SCORE_MIN } from '@/utils/constants';
import { bodyPartScore } from '@/utils/recordScore';
import BodyMap, { BodyMapLegend } from './BodyMap';

interface Props {
  value: SkinCondition[];
  onChange: (value: SkinCondition[]) => void;
}

const SCORES = Array.from({ length: SCORE_MAX - SCORE_MIN + 1 }, (_, i) => SCORE_MIN + i);

/**
 * 부위별 고통 점수 (0~10). 마네킹에서 부위를 눌러 점수 하나를 고른다.
 * 증상별 점수를 따로 받지 않고 고통 점수 하나(symptoms.pain)로 저장한다. 고르지 않은 부위는 "기록 없음".
 */
export default function SkinConditionEditor({ value, onChange }: Props) {
  const [selected, setSelected] = useState<BodyPart | null>(null);
  const scores = bodyMapScores(value);
  const legacy = value.filter((c) => !isBodyMapPart(c.bodyPart));
  const selectedScore = selected ? scores[selected] : undefined;

  const setScore = (part: BodyPart, score: number) => {
    const next: SkinCondition = { bodyPart: part, symptoms: { [PART_PAIN_SYMPTOM]: score } };
    const exists = value.some((c) => c.bodyPart === part);
    onChange(exists ? value.map((c) => (c.bodyPart === part ? next : c)) : [...value, next]);
  };

  const removePart = (part: BodyPart) => onChange(value.filter((c) => c.bodyPart !== part));

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-gray-200 p-4">
        <BodyMap scores={scores} selected={selected} onSelect={setSelected} />
        <div className="mt-3">
          <BodyMapLegend />
        </div>
      </div>

      {selected ? (
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-base font-semibold text-gray-800">{BODY_PART_LABELS[selected]} 고통 점수</p>
            {selectedScore !== undefined && (
              <button type="button" onClick={() => removePart(selected)} className="text-sm text-red-500">
                기록 지우기
              </button>
            )}
          </div>
          <div className="grid grid-cols-6 gap-2" role="group" aria-label={`${BODY_PART_LABELS[selected]} 고통 점수`}>
            {SCORES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={selectedScore === s}
                onClick={() => setScore(selected, s)}
                className={`rounded-lg border py-2 text-base ${
                  selectedScore === s
                    ? 'border-red-500 bg-red-500 font-bold text-white'
                    : 'border-gray-300 bg-white text-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-400">0은 고통 없음(색 없음), 10은 매우 심함이에요.</p>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-500">마네킹에서 부위를 눌러 고통 점수를 골라 주세요.</p>
      )}

      {legacy.length > 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 p-4">
          <p className="mb-2 text-sm text-gray-500">예전 방식으로 기록한 부위예요. 지우고 마네킹에서 다시 골라 주세요.</p>
          <ul className="flex flex-col gap-2">
            {legacy.map((c) => {
              const score = bodyPartScore(c);
              return (
                <li key={c.bodyPart} className="flex items-center justify-between">
                  <span className="text-base text-gray-700">
                    {BODY_PART_LABELS[c.bodyPart]} {score === null ? '' : `${score}점`}
                  </span>
                  <button type="button" onClick={() => removePart(c.bodyPart)} className="text-sm text-red-500">
                    지우기
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
