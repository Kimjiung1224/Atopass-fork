import { useState } from 'react';
import type { BodyPart, SkinCondition, SkinSign } from '@/types/record';
import { bodyMapScores, isBodyMapPart, sortSkinSigns } from '@/utils/bodyMap';
import { BODY_PART_LABELS, PART_PAIN_SYMPTOM, SCORE_MAX, SCORE_MIN, SKIN_SIGN_LABELS } from '@/utils/constants';
import { bodyPartScore } from '@/utils/recordScore';
import BodyMap, { BodyMapLegend } from './BodyMap';

interface Props {
  value: SkinCondition[];
  onChange: (value: SkinCondition[]) => void;
}

const SCORES = Array.from({ length: SCORE_MAX - SCORE_MIN + 1 }, (_, i) => SCORE_MIN + i);
const SKIN_SIGNS = Object.keys(SKIN_SIGN_LABELS) as SkinSign[];

/**
 * 부위별 고통 점수 (0~10)와 나타난 증상. 마네킹에서 부위를 눌러 점수 하나를 고르고, 그 부위에 나타난 증상을 고른다.
 * 증상별 점수를 따로 받지 않고 고통 점수 하나(symptoms.pain)로 저장한다. 고르지 않은 부위는 "기록 없음".
 */
export default function SkinConditionEditor({ value, onChange }: Props) {
  const [selected, setSelected] = useState<BodyPart | null>(null);
  const scores = bodyMapScores(value);
  const legacy = value.filter((c) => !isBodyMapPart(c.bodyPart));
  const selectedScore = selected ? scores[selected] : undefined;
  const selectedSigns = value.find((c) => c.bodyPart === selected)?.skinSigns ?? [];

  const setScore = (part: BodyPart, score: number) => {
    const existing = value.find((c) => c.bodyPart === part);
    const next: SkinCondition = {
      bodyPart: part,
      symptoms: { [PART_PAIN_SYMPTOM]: score },
      skinSigns: existing?.skinSigns ?? [],
    };
    onChange(existing ? value.map((c) => (c === existing ? next : c)) : [...value, next]);
  };

  // 증상은 고통 점수를 고른 부위에만 붙인다 — 부위 기록에는 점수가 꼭 있어야 한다
  const toggleSign = (part: BodyPart, sign: SkinSign) =>
    onChange(
      value.map((c) => {
        if (c.bodyPart !== part) return c;
        const signs = c.skinSigns ?? [];
        return { ...c, skinSigns: signs.includes(sign) ? signs.filter((s) => s !== sign) : sortSkinSigns([...signs, sign]) };
      }),
    );

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

          <fieldset className="mt-4" disabled={selectedScore === undefined}>
            <legend className="mb-2 text-base font-semibold text-gray-800">{BODY_PART_LABELS[selected]}에 나타난 증상</legend>
            <div className="flex flex-wrap gap-2">
              {SKIN_SIGNS.map((sign) => {
                const checked = selectedSigns.includes(sign);
                return (
                  <button
                    key={sign}
                    type="button"
                    aria-pressed={checked}
                    onClick={() => toggleSign(selected, sign)}
                    className={`rounded-full border px-3 py-1.5 text-base disabled:opacity-40 ${
                      checked ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-700' : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    {SKIN_SIGN_LABELS[sign]}
                  </button>
                );
              })}
            </div>
            {selectedScore === undefined && (
              <p className="mt-2 text-sm text-gray-400">고통 점수를 먼저 고르면 증상을 고를 수 있어요.</p>
            )}
          </fieldset>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-500">마네킹에서 부위를 눌러 고통 점수와 나타난 증상을 골라 주세요.</p>
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
