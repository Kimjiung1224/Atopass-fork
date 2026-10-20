import { useState } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ReferenceDot, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useIsDark } from '@/hooks/useIsDark';
import { SCORE_MAX, SCORE_MIN } from '@/utils/constants';
import { formatKoreanDate } from '@/utils/date';
import { formatMonthDay } from '@/utils/dateRange';
import { AUX_COLORS, CHART, CHART_DARK, PAIN_COLOR, SCORE_TICKS } from './chartTheme';

export type AuxKey = 'sleep' | 'temperature' | 'humidity';

type DailyValue = { date: string; value: number | null };

/** 보조 지표 표시 방법. near: 평균과 차이가 이보다 작으면 "평균 수준"으로 본다 */
const AUX_METRICS: { key: AuxKey; label: string; unit: string; digits: number; near: number; more: string; less: string }[] = [
  { key: 'sleep', label: '수면 시간', unit: '시간', digits: 1, near: 0.3, more: '많음', less: '적음' },
  { key: 'temperature', label: '기온', unit: '°C', digits: 1, near: 0.3, more: '높음', less: '낮음' },
  { key: 'humidity', label: '습도', unit: '%', digits: 0, near: 3, more: '높음', less: '낮음' },
];

interface Props {
  /** 날짜별 고통 지수. 기록 없는 날은 null. 이 날짜들이 그래프의 가로축이 된다 */
  pain: DailyValue[];
  aux: Record<AuxKey, DailyValue[]>;
  enabled: Set<AuxKey>;
  onToggle: (key: AuxKey) => void;
}

const round = (v: number, digits: number) => Number(v.toFixed(digits));

const painLevel = (v: number) => (v === 0 ? '없음' : v <= 3 ? '약함' : v <= 6 ? '보통' : '심함');

const valuesOf = (data: DailyValue[]) => data.map((d) => d.value).filter((v): v is number => v !== null);

const average = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

/** 기간 내 최소~최대를 0~1로 바꾼다. 값이 하나뿐이거나 전부 같으면 가운데(0.5)에 둔다 */
function normalizer(data: DailyValue[]) {
  const values = valuesOf(data);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return (v: number | null) => (v === null ? null : max === min ? 0.5 : (v - min) / (max - min));
}

/**
 * '전체' 탭 그래프. 고통 지수(0~10)를 굵은 빨간 선으로 크게 그리고,
 * 수면 시간·기온·습도는 기간 내 상대 위치(0~1)로 바꿔 보이지 않는 보조 축에 얇은 점선으로 겹친다.
 * 그래프를 누르거나 마우스를 올린 날의 실제 값은 그래프 아래에 보여 준다(기본 툴팁 대신).
 */
