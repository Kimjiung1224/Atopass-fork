import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import type { ComparisonDay, ComparisonResponse } from '@/types/analysis';
import type { BodyPart, SymptomKey } from '@/types/record';
import {
  BODY_PART_LABELS,
  EMPTY_TEXT,
  OUTDOOR_ACTIVITY_LABELS,
  SKIN_SIGN_LABELS,
  SLEEP_SCORE_MAX,
  SYMPTOM_LABELS,
} from '@/utils/constants';
import { formatKoreanDate } from '@/utils/date';
import { bodyPartScoreOf } from '@/utils/recordScore';
import { recordPath } from '@/utils/routes';
import SavedPhotoList from './SavedPhotoList';

interface Props {
  dateA: string;
  dateB: string;
  comparison: ComparisonResponse;
}

const BODY_PART_ORDER = Object.keys(BODY_PART_LABELS) as BodyPart[];
const SYMPTOM_ORDER = Object.keys(SYMPTOM_LABELS) as SymptomKey[];

/** 그날 해당 부위의 증상 점수(증상 평균). 기록이 없거나 증상을 기록하지 않은 부위는 null */
const scoreOf = (day: ComparisonDay | null, bodyPart: BodyPart) => bodyPartScoreOf(day?.skinConditions, bodyPart);

/** 그날 해당 부위·증상 점수. 기록하지 않은 증상은 null */
function symptomScoreOf(day: ComparisonDay | null, bodyPart: BodyPart, symptom: SymptomKey): number | null {
  const score = day?.skinConditions.find((c) => c.bodyPart === bodyPart)?.symptoms[symptom];
  return typeof score === 'number' ? score : null;
}

/** 소수 평균끼리 뺄 때 생기는 오차(0.30000000000000004 등)를 없앤다 */
const diff = (a: number | null, b: number | null) => (a !== null && b !== null ? Math.round((b - a) * 10) / 10 : null);
const scoreText = (score: number | null) => (score === null ? null : `${score}점`);

/** 두 날 중 한쪽이라도 증상을 기록한 부위 (부위 순서 고정) */
function bodyPartRows(a: ComparisonDay | null, b: ComparisonDay | null) {
  return BODY_PART_ORDER.filter((bodyPart) => scoreOf(a, bodyPart) !== null || scoreOf(b, bodyPart) !== null);
}

/** 두 날짜(A·B) 기록을 나란히 비교한다. 기록이 없는 쪽은 "기록 없음"으로 보여 준다 */
export default function ComparisonView({ dateA, dateB, comparison }: Props) {
  const { A: a, B: b } = comparison;
  const rows = bodyPartRows(a, b);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <DayHeader tag="A" date={dateA} day={a} />
        <DayHeader tag="B" date={dateB} day={b} />
      </div>

      {!a && !b ? (
        <p className="rounded-2xl bg-gray-50 py-8 text-center text-gray-400">두 날짜 모두 기록이 없어요.</p>
      ) : (
        <>
          <CompareSection title="오늘의 상태">
            <CompareRow
              label="고통 지수"
              valueA={scoreText(a?.painIndex ?? null)}
              valueB={scoreText(b?.painIndex ?? null)}
              change={diff(a?.painIndex ?? null, b?.painIndex ?? null)}
            />
            <CompareRow label="약 복용" valueA={medicationText(a)} valueB={medicationText(b)} />
            <CompareRow label="나타난 증상" valueA={skinSignsText(a)} valueB={skinSignsText(b)} />
          </CompareSection>

          <CompareSection title="부위별 고통 점수" hint="부위마다 기록한 고통 점수예요.">
            {rows.length === 0 ? (
              <p className="py-2 text-center text-gray-400">{EMPTY_TEXT}</p>
            ) : (
              rows.map((bodyPart) => <BodyPartCompareRow key={bodyPart} bodyPart={bodyPart} a={a} b={b} />)
            )}
          </CompareSection>

          <CompareSection title="수면·생활">
            <CompareRow label="수면" valueA={sleepText(a)} valueB={sleepText(b)} />
            <CompareRow
              label={`수면 점수 (${SLEEP_SCORE_MAX}점 만점)`}
              valueA={scoreText(a?.sleepScore ?? null)}
              valueB={scoreText(b?.sleepScore ?? null)}
              change={diff(a?.sleepScore ?? null, b?.sleepScore ?? null)}
            />
            <CompareRow label="음주" valueA={alcoholText(a)} valueB={alcoholText(b)} />
            <CompareRow label="외출" valueA={outdoorText(a)} valueB={outdoorText(b)} />
          </CompareSection>

          <CompareSection title="특이사항">
            <div className="grid grid-cols-2 gap-2">
              <NoteCell day={a} />
              <NoteCell day={b} />
            </div>
          </CompareSection>

          <CompareSection title="사진">
            <div className="grid grid-cols-2 gap-2">
              <PhotoCell day={a} />
              <PhotoCell day={b} />
            </div>
          </CompareSection>
        </>
      )}
    </div>
  );
}

