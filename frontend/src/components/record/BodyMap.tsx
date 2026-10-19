import type { KeyboardEvent, ReactNode } from 'react';
import type { BodyPart } from '@/types/record';
import { painColor, type BodyMapScores } from '@/utils/bodyMap';
import { BODY_PART_LABELS } from '@/utils/constants';

interface Props {
  scores: BodyMapScores;
  /** 고른 부위 — 테두리로 표시 */
  selected?: BodyPart | null;
  /** 부위를 눌렀을 때 */
  onSelect: (part: BodyPart) => void;
}

/**
 * 부위마다 그릴 모양 — 한 사람 그림은 가로 200, 세로 400.
 * 앞면은 마주 보는 그림이라 사람의 오른쪽이 화면 왼쪽에 온다. 뒷면은 좌우를 뒤집어 그린다.
 */
const TRUNK_SHAPE = (
  <path d="M64 90 Q100 82 136 90 Q146 94 145 106 L136 160 Q134 186 136 214 L64 214 Q66 186 64 160 L55 106 Q54 94 64 90 Z" />
);
const GROIN_SHAPE = <path d="M64 212 L136 212 Q138 232 126 242 Q112 252 100 252 Q88 252 74 242 Q62 232 64 212 Z" />;
const HEAD_SHAPE = <ellipse cx="100" cy="46" rx="21" ry="26" />;

const SHAPES: Partial<Record<BodyPart, ReactNode>> = {
  FACE: HEAD_SHAPE,
  NECK: <rect x="89" y="68" width="22" height="22" rx="6" />,
  RIGHT_UPPER_ARM: <rect x="-9" y="0" width="18" height="72" rx="9" transform="translate(56 94) rotate(13)" />,
  LEFT_UPPER_ARM: <rect x="-9" y="0" width="18" height="72" rx="9" transform="translate(144 94) rotate(-13)" />,
  RIGHT_FOREARM: <rect x="-8" y="0" width="16" height="66" rx="8" transform="translate(40 160) rotate(7)" />,
  LEFT_FOREARM: <rect x="-8" y="0" width="16" height="66" rx="8" transform="translate(160 160) rotate(-7)" />,
  RIGHT_HAND: <ellipse cx="31" cy="237" rx="10" ry="13" />,
  LEFT_HAND: <ellipse cx="169" cy="237" rx="10" ry="13" />,
  RIGHT_THIGH: <rect x="-14" y="0" width="28" height="86" rx="13" transform="translate(85 222) rotate(3)" />,
  LEFT_THIGH: <rect x="-14" y="0" width="28" height="86" rx="13" transform="translate(115 222) rotate(-3)" />,
  RIGHT_LOWER_LEG: <rect x="-10" y="0" width="20" height="78" rx="10" transform="translate(82 304) rotate(1)" />,
  LEFT_LOWER_LEG: <rect x="-10" y="0" width="20" height="78" rx="10" transform="translate(118 304) rotate(-1)" />,
  RIGHT_FOOT: <ellipse cx="79" cy="388" rx="14" ry="8" />,
  LEFT_FOOT: <ellipse cx="121" cy="388" rx="14" ry="8" />,
  TRUNK: TRUNK_SHAPE,
  BACK: TRUNK_SHAPE,
  GROIN: GROIN_SHAPE,
};

/** 앞·뒷면 모두에 있는 팔·다리·손·발. 뒤에 그린 부위가 겹친 곳을 덮는다(하박 위에 손, 하박 위에 발) */
const LIMBS: BodyPart[] = [
  'RIGHT_UPPER_ARM',
  'LEFT_UPPER_ARM',
  'RIGHT_FOREARM',
  'LEFT_FOREARM',
  'RIGHT_HAND',
  'LEFT_HAND',
  'RIGHT_THIGH',
  'LEFT_THIGH',
  'RIGHT_LOWER_LEG',
  'LEFT_LOWER_LEG',
  'RIGHT_FOOT',
  'LEFT_FOOT',
];

/** 그리는 순서 — 팔 위에 몸, 허벅지 위에 사타구니. 뒷면은 이 위에 엉덩이·목·뒤통수를 그린다 */
const FRONT_ORDER: BodyPart[] = [...LIMBS, 'TRUNK', 'GROIN', 'NECK', 'FACE'];
const BACK_ORDER: BodyPart[] = [...LIMBS, 'BACK'];

/** 뒷면을 앞면 오른쪽에 좌우를 뒤집어 놓는다 — 그림 가로 200 + 간격 30 */
const BACK_TRANSFORM = 'translate(430 0) scale(-1 1)';
const DECORATION = { fill: '#f3f4f6', stroke: '#d1d5db', strokeWidth: 1.5 };

/**
 * 사람 모양 마네킹(앞면·뒷면). 부위 색은 고통 점수가 높을수록 붉고, 낮을수록 연하다(0점·기록 없음은 무색).
 * 부위를 누르면 고른다. 팔·다리·손·발·목은 앞뒤 어느 쪽을 눌러도 같은 부위다.
 */
export default function BodyMap({ scores, selected, onSelect }: Props) {
  const renderPart = (part: BodyPart, side: 'front' | 'back') => {
    const score = scores[part];
    const label = `${BODY_PART_LABELS[part]} ${score === undefined ? '기록 없음' : `${score}점`}`;
    const isSelected = selected === part;
    const select = () => onSelect(part);
    return (
      <g
        key={`${side}-${part}`}
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-pressed={isSelected}
        onClick={select}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            select();
          }
        }}
        fill={painColor(score)}
        stroke={isSelected ? '#111827' : '#ffffff'}
        strokeWidth={isSelected ? 3 : 1.5}
        className="cursor-pointer outline-none transition-[fill] hover:opacity-85 focus-visible:opacity-75"
      >
        <title>{label}</title>
        {SHAPES[part]}
      </g>
    );
  };

  return (
    <svg viewBox="0 0 430 400" className="mx-auto h-auto w-full max-w-[380px]" role="group" aria-label="부위별 고통 점수 마네킹">
      <g fill="#9ca3af" fontSize="11" textAnchor="middle">
        <text x="24" y="14">오른쪽</text>
        <text x="176" y="14">왼쪽</text>
        <text x="254" y="14">왼쪽</text>
        <text x="406" y="14">오른쪽</text>
      </g>
      <g fill="#4b5563" fontSize="13" fontWeight="600" textAnchor="middle">
        <text x="100" y="14">앞</text>
        <text x="330" y="14">뒤</text>
      </g>

      <g>{FRONT_ORDER.map((part) => renderPart(part, 'front'))}</g>

      <g transform={BACK_TRANSFORM}>
        {BACK_ORDER.map((part) => renderPart(part, 'back'))}
        {/* 엉덩이·뒤통수는 고르는 부위가 아니라 모양만 그린다 */}
        <g {...DECORATION}>{GROIN_SHAPE}</g>
        {renderPart('NECK', 'back')}
        <g {...DECORATION}>{HEAD_SHAPE}</g>
      </g>
    </svg>
  );
}

/** 색 범례: 0점·기록 없음(무색) / 1점(연함) → 10점(붉음) */
export function BodyMapLegend() {
  return (
    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-sm" style={{ background: painColor(0) }} />
        0점·기록 없음
      </span>
      <span className="flex items-center gap-1.5">
        1점
        <span
          className="inline-block h-3 w-20 rounded-sm"
          style={{ background: `linear-gradient(to right, ${painColor(1)}, ${painColor(5)}, ${painColor(10)})` }}
        />
        10점
      </span>
    </div>
  );
}
