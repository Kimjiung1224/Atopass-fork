import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { formatKoreanDate } from '@/utils/date';
import { formatMonthDay } from '@/utils/dateRange';
import { CHART } from './chartTheme';

export interface OverlaySeries {
  key: string;
  label: string;
  /** 고정 색 — 지표마다 항상 같은 색(선택 순서로 바뀌지 않음) */
  color: string;
  data: { date: string; value: number | null }[];
  formatValue: (value: number) => string;
}

interface NormalizedPoint {
  date: string;
  [seriesKey: string]: string | number | null;
}

const NORMALIZED_DOMAIN: [number, number] = [0, 100];
const NORMALIZED_TICKS = [0, 25, 50, 75, 100];

/**
 * 지표별 기간 내 최소~최대를 0~100으로 선형 변환한다. 최소=최대(값이 하나뿐이거나 전부 같음)면 50(가운데)으로 둔다.
 * 단위가 전혀 다른 지표(점수·시간·도·%)를 한 축에 겹치기 위한 상대 비교용이며, 실제 값은 툴팁에서만 보여준다.
 */
function normalize(data: { date: string; value: number | null }[]) {
  const values = data.map((d) => d.value).filter((v): v is number => v !== null);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return data.map((d) => ({
    date: d.date,
    value: d.value === null ? null : max === min ? 50 : ((d.value - min) / (max - min)) * 100,
  }));
}

function merge(series: OverlaySeries[]): NormalizedPoint[] {
  if (series.length === 0) return [];
  const dates = series[0].data.map((d) => d.date);
  return dates.map((date, i) => {
    const point: NormalizedPoint = { date };
    series.forEach((s) => {
      point[s.key] = normalize(s.data)[i]?.value ?? null;
    });
    return point;
  });
}

/** 선택한 지표들을 한 축(상대값 0~100%)에 겹쳐 그린다. 실제 값은 툴팁에서 지표별로 그대로 보여준다. */
export default function OverlayTrendChart({ series, ariaLabel }: { series: OverlaySeries[]; ariaLabel: string }) {
  const data = merge(series);
  const rawByKey = new Map(series.map((s) => [s.key, new Map(s.data.map((d) => [d.date, d.value]))]));

  const tooltip = ({ active, label }: TooltipContentProps<ValueType, NameType>) => {
    if (!active || typeof label !== 'string') return null;
    const rows = series
      .map((s) => ({ s, raw: rawByKey.get(s.key)?.get(label) ?? null }))
      .filter((r) => r.raw !== null);
    if (rows.length === 0) return null;
    return (
      <div className="rounded-lg bg-white px-3 py-2 text-sm shadow-md ring-1 ring-gray-200">
        <p className="mb-1 font-medium text-gray-700">{formatKoreanDate(label)}</p>
        <ul className="flex flex-col gap-0.5">
          {rows.map(({ s, raw }) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-0.5 w-3 shrink-0" style={{ backgroundColor: s.color }} />
              <span className="font-semibold text-gray-900">{s.formatValue(raw as number)}</span>
              <span className="text-gray-400">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="h-64 [&_*:focus:not(:focus-visible)]:outline-none" role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 12, bottom: 0, left: -20 }}>
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <XAxis
              dataKey="date"
              tickFormatter={formatMonthDay}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tick={CHART.tick}
            />
            <YAxis
              domain={NORMALIZED_DOMAIN}
              ticks={NORMALIZED_TICKS}
              tickFormatter={(v: number) => `${v}%`}
              interval={0}
              tickLine={false}
              axisLine={false}
              tick={CHART.tick}
            />
            <Tooltip content={tooltip} cursor={{ stroke: CHART.cursor }} />
            {series.map((s) => (
              <Line
                key={s.key}
                dataKey={s.key}
                name={s.label}
                connectNulls={false}
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                dot={data.length > 45 ? false : { r: 4, fill: s.color, stroke: CHART.surface, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: s.color, stroke: CHART.surface, strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {series.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {series.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5 text-sm text-gray-600">
              <span aria-hidden="true" className="inline-block h-0.5 w-3 shrink-0" style={{ backgroundColor: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
