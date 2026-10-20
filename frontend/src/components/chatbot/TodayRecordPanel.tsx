import { useEffect, useRef, useState } from 'react';
import PainIndexSlider from '@/components/record/PainIndexSlider';
import SleepHoursSlider from '@/components/record/SleepHoursSlider';
import type { ChatDraft } from '@/types/chatbot';
import { BODY_PART_LABELS, SKIN_SIGN_LABELS } from '@/utils/constants';

export type AdjustableField = 'painIndex' | 'sleepHours';

interface Props {
  draft: ChatDraft | null;
  disabled?: boolean;
  onAdjust: (field: AdjustableField, value: number) => void;
}

/** 막대를 움직이다 멈추면 이만큼(ms) 기다렸다가 보낸다 — 끄는 동안 값마다 보내지 않도록 */
const COMMIT_DELAY = 600;

/**
 * 챗봇 화면 뒤에 깔리는 오늘의 기록. 고통 지수·수면 시간 막대는 항상 보이고, 밀어서 바로 고칠 수 있다.
 * 채팅으로 답한 값도 여기에 그대로 보인다. 나머지 항목은 지금까지 기록된 내용을 보여 준다.
 */
export default function TodayRecordPanel({ draft, disabled, onAdjust }: Props) {
  const savedPain = draft?.painIndex ?? null;
  const savedSleep = draft?.sleepHours ?? null;
  const [pain, setPain] = useState<number | null>(savedPain);
  const [sleep, setSleep] = useState<number | null>(savedSleep);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 채팅으로 답하거나 서버가 값을 바꾸면 막대도 따라간다
  useEffect(() => setPain(savedPain), [savedPain]);
  useEffect(() => setSleep(savedSleep), [savedSleep]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const change = (field: AdjustableField, value: number) => {
    if (field === 'painIndex') setPain(value);
    else setSleep(value);
    if (timer.current) clearTimeout(timer.current);
    const saved = field === 'painIndex' ? savedPain : savedSleep;
    timer.current = setTimeout(() => {
      if (value !== saved) onAdjust(field, value);
    }, COMMIT_DELAY);
  };

  const parts = draft?.skinConditions ?? [];
  const signs = draft?.skinSigns ?? null;

  return (
    <div className="flex flex-col gap-5 px-4 py-4">
      <PainIndexSlider value={pain} onChange={(v) => change('painIndex', v)} disabled={disabled} />
      <SleepHoursSlider value={sleep} onChange={(v) => change('sleepHours', v)} disabled={disabled} />

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl bg-gray-50 p-4 text-base">
        <dt className="text-gray-500">고통 부위</dt>
        <dd className="text-gray-800">
          {parts.length
            ? parts
                .map((c) => (c.symptoms.pain != null ? `${BODY_PART_LABELS[c.bodyPart]} ${c.symptoms.pain}점` : BODY_PART_LABELS[c.bodyPart]))
                .join(', ')
            : '기록 없음'}
        </dd>
        <dt className="text-gray-500">약 복용</dt>
        <dd className="text-gray-800">{draft?.medication == null ? '기록 없음' : draft.medication ? '예' : '아니오'}</dd>
        <dt className="text-gray-500">나타난 증상</dt>
        <dd className="text-gray-800">
          {signs === null ? '기록 없음' : signs.length ? signs.map((s) => SKIN_SIGN_LABELS[s]).join(', ') : '없음'}
        </dd>
        <dt className="text-gray-500">특이사항</dt>
        <dd className="whitespace-pre-wrap text-gray-800">{draft?.notes || '기록 없음'}</dd>
      </dl>
    </div>
  );
}
