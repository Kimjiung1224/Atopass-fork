import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { EMPTY_TEXT } from '@/utils/constants';
import { formatKoreanDate } from '@/utils/date';
import { formatMonthDay } from '@/utils/dateRange';

export interface TrendDatum {
  date: string;
  value: number | null;
  recordId: number | null;
}

interface Props {
  data: TrendDatum[];
  domain: [number, number];
  /** 툴팁 값 표시 (예: 7 → "7점") */
  formatValue: (value: number) => string;
  onPointClick?: (datum: TrendDatum) => void;
  ariaLabel: string;
}

/**
 * 그래프를 누른 위치의 날짜 데이터.
 * 고른 날이 없을 때 activeTooltipIndex가 null로 오는데, Number(null)이 0이 되어
 * 첫날이 골라지던 문제가 있어 날짜(activeLabel)로 먼저 찾고 null은 걸러 낸다.
 */
export function datumFromClick(
  data: TrendDatum[],
  state: { activeLabel?: unknown; activeTooltipIndex?: unknown } | null | undefined,
): TrendDatum | undefined {
  const label = state?.activeLabel;
  if (typeof label === 'string') return data.find((d) => d.date === label);
  const index = state?.activeTooltipIndex;
  if (index === null || index === undefined || index === '') return undefined;
  return data[Number(index)];
}

const BRAND = '#059669'; // emerald-600
const GAP = '#a8b3bf';

/**
 * 날짜별 값 변화.
 * 기록 없는 날(null)은 값을 채우지 않는다. 점선 라인(connectNulls) 위에 실선을 그려 끊긴 구간만 점선으로 보인다.
 */
export default function TrendLineChart({ data, domain, formatValue, onPointClick, ariaLabel }: Props) {
  const tooltip = ({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
    if (!active || !payload?.length) return null;
    const datum = payload[0].payload as TrendDatum;
    return (
      <div className="rounded-lg bg-white px-3 py-2 text-sm shadow-md ring-1 ring-gray-200">
        <p className="font-medium text-gray-700">{formatKoreanDate(datum.date)}</p>
        <p className={datum.value === null ? 'text-gray-400' : 'text-emerald-700'}>
          {datum.value === null ? EMPTY_TEXT : formatValue(datum.value)}
        </p>
        {onPointClick && datum.recordId !== null && <p className="mt-0.5 text-gray-400">누르면 아래에서 그날 기록을 볼 수 있어요</p>}
      </div>
    );
  };

  return (
    <div className={`h-56 [&_*:focus:not(:focus-visible)]:outline-none ${onPointClick ? 'cursor-pointer' : ''}`} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -24 }}
          onClick={(state) => {
            // 점을 정확히 누르지 않아도 가장 가까운 날짜를 고른다.
            const datum = datumFromClick(data, state);
            if (onPointClick && datum && datum.recordId !== null && datum.value !== null) onPointClick(datum);
          }}
        >
          <CartesianGrid vertical={false} stroke="#eef1f4" />
          <XAxis
            dataKey="date"
            tickFormatter={formatMonthDay}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            tick={{ fontSize: 11, fill: '#64748b' }}
          />
          <YAxis domain={domain} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <Tooltip content={tooltip} cursor={{ stroke: '#cbd5e1' }} />
          <Line
            dataKey="value"
            connectNulls
            stroke={GAP}
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="value"
            stroke={BRAND}
            strokeWidth={2.5}
            dot={{ r: data.length > 45 ? 2.5 : 3.5, fill: BRAND, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
