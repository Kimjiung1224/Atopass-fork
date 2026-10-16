import { useState } from 'react';
import type { PhotoRef, RecordInput, SkinCondition, SymptomKey } from '@/types/record';
import { BODY_PART_LABELS, EMPTY_TEXT, OUTDOOR_ACTIVITY_LABELS, SCORE_MAX, SYMPTOM_LABELS } from '@/utils/constants';
import { bodyPartScore, representativeScore } from '@/utils/recordScore';
import SavedPhotoList from './SavedPhotoList';
import Section from './Section';

interface Props {
  record: RecordInput;
  recordId: number;
  photos: PhotoRef[];
}

/** 점수 구간별 색 (0~3 / 4~6 / 7~10) */
function scoreTone(score: number) {
  if (score <= 3) return { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' };
  if (score <= 6) return { bar: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700' };
  return { bar: 'bg-red-500', badge: 'bg-red-50 text-red-700' };
}

/** 저장된 하루 기록 보기 (읽기 전용) */
export default function RecordView({ record, recordId, photos }: Props) {
  const topScore = representativeScore(record.skinConditions);
  const alcohol = record.lifestyle?.alcohol;
  const outdoor = record.lifestyle?.outdoorActivity;

  return (
    <>
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
          <p className="text-gray-600">가장 높은 증상 점수</p>
          {topScore === null ? (
            <p className="text-gray-400">{EMPTY_TEXT}</p>
          ) : (
            <p className={`rounded-full px-3 py-1 text-lg font-bold ${scoreTone(topScore).badge}`}>{topScore}점</p>
          )}
        </div>
      </div>

      <Section title="부위별 증상 점수">
        {record.skinConditions.length === 0 ? (
          <p className="text-gray-400">{EMPTY_TEXT}</p>
        ) : (
          <>
            <ul className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 px-4">
              {record.skinConditions.map((condition) => (
                <BodyPartRow key={condition.bodyPart} condition={condition} />
              ))}
            </ul>
            <p className="mt-2 text-sm text-gray-400">부위마다 기록한 증상 점수의 평균이에요. 누르면 증상별 점수를 볼 수 있어요.</p>
          </>
        )}
      </Section>

      <Section title="수면·생활">
        <dl className="grid grid-cols-3 gap-2 text-center">
          <InfoTile label="수면" value={record.sleepHours == null ? null : `${record.sleepHours}시간`} />
          <InfoTile label="음주" value={alcohol == null ? null : alcohol ? '했어요' : '안 했어요'} />
          <InfoTile label="외출" value={outdoor ? OUTDOOR_ACTIVITY_LABELS[outdoor] : null} />
        </dl>
      </Section>

      <Section title="특이사항">
        {record.notes ? (
          <p className="whitespace-pre-wrap text-base text-gray-800">{record.notes}</p>
        ) : (
          <p className="text-gray-400">{EMPTY_TEXT}</p>
        )}
      </Section>

      <Section title="사진">
        {photos.length === 0 ? (
          <p className="text-gray-400">사진 없음</p>
        ) : (
          <SavedPhotoList recordId={recordId} photos={photos} />
        )}
      </Section>
    </>
  );
}

/** 점수 막대 */
function ScoreBar({ score }: { score: number }) {
  return (
    <span className="h-2.5 overflow-hidden rounded-full bg-gray-100">
      <span
        className={`block h-full rounded-full ${scoreTone(score).bar}`}
        style={{ width: `${(score / SCORE_MAX) * 100}%` }}
      />
    </span>
  );
}

/** 부위 하나: 증상 평균을 한 줄로 보여 주고, 누르면 기록한 증상별 점수(높은 순)를 펼친다 */
function BodyPartRow({ condition }: { condition: SkinCondition }) {
  const [open, setOpen] = useState(false);
  const score = bodyPartScore(condition);
  const symptoms = (Object.entries(condition.symptoms) as [SymptomKey, number | undefined][])
    .filter((entry): entry is [SymptomKey, number] => typeof entry[1] === 'number')
    .sort((a, b) => b[1] - a[1]);

  if (score === null) {
    return (
      <li className="grid grid-cols-[4.5rem_1fr] items-center gap-3 py-3">
        <span className="font-bold text-gray-800">{BODY_PART_LABELS[condition.bodyPart]}</span>
        <span className="text-gray-400">기록한 증상 없음</span>
      </li>
    );
  }

  return (
    <li className="py-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid w-full grid-cols-[4.5rem_1fr_3rem_1rem] items-center gap-3 text-left"
      >
        <span className="font-bold text-gray-800">{BODY_PART_LABELS[condition.bodyPart]}</span>
        <ScoreBar score={score} />
        <span className="text-right font-semibold">{score}점</span>
        <span aria-hidden className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      {open && (
        <ul className="mt-3 flex flex-col gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
          {symptoms.map(([key, value]) => (
            <li key={key} className="grid grid-cols-[4rem_1fr_2.5rem] items-center gap-3">
              <span className="text-gray-600">{SYMPTOM_LABELS[key]}</span>
              <ScoreBar score={value} />
              <span className="text-right text-gray-700">{value}점</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function InfoTile({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl bg-gray-50 py-3">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className={`mt-1 text-lg font-bold ${value ? '' : 'text-base font-normal text-gray-400'}`}>
        {value ?? EMPTY_TEXT}
      </dd>
    </div>
  );
}
