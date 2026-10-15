import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
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

export interface TrendDatum {
  date: string;
  value: number | null;
  recordId: number | null;
}

interface Props {
  data: TrendDatum[];
  domain: [number, number];
  /** 세로축 눈금 (예: 0, 2, 4 … 10) */
  ticks?: number[];
  /** 툴팁 값 표시 (예: 7 → "7점") */
  formatValue: (value: number) => string;
  onPointClick?: (datum: TrendDatum) => void;
  ariaLabel: string;
}

/** 값이 가장 높은 날. 같은 값이면 앞선 날. */
function findPeak(data: TrendDatum[]): TrendDatum | null {
  let peak: TrendDatum | null = null;
  for (const d of data) {
    if (d.value !== null && (peak === null || d.value > (peak.value ?? -Infinity))) peak = d;
  }
  return peak;
}

/**
 * 날짜별 값 변화.
 * 기록 없는 날(null)은 값을 채우지 않는다. 점선 라인(connectNulls) 위에 실선을 그려 끊긴 구간만 점선으로 보인다.
 * 가장 높은 날에는 숫자를 붙여 한눈에 찾을 수 있게 한다.
 */
export default function TrendLineChart({ data, domain, ticks, formatValue, onPointClick, ariaLabel }: Props) {
  const peak = findPeak(data);

  const tooltip = ({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
    if (!active || !payload?.length) return null;
    const datum = payload[0].payload as TrendDatum;
    return (
      <div className="rounded-lg bg-white px-3 py-2 text-sm shadow-md ring-1 ring-gray-200">
        <p className="font-medium text-gray-700">{formatKoreanDate(datum.date)}</p>
        <p className={datum.value === null ? 'text-gray-400' : 'font-semibold text-gray-900'}>
          {datum.value === null ? EMPTY_TEXT : formatValue(datum.value)}
        </p>
        {onPointClick && datum.recordId !== null && <p className="mt-0.5 text-gray-400">누르면 그날 기록을 볼 수 있어요</p>}
      </div>
    );
  };

  return (
    <div className={`h-64 ${onPointClick ? 'cursor-pointer' : ''}`} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 12, bottom: 0, left: -20 }}
          onClick={(state) => {
            // 점을 정확히 누르지 않아도 가장 가까운 날짜의 기록으로 이동한다.
            const index = Number(state?.activeTooltipIndex);
            const datum = Number.isInteger(index) ? data[index] : undefined;
            if (onPointClick && datum && datum.recordId !== null && datum.value !== null) onPointClick(datum);
          }}
        >
          <CartesianGrid vertical={false} stroke={CHART.grid} />
          <XAxis
            dataKey="date"
            tickFormatter={formatMonthDay}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            tick={CHART.tick}
          />
          <YAxis domain={domain} ticks={ticks} interval={0} tickLine={false} axisLine={false} tick={CHART.tick} />
          <Tooltip content={tooltip} cursor={{ stroke: CHART.cursor }} />
          <Area
            dataKey="value"
            stroke="none"
            fill={CHART.line}
            fillOpacity={CHART.areaOpacity}
            activeDot={false}
            isAnimationActive={false}
          />
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
            dot={data.length > 45 ? false : { r: 4, fill: CHART.line, stroke: CHART.surface, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: CHART.line, stroke: CHART.surface, strokeWidth: 2 }}
            isAnimationActive={false}
          />
          {peak && (
            <ReferenceDot
              x={peak.date}
              y={peak.value ?? 0}
              r={5}
              fill={CHART.line}
              stroke={CHART.surface}
              strokeWidth={2}
              label={{ value: `최고 ${peak.value}`, position: 'top', fontSize: 12, fontWeight: 600, fill: CHART.label }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
