import { useState, type ReactNode } from 'react';
import type { ChatChoiceRequest, ChoiceField } from '@/types/chatbot';
import type { SkinSign } from '@/types/record';
import {
  CHAT_SLEEP_HOURS_DEFAULT,
  CHAT_SLEEP_HOURS_OPTIONS,
  PAIN_INDEX_MAX,
  PAIN_INDEX_MIN,
  SKIN_SIGN_LABELS,
} from '@/utils/constants';

interface Props {
  field: ChoiceField;
  onChoose: (choice: ChatChoiceRequest) => void;
  disabled?: boolean;
}

const PAIN_INDEXES = Array.from({ length: PAIN_INDEX_MAX - PAIN_INDEX_MIN + 1 }, (_, i) => PAIN_INDEX_MIN + i);
const SKIN_SIGNS = Object.keys(SKIN_SIGN_LABELS) as SkinSign[];

/**
 * 챗봇이 지금 묻는 항목(askingField)의 선택지. 고른 값은 LLM을 거치지 않고 바로 초안에 반영된다.
 * 특이사항은 글로 받으므로 "없어요"만 보여 준다.
 */
export default function ChatChoices({ field, onChoose, disabled }: Props) {
  // 항목이 바뀌면 고르던 값을 비우도록 key로 다시 만든다
  return (
    <div className="border-t border-gray-100 bg-gray-50 px-3 py-3">
      <ChoiceBody key={field} field={field} onChoose={onChoose} disabled={disabled} />
    </div>
  );
}

function ChoiceBody({ field, onChoose, disabled }: Props) {
  const [sleepHours, setSleepHours] = useState(CHAT_SLEEP_HOURS_DEFAULT);
  const [signs, setSigns] = useState<SkinSign[]>([]);

  const skip = field !== 'painIndex' && field !== 'notes' && (
    <ChoiceButton onClick={() => onChoose({ field, skip: true })} disabled={disabled} subtle>
      넘어가기
    </ChoiceButton>
  );

  switch (field) {
    case 'painIndex':
      return (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500">고통 지수 · 0은 없음, 10은 매우 심함</p>
          <div className="grid grid-cols-6 gap-2" role="group" aria-label="고통 지수">
            {PAIN_INDEXES.map((n) => (
              <ChoiceButton key={n} onClick={() => onChoose({ field, value: n })} disabled={disabled}>
                {n}점
              </ChoiceButton>
            ))}
          </div>
        </div>
      );
    case 'sleepHours':
      return (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            disabled={disabled}
            aria-label="수면 시간"
            className="min-h-11 flex-1 rounded-xl border border-gray-300 bg-white px-3 text-base"
          >
            {CHAT_SLEEP_HOURS_OPTIONS.map((h) => (
              <option key={h} value={h}>
                {h}시간
              </option>
            ))}
          </select>
          <ChoiceButton onClick={() => onChoose({ field, value: sleepHours })} disabled={disabled} primary>
            확인
          </ChoiceButton>
          {skip}
        </div>
      );
    case 'medication':
      return (
        <div className="flex gap-2" role="group" aria-label="약 복용">
          <ChoiceButton onClick={() => onChoose({ field, value: true })} disabled={disabled} wide>
            예
          </ChoiceButton>
          <ChoiceButton onClick={() => onChoose({ field, value: false })} disabled={disabled} wide>
            아니오
          </ChoiceButton>
          {skip}
        </div>
      );
    case 'skinSigns': {
      const toggle = (sign: SkinSign) =>
        setSigns((prev) =>
          prev.includes(sign) ? prev.filter((s) => s !== sign) : SKIN_SIGNS.filter((s) => s === sign || prev.includes(s)),
        );
      return (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="나타난 증상">
            {SKIN_SIGNS.map((sign) => {
              const selected = signs.includes(sign);
              return (
                <button
                  key={sign}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggle(sign)}
                  disabled={disabled}
                  className={`min-h-11 rounded-xl border px-3 text-base ${
                    selected ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-700' : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  {SKIN_SIGN_LABELS[sign]}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <ChoiceButton onClick={() => onChoose({ field, value: signs })} disabled={disabled || signs.length === 0} primary wide>
              {signs.length > 0 ? `${signs.length}개 선택 완료` : '선택 완료'}
            </ChoiceButton>
            <ChoiceButton onClick={() => onChoose({ field, value: [] })} disabled={disabled}>
              없어요
            </ChoiceButton>
            {skip}
          </div>
        </div>
      );
    }
    case 'notes':
      return (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-gray-500">특이사항은 아래에 적어 주세요</span>
          <ChoiceButton onClick={() => onChoose({ field, skip: true })} disabled={disabled}>
            없어요
          </ChoiceButton>
        </div>
      );
  }
}

function ChoiceButton({
  children,
  onClick,
  disabled,
  primary,
  subtle,
  wide,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  subtle?: boolean;
  wide?: boolean;
}) {
  const tone = primary
    ? 'border-emerald-600 bg-emerald-600 font-semibold text-white'
    : subtle
      ? 'border-gray-300 bg-white text-gray-500'
      : 'border-gray-300 bg-white text-gray-800';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-11 shrink-0 rounded-xl border px-4 text-base disabled:opacity-40 ${tone} ${wide ? 'flex-1' : ''}`}
    >
      {children}
    </button>
  );
}
