import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { EMPTY_TEXT } from '@/utils/constants';
import { formatKoreanDate } from '@/utils/date';
import { formatMonthDay } from '@/utils/dateRange';
import { CHART } from './chartTheme';
import { datumFromClick, type TrendDatum } from './TrendLineChart';

interface Props {
  data: TrendDatum[];
  onBarClick?: (datum: TrendDatum) => void;
}

/** 권장 수면 시간 (7~8시간) */
export const SLEEP_RECOMMENDED = { min: 7, max: 8 } as const;

/** 권장 범위를 벗어난 날의 점 색 */
const OUT_OF_RANGE = '#d97706';
/** 권장 수면 시간 띠 */
const RECOMMENDED_FILL = '#10b981';

const isRecommended = (hours: number) => hours >= SLEEP_RECOMMENDED.min && hours <= SLEEP_RECOMMENDED.max;

function rangeText(hours: number) {
  if (hours < SLEEP_RECOMMENDED.min) return '권장보다 적어요';
  if (hours > SLEEP_RECOMMENDED.max) return '권장보다 많아요';
  return '권장 범위예요';
}

interface DotProps {
  cx?: number;
  cy?: number;
  index?: number;
  payload?: TrendDatum;
}

/** 날짜별 점. 권장 범위 밖이면 주황색, 기록 없는 날은 그리지 않는다 */
function SleepDot({ cx, cy, index, payload }: DotProps) {
  if (cx == null || cy == null || payload?.value == null) return <g key={index} />;
  const color = isRecommended(payload.value) ? CHART.line : OUT_OF_RANGE;
  return <circle key={index} cx={cx} cy={cy} r={4.5} fill={color} stroke={CHART.surface} strokeWidth={1.5} />;
}

/**
 * 날짜별 수면 시간 변화. 증상 그래프와 같이 선으로 잇고, 기록이 끊긴 구간만 점선으로 보인다.
 * 권장 수면 시간(7~8시간)은 초록 띠로 깔고, 범위를 벗어난 날은 점 색을 달리해 한눈에 보이게 한다.
 */
export default function SleepBarChart({ data, onBarClick }: Props) {
  const tooltip = ({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
    if (!active || !payload?.length) return null;
    const datum = payload[0].payload as TrendDatum;
    return (
      <div className="rounded-lg bg-white px-3 py-2 text-sm shadow-md ring-1 ring-gray-200">
        <p className="font-medium text-gray-700">{formatKoreanDate(datum.date)}</p>
        {datum.value === null ? (
          <p className="text-gray-400">{EMPTY_TEXT}</p>
        ) : (
          <>
            <p className="font-semibold text-gray-900">수면 {datum.value}시간</p>
            <p className={isRecommended(datum.value) ? 'text-emerald-700' : 'text-amber-700'}>{rangeText(datum.value)}</p>
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className={`h-64 [&_*:focus:not(:focus-visible)]:outline-none ${onBarClick ? 'cursor-pointer' : ''}`} role="img" aria-label="날짜별 수면 시간 그래프">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 12, bottom: 0, left: -20 }}
            onClick={(state) => {
              const datum = datumFromClick(data, state);
              if (onBarClick && datum && datum.recordId !== null && datum.value !== null) onBarClick(datum);
            }}
          >
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <ReferenceArea
              y1={SLEEP_RECOMMENDED.min}
              y2={SLEEP_RECOMMENDED.max}
              fill={RECOMMENDED_FILL}
              fillOpacity={0.12}
              stroke="none"
              ifOverflow="extendDomain"
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatMonthDay}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tick={CHART.tick}
            />
            <YAxis
              domain={[0, 12]}
              ticks={[0, 4, SLEEP_RECOMMENDED.min, SLEEP_RECOMMENDED.max, 12]}
              interval={0}
              tickLine={false}
              axisLine={false}
              tick={CHART.tick}
            />
            <Tooltip content={tooltip} cursor={{ stroke: CHART.cursor }} />
            <Line
              dataKey="value"
              connectNulls
              stroke={CHART.gap}
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="value"
              stroke={CHART.line}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              dot={data.length > 45 ? false : SleepDot}
              activeDot={{ r: 6, fill: CHART.line, stroke: CHART.surface, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-4 rounded-sm" style={{ background: RECOMMENDED_FILL, opacity: 0.25 }} />
          권장 수면 {SLEEP_RECOMMENDED.min}~{SLEEP_RECOMMENDED.max}시간
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full" style={{ background: OUT_OF_RANGE }} />
          권장 범위 밖
        </span>
      </p>
    </div>
  );
}
