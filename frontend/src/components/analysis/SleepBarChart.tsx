import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { EMPTY_TEXT } from '@/utils/constants';
import { formatKoreanDate } from '@/utils/date';
import { formatMonthDay } from '@/utils/dateRange';
import { CHART } from './chartTheme';
import type { TrendDatum } from './TrendLineChart';

interface Props {
  data: TrendDatum[];
  onBarClick?: (datum: TrendDatum) => void;
}

/** 날짜별 수면 시간. 기록 없는 날은 막대를 그리지 않는다. */
export default function SleepBarChart({ data, onBarClick }: Props) {
  const tooltip = ({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
    if (!active || !payload?.length) return null;
    const datum = payload[0].payload as TrendDatum;
    return (
      <div className="rounded-lg bg-white px-3 py-2 text-sm shadow-md ring-1 ring-gray-200">
        <p className="font-medium text-gray-700">{formatKoreanDate(datum.date)}</p>
        <p className={datum.value === null ? 'text-gray-400' : 'font-semibold text-gray-900'}>
          {datum.value === null ? EMPTY_TEXT : `수면 ${datum.value}시간`}
        </p>
      </div>
    );
  };

  return (
    <div className={`h-64 ${onBarClick ? 'cursor-pointer' : ''}`} role="img" aria-label="날짜별 수면 시간 그래프">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 0, left: -20 }}
          onClick={(state) => {
            const index = Number(state?.activeTooltipIndex);
            const datum = Number.isInteger(index) ? data[index] : undefined;
            if (onBarClick && datum && datum.recordId !== null && datum.value !== null) onBarClick(datum);
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
          <YAxis domain={[0, 12]} ticks={[0, 4, 8, 12]} tickLine={false} axisLine={false} tick={CHART.tick} />
          <Tooltip content={tooltip} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="value" fill={CHART.line} radius={[4, 4, 0, 0]} maxBarSize={20} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