const sleepText = (day: ComparisonDay | null) => (day?.sleepHours == null ? null : `${day.sleepHours}시간`);
const medicationText = (day: ComparisonDay | null) =>
  day?.medication == null ? null : day.medication ? '복용했어요' : '안 했어요';
/** 나타난 증상 이름을 나열한다. 기록이 없거나 빈 목록이면 null("기록 없음") */
const skinSignsText = (day: ComparisonDay | null) =>
  day?.skinSigns?.length ? day.skinSigns.map((sign) => SKIN_SIGN_LABELS[sign]).join(', ') : null;
const alcoholText = (day: ComparisonDay | null) => {
  const alcohol = day?.lifestyle?.alcohol;
  return alcohol == null ? null : alcohol ? '했어요' : '안 했어요';
};
const outdoorText = (day: ComparisonDay | null) => {
  const outdoor = day?.lifestyle?.outdoorActivity;
  return outdoor ? OUTDOOR_ACTIVITY_LABELS[outdoor] : null;
};

function DayHeader({ tag, date, day }: { tag: 'A' | 'B'; date: string; day: ComparisonDay | null }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="flex items-center gap-1.5 text-sm text-gray-500">
        <span className="flex size-5 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-white">
          {tag}
        </span>
        {day ? '기록 있음' : EMPTY_TEXT}
      </p>
      <p className="mt-1 font-bold">{formatKoreanDate(date)}</p>
      {day && (
        <Link to={recordPath(date)} className="mt-1 inline-block text-sm text-emerald-700 underline">
          그날 기록 보기
        </Link>
      )}
    </div>
  );
}

function CompareSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 font-bold">{title}</h3>
      <div className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 px-3">{children}</div>
      {hint && <p className="mt-1.5 text-sm text-gray-400">{hint}</p>}
    </section>
  );
}

/** 부위 한 줄(증상 평균). 누르면 두 날 중 한쪽이라도 기록한 증상별 A·B 점수를 펼친다 */
function BodyPartCompareRow({ bodyPart, a, b }: { bodyPart: BodyPart; a: ComparisonDay | null; b: ComparisonDay | null }) {
  const [open, setOpen] = useState(false);
  const scoreA = scoreOf(a, bodyPart);
  const scoreB = scoreOf(b, bodyPart);
  const symptoms = SYMPTOM_ORDER.filter(
    (symptom) => symptomScoreOf(a, bodyPart, symptom) !== null || symptomScoreOf(b, bodyPart, symptom) !== null,
  );

  return (
    <div>
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="w-full text-left">
        <CompareRow
          label={
            <span className="flex items-center gap-1.5">
              {BODY_PART_LABELS[bodyPart]}
              <span aria-hidden className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </span>
          }
          valueA={scoreText(scoreA)}
          valueB={scoreText(scoreB)}
          change={diff(scoreA, scoreB)}
        />
      </button>
      {open && (
        <div className="mb-2.5 flex flex-col divide-y divide-gray-100 rounded-lg bg-gray-50 px-3 text-sm">
          {symptoms.map((symptom) => {
            const symptomA = symptomScoreOf(a, bodyPart, symptom);
            const symptomB = symptomScoreOf(b, bodyPart, symptom);
            return (
              <CompareRow
                key={symptom}
                label={SYMPTOM_LABELS[symptom]}
                valueA={scoreText(symptomA)}
                valueB={scoreText(symptomB)}
                change={diff(symptomA, symptomB)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/** 한 줄: 항목 이름 / A 값 / B 값. 둘 다 숫자면 B에 A 대비 변화를 붙인다 */
function CompareRow({
  label,
  valueA,
  valueB,
  change = null,
}: {
  label: ReactNode;
  valueA: string | null;
  valueB: string | null;
  change?: number | null;
}) {
  return (
    <div className="grid grid-cols-[1fr_5rem_5rem] items-center gap-2 py-2.5">
      <span className="text-gray-700">{label}</span>
      <Value text={valueA} />
      <span className="text-right">
        <Value text={valueB} />
        {change !== null && change !== 0 && (
          <span className="block text-xs text-gray-500">
            A보다 {change > 0 ? `${change}점 높음` : `${-change}점 낮음`}
          </span>
        )}
      </span>
    </div>
  );
}

function Value({ text }: { text: string | null }) {
  return (
    <span className={`block text-right ${text ? 'font-semibold text-gray-900' : 'text-sm text-gray-400'}`}>
      {text ?? EMPTY_TEXT}
    </span>
  );
}

function NoteCell({ day }: { day: ComparisonDay | null }) {
  return day?.notes ? (
    <p className="whitespace-pre-wrap py-2.5 text-sm text-gray-800">{day.notes}</p>
  ) : (
    <p className="py-2.5 text-sm text-gray-400">{EMPTY_TEXT}</p>
  );
}

function PhotoCell({ day }: { day: ComparisonDay | null }) {
  if (!day) return <p className="py-2.5 text-sm text-gray-400">{EMPTY_TEXT}</p>;
  if (day.photos.length === 0) return <p className="py-2.5 text-sm text-gray-400">사진 없음</p>;
  return (
    <div className="min-w-0 py-2.5">
      <SavedPhotoList recordId={day.recordId} photos={day.photos} />
    </div>
  );
}