export default function OverlayTrendChart({ pain, aux, enabled, onToggle }: Props) {
  const isDark = useIsDark();
  const theme = isDark ? CHART_DARK : CHART;
  const painColor = isDark ? PAIN_COLOR.dark : PAIN_COLOR.light;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const auxByDate = Object.fromEntries(
    AUX_METRICS.map((m) => [m.key, new Map(aux[m.key].map((d) => [d.date, d.value]))]),
  ) as Record<AuxKey, Map<string, number | null>>;
  // 날씨는 그래프 날짜와 어긋날 수 있어 고통 지수 날짜에 맞춰 다시 줄을 세운 뒤 정규화한다.
  const aligned = Object.fromEntries(
    AUX_METRICS.map((m) => [m.key, pain.map((p) => ({ date: p.date, value: auxByDate[m.key].get(p.date) ?? null }))]),
  ) as Record<AuxKey, DailyValue[]>;
  const normalize = Object.fromEntries(AUX_METRICS.map((m) => [m.key, normalizer(aligned[m.key])])) as Record<
    AuxKey,
    (v: number | null) => number | null
  >;
  const data = pain.map((p, i) => ({
    date: p.date,
    pain: p.value,
    sleep: normalize.sleep(aligned.sleep[i].value),
    temperature: normalize.temperature(aligned.temperature[i].value),
    humidity: normalize.humidity(aligned.humidity[i].value),
  }));

  const painValues = valuesOf(pain);
  const painAverage = average(painValues);
  // 최고값이 여러 날이면 가장 최근 날을 보여 준다.
  const peak = pain.reduce<DailyValue | null>(
    (best, d) => (d.value !== null && (best === null || d.value >= (best.value ?? -Infinity)) ? d : best),
    null,
  );
  const painDays = painValues.filter((v) => v >= 1).length;

  const shownDate = selectedDate && pain.some((p) => p.date === selectedDate) ? selectedDate : (pain.at(-1)?.date ?? null);
  const shownPain = pain.find((p) => p.date === shownDate)?.value ?? null;

  const pick = (state: { activeLabel?: unknown } | null | undefined) => {
    if (typeof state?.activeLabel === 'string') setSelectedDate(state.activeLabel);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <SummaryCard label="평균 고통 지수" value={painAverage === null ? '-' : painAverage.toFixed(1)} />
        <SummaryCard
          label="최고값"
          value={peak?.value != null ? String(peak.value) : '-'}
          sub={peak ? formatMonthDay(peak.date) : undefined}
        />
        <SummaryCard label="통증 있는 날" value={`${painDays}일`} />
      </div>

      <div role="group" aria-label="그래프에 겹쳐 볼 지표" className="flex flex-wrap gap-1.5">
        <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:bg-gray-800 dark:text-gray-100">
          <LineIcon color={painColor} />
          고통 지수
        </span>
        {AUX_METRICS.map((m) => {
          const isOn = enabled.has(m.key);
          return (
            <button
              key={m.key}
              type="button"
              aria-pressed={isOn}
              onClick={() => onToggle(m.key)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${
                isOn
                  ? 'border-gray-300 text-gray-800 dark:border-gray-600 dark:text-gray-100'
                  : 'border-gray-200 text-gray-400 opacity-50 dark:border-gray-700 dark:text-gray-500'
              }`}
            >
              <LineIcon color={AUX_COLORS[m.key]} dashed />
              {m.label}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-gray-400 dark:text-gray-400">
        왼쪽 눈금은 고통 지수(0–10)예요. 점선 지표는 기간 내 상대 위치로 겹쳤고, 실제 값은 아래에서 볼 수 있어요.
      </p>

      <div
        className="h-64 [&_*:focus:not(:focus-visible)]:outline-none"
        role="img"
        aria-label="고통 지수와 선택한 지표를 겹친 변화 그래프"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -20 }} onMouseMove={pick} onClick={pick}>
            <CartesianGrid vertical={false} stroke={theme.grid} />
            <XAxis dataKey="date" tickFormatter={formatMonthDay} tickLine={false} axisLine={false} minTickGap={24} tick={theme.tick} />
            <YAxis
              yAxisId="score"
              domain={[SCORE_MIN, SCORE_MAX]}
              ticks={SCORE_TICKS}
              interval={0}
              tickLine={false}
              axisLine={false}
              tick={theme.tick}
            />
            {/* 보조 지표(0~1)가 그래프 위아래 끝에 붙지 않게 조금 여유를 둔다 */}
            <YAxis yAxisId="aux" orientation="right" domain={[-0.05, 1.05]} hide />
            {AUX_METRICS.filter((m) => enabled.has(m.key)).map((m) => (
              <Line
                key={m.key}
                yAxisId="aux"
                type="monotone"
                dataKey={m.key}
                name={m.label}
                stroke={AUX_COLORS[m.key]}
                strokeWidth={1.5}
                strokeOpacity={0.6}
                strokeDasharray="4 3"
                dot={false}
                activeDot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
            {shownDate && <ReferenceLine yAxisId="score" x={shownDate} stroke={theme.cursor} strokeDasharray="3 3" />}
            {/* 고통 지수는 맨 마지막에 그려 항상 다른 선 위에 오게 한다 */}
            <Area
              yAxisId="score"
              type="monotone"
              dataKey="pain"
              name="고통 지수"
              stroke={painColor}
              strokeWidth={3}
              fill={painColor}
              fillOpacity={0.1}
              connectNulls={false}
              dot={{ r: data.length > 45 ? 1.5 : 2.5, fill: painColor, stroke: painColor, strokeWidth: 0 }}
              activeDot={false}
              isAnimationActive={false}
            />
            {shownDate && shownPain !== null && (
              <ReferenceDot yAxisId="score" x={shownDate} y={shownPain} r={5} fill={painColor} stroke={theme.surface} strokeWidth={2} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {shownDate && (
        <div aria-live="polite" className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm dark:bg-gray-800">
          <p className="mb-1 font-semibold text-gray-900 dark:text-gray-100">{formatKoreanDate(shownDate)}</p>
          <p className="text-gray-700 dark:text-gray-200">
            고통 지수{' '}
            {shownPain === null ? (
              <span className="text-gray-400">기록 없음</span>
            ) : (
              <>
                <span className="font-bold" style={{ color: painColor }}>
                  {shownPain}/10
                </span>{' '}
                · {painLevel(shownPain)}
              </>
            )}
          </p>
          {AUX_METRICS.filter((m) => enabled.has(m.key)).map((m) => {
            const value = auxByDate[m.key].get(shownDate) ?? null;
            const avg = average(valuesOf(aligned[m.key]));
            const diff = value === null || avg === null ? null : value - avg;
            return (
              <p key={m.key} className="text-gray-700 dark:text-gray-200">
                {m.label}{' '}
                {value === null ? (
                  <span className="text-gray-400">정보 없음</span>
                ) : (
                  <>
                    {round(value, m.digits)}
                    {m.unit}
                    {diff !== null && (
                      <span className="text-gray-500 dark:text-gray-400">
                        {' '}
                        (
                        {Math.abs(diff) < m.near
                          ? '평균 수준'
                          : `평균보다 ${round(Math.abs(diff), m.digits)}${m.unit} ${diff > 0 ? m.more : m.less}`}
                        )
                      </span>
                    )}
                  </>
                )}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-2.5 py-2 dark:bg-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
        {value}
        {sub && <span className="ml-1 text-xs font-medium text-gray-500 dark:text-gray-400">{sub}</span>}
      </p>
    </div>
  );
}

/** 칩 앞의 선 모양 아이콘. 고통 지수는 실선, 보조 지표는 점선 */
function LineIcon({ color, dashed = false }: { color: string; dashed?: boolean }) {
  return (
    <svg aria-hidden="true" width="16" height="4" className="shrink-0">
      <line x1="1" y1="2" x2="15" y2="2" stroke={color} strokeWidth={dashed ? 2 : 3} strokeLinecap={dashed ? 'butt' : 'round'} strokeDasharray={dashed ? '3 3' : undefined} />
    </svg>
  );
}
