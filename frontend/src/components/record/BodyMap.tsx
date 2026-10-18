import type { KeyboardEvent, ReactNode } from 'react';
import type { BodyPart } from '@/types/record';
import { BODY_MAP_EMPTY_COLOR, painColor, type BodyMapScores } from '@/utils/bodyMap';
import { BODY_PART_LABELS } from '@/utils/constants';

interface Props {
  scores: BodyMapScores;
  /** 고른 부위 — 테두리로 표시 */
  selected?: BodyPart | null;
  /** 넘기면 부위를 눌러 고를 수 있다 (없으면 보기 전용) */
  onSelect?: (part: BodyPart) => void;
}

/** 부위마다 그릴 모양 (정면, 양팔·양다리) — viewBox 0 0 200 400 */
const SHAPES: Record<string, ReactNode> = {
  FACE: <ellipse cx="100" cy="36" rx="21" ry="26" />,
  NECK: <rect x="89" y="58" width="22" height="22" rx="6" />,
  UPPER_ARM: (
    <>
      <rect x="-9" y="0" width="18" height="72" rx="9" transform="translate(56 84) rotate(13)" />
      <rect x="-9" y="0" width="18" height="72" rx="9" transform="translate(144 84) rotate(-13)" />
    </>
  ),
  FOREARM: (
    <>
      <rect x="-8" y="0" width="16" height="66" rx="8" transform="translate(40 150) rotate(7)" />
      <rect x="-8" y="0" width="16" height="66" rx="8" transform="translate(160 150) rotate(-7)" />
    </>
  ),
  THIGH: (
    <>
      <rect x="-14" y="0" width="28" height="86" rx="13" transform="translate(85 212) rotate(3)" />
      <rect x="-14" y="0" width="28" height="86" rx="13" transform="translate(115 212) rotate(-3)" />
    </>
  ),
  LOWER_LEG: (
    <>
      <rect x="-10" y="0" width="20" height="82" rx="10" transform="translate(82 294) rotate(1)" />
      <rect x="-10" y="0" width="20" height="82" rx="10" transform="translate(118 294) rotate(-1)" />
    </>
  ),
  TRUNK: <path d="M64 80 Q100 72 136 80 Q146 84 145 96 L136 150 Q134 176 136 204 L64 204 Q66 176 64 150 L55 96 Q54 84 64 80 Z" />,
  GROIN: <path d="M64 202 L136 202 Q138 222 126 232 Q112 242 100 242 Q88 242 74 232 Q62 222 64 202 Z" />,
};

/** 그리는 순서 — 뒤에 그린 부위가 겹친 곳을 덮는다(팔 위에 몸, 허벅지 위에 사타구니) */
const DRAW_ORDER: BodyPart[] = ['UPPER_ARM', 'FOREARM', 'THIGH', 'LOWER_LEG', 'TRUNK', 'GROIN', 'NECK', 'FACE'];

/** 사람 모양 마네킹. 부위 색은 고통 점수가 높을수록 붉고, 낮을수록 연하다 */
export default function BodyMap({ scores, selected, onSelect }: Props) {
  return (
    <svg viewBox="0 0 200 400" className="mx-auto h-auto w-full max-w-[220px]" role="group" aria-label="부위별 고통 점수 마네킹">
      {/* 손·발은 기록하는 부위가 아니라 모양만 그린다 */}
      <g fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5">
        <circle cx="31" cy="222" r="9" />
        <circle cx="169" cy="222" r="9" />
        <ellipse cx="80" cy="382" rx="13" ry="7" />
        <ellipse cx="120" cy="382" rx="13" ry="7" />
      </g>

      {DRAW_ORDER.map((part) => {
        const score = scores[part];
        const label = `${BODY_PART_LABELS[part]} ${score === undefined ? '기록 없음' : `${score}점`}`;
        const isSelected = selected === part;
        return (
          <g
            key={part}
            fill={score === undefined ? BODY_MAP_EMPTY_COLOR : painColor(score)}
            stroke={isSelected ? '#111827' : '#ffffff'}
            strokeWidth={isSelected ? 3 : 1.5}
            className={onSelect ? 'cursor-pointer outline-none transition-[fill] hover:opacity-85 focus-visible:opacity-75' : ''}
            {...(onSelect
              ? {
                  role: 'button',
                  tabIndex: 0,
                  'aria-label': label,
                  'aria-pressed': isSelected,
                  onClick: () => onSelect(part),
                  onKeyDown: (e: KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(part);
                    }
                  },
                }
              : { 'aria-label': label })}
          >
            <title>{label}</title>
            {SHAPES[part]}
          </g>
        );
      })}
    </svg>
  );
}

/** 색 범례: 기록 없음 / 0점(연함) → 10점(붉음) */
export function BodyMapLegend() {
  return (
    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-sm" style={{ background: BODY_MAP_EMPTY_COLOR }} />
        기록 없음
      </span>
      <span className="flex items-center gap-1.5">
        0점
        <span
          className="inline-block h-3 w-20 rounded-sm"
          style={{ background: `linear-gradient(to right, ${painColor(0)}, ${painColor(5)}, ${painColor(10)})` }}
        />
        10점
      </span>
    </div>
  );
}
