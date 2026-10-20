import { useMemo, useState } from 'react';
import { analysisApi } from '@/apis/analysis';
import { getAllRecords } from '@/apis/recordList';
import { visitApi } from '@/apis/visit';
import { getHistoricalWeather } from '@/apis/weather';
import OverlayTrendChart, { type AuxKey } from '@/components/analysis/OverlayTrendChart';
import PeriodInsights from '@/components/analysis/PeriodInsights';
import SelectedDayRecord from '@/components/analysis/SelectedDayRecord';
import TrendLineChart, { type TrendDatum } from '@/components/analysis/TrendLineChart';
import { SCORE_TICKS } from '@/components/analysis/chartTheme';
import PageHeader from '@/components/common/PageHeader';
import { ErrorMessage, LoadingMessage } from '@/components/common/StatusMessage';
import { useAsync } from '@/hooks/useAsync';
import type { BodyPart } from '@/types/record';
import {
  BODY_MAP_PARTS,
  BODY_PART_LABELS,
  HUMIDITY_MAX,
  HUMIDITY_MIN,
  HUMIDITY_TICKS,
  SCORE_MAX,
  SCORE_MIN,
  TEMPERATURE_MAX,
  TEMPERATURE_MIN,
  TEMPERATURE_TICKS,
} from '@/utils/constants';
import { formatKoreanDate, today } from '@/utils/date';
import { eachDay, lastNDaysRange } from '@/utils/dateRange';
import { getErrorMessage } from '@/utils/errorMessage';
import { bodyPartScoreOf } from '@/utils/recordScore';
import { dDayLabel, daysUntil, visitCycle } from '@/utils/visit';

type Period = '7' | '30' | 'VISIT';
type Tab = 'overlay' | 'bodyPart' | 'weather';

const PERIODS: { value: Period; label: string }[] = [
  { value: '7', label: '7일' },
  { value: '30', label: '30일' },
  { value: 'VISIT', label: '재진 사이' },
];

const TABS: { value: Tab; label: string }[] = [
  { value: 'overlay', label: '전체' },
  { value: 'bodyPart', label: '부위별' },
  { value: 'weather', label: '날씨' },
];

const BODY_PART_OPTIONS = BODY_MAP_PARTS.map((value) => ({ value, label: BODY_PART_LABELS[value] }));

/**
 * 기간 필터를 날짜로 변환한다. '재진 사이'는 지난 재진 날부터 오늘까지(다음 재진 전까지 쌓인 기록)이고,
 * 지난 재진을 기록하지 않았으면 null이다.
 */
function periodToRange(period: Period, lastVisit: string | null) {
  if (period === 'VISIT') return lastVisit ? { startDate: lastVisit, endDate: today() } : null;
  return lastNDaysRange(Number(period));
}

/** 기록이 있는 날만 담긴 목록을 날짜별 연속 데이터로 펼친다. 기록 없는 날은 null (값을 채우지 않음). */
function toDailySeries(items: TrendDatum[], startDate: string, endDate: string) {
  const byDate = new Map(items.map((item) => [item.date, item]));
  return eachDay(startDate, endDate).map((date) => byDate.get(date) ?? { date, value: null, recordId: null });
}

export default function AnalysisPage() {
  const [period, setPeriod] = useState<Period>('30');
  const [tab, setTab] = useState<Tab>('overlay');
  const [bodyPart, setBodyPart] = useState<BodyPart>('FACE');
  // '전체' 탭에서 고통 지수 위에 겹쳐 볼 보조 지표. 한 번에 하나만 겹치고, 처음에는 고통 지수만 보여 준다.
  const [overlayKey, setOverlayKey] = useState<AuxKey | null>(null);
  // 그래프에서 누른 날. 화면을 옮기지 않고 그래프 아래에 그날 기록을 보여 준다.
  const [selected, setSelected] = useState<{ date: string; recordId: number } | null>(null);

  const visits = useAsync(visitApi.getList, []);
  const { lastVisit, nextVisit } = visitCycle(visits.data ?? [], today());
  const range = useMemo(() => periodToRange(period, lastVisit), [period, lastVisit]);
  const isVisitPeriod = period === 'VISIT';
  const isBodyPartTab = tab === 'bodyPart';
  const isWeatherTab = tab === 'weather';
  const isOverlayTab = tab === 'overlay';

  // /analysis/trends는 증상 하나씩만 주므로(명세 4-2) 기록 목록을 가공한다. 부위별 탭은 그 부위의 고통 점수를 쓴다.
  const records = useAsync(() => (range ? getAllRecords(range.startDate, range.endDate) : Promise.resolve([])), [range]);
  // 분석 요약: 그래프를 위로 올리고, 기록 부족 안내는 그래프 아래에, 인사이트는 접어서 그 아래에 둔다.
  const summary = useAsync(() => (range ? analysisApi.getSummary(range) : Promise.resolve(null)), [range]);

  const series = useMemo(() => {
    if (!range) return [];
    const items = (records.data ?? []).map((r) => ({
      date: r.recordDate,
      value: bodyPartScoreOf(r.skinConditions, bodyPart),
      recordId: r.recordId,
    }));
    return toDailySeries(items, range.startDate, range.endDate);
  }, [bodyPart, records.data, range]);

  const hasValue = series.some((d) => d.value !== null);

  const needsWeather = isWeatherTab || isOverlayTab;
  const weather = useAsync(
    () => (needsWeather && range ? getHistoricalWeather(range.startDate, range.endDate) : Promise.resolve({ locationLabel: '', points: [] })),
    [needsWeather, range],
  );
  const temperatureSeries: TrendDatum[] = useMemo(
    () => (weather.data?.points ?? []).map((p) => ({ date: p.date, value: p.temperature, recordId: null })),
    [weather.data],
  );
  const humiditySeries: TrendDatum[] = useMemo(
    () => (weather.data?.points ?? []).map((p) => ({ date: p.date, value: p.humidity, recordId: null })),
    [weather.data],
  );
  const hasWeather = temperatureSeries.some((d) => d.value !== null) || humiditySeries.some((d) => d.value !== null);

  // '전체' 탭용 고통 지수·수면 시간(날씨와 같은 날짜 범위를 써서 날짜가 맞물리게 한다).
  const overlayScoreSeries = useMemo(() => {
    if (!range) return [];
    const items = (records.data ?? []).map((r) => ({
      date: r.recordDate,
      value: r.painIndex ?? null,
      recordId: r.recordId,
    }));
    return toDailySeries(items, range.startDate, range.endDate);
  }, [records.data, range]);
  const overlaySleepSeries = useMemo(() => {
    if (!range) return [];
    const items = (records.data ?? []).map((r) => ({ date: r.recordDate, value: r.sleepHours ?? null, recordId: r.recordId }));
    return toDailySeries(items, range.startDate, range.endDate);
  }, [records.data, range]);

  // 다른 지표를 누르면 그 지표로 바꾸고, 켜진 지표를 다시 누르면 끈다.
  const toggleOverlayKey = (key: AuxKey) => setOverlayKey((prev) => (prev === key ? null : key));

  const selectDay = (datum: TrendDatum) => {
    if (datum.recordId !== null) setSelected({ date: datum.date, recordId: datum.recordId });
  };
  // 기간을 바꾸면 고른 날이 범위 밖일 수 있어 닫는다.
  const changePeriod = (value: Period) => {
    setPeriod(value);
    setSelected(null);
  };

  return (
    <>
      <PageHeader title="피부 변화" />

      <div className="flex flex-col gap-4 px-4 pt-4">
        <SegmentedControl options={PERIODS} value={period} onChange={changePeriod} ariaLabel="기간" />
        {isVisitPeriod && lastVisit && (
          <p className="-mt-2 text-sm text-gray-500">
            지난 재진 {formatKoreanDate(lastVisit)}부터 오늘까지
            {nextVisit && ` · 다음 재진 ${formatKoreanDate(nextVisit)} (${dDayLabel(daysUntil(nextVisit, today()))})`}
          </p>
        )}

        <section className="rounded-2xl border border-gray-200 p-4">
          <div role="tablist" aria-label="그래프 종류" className="mb-4 flex gap-1 border-b border-gray-100">
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={tab === t.value}
                onClick={() => setTab(t.value)}
                className={`-mb-px border-b-2 px-3 pb-2 font-bold ${
                  tab === t.value ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {isBodyPartTab && (
            <div className="mb-3 flex flex-col gap-2">
              <ChipGroup label="부위" options={BODY_PART_OPTIONS} value={bodyPart} onChange={setBodyPart} />
              <p className="text-sm text-gray-400">그 부위에 기록한 고통 점수예요.</p>
            </div>
          )}
          {isWeatherTab && (
            <p className="-mt-1 mb-3 text-sm text-gray-400">
              하루 평균 기온·습도예요.{weather.data?.locationLabel && ` (${weather.data.locationLabel} 기준)`}
            </p>
          )}

          {isVisitPeriod && !range ? (
            visits.loading ? (
              <LoadingMessage />
            ) : visits.error ? (
              <ErrorMessage message={getErrorMessage(visits.error)} onRetry={visits.reload} />
            ) : (
              <p className="py-12 text-center text-gray-400">
                홈에서 지난 재진 날짜를 기록하면
                <br />
                재진 사이 기록을 볼 수 있어요.
              </p>
            )
          ) : isOverlayTab ? (
            weather.loading || records.loading ? (
              <LoadingMessage />
            ) : weather.error ? (
              <ErrorMessage message={getErrorMessage(weather.error)} onRetry={weather.reload} />
            ) : records.error ? (
              <ErrorMessage message={getErrorMessage(records.error)} onRetry={records.reload} />
            ) : !records.data?.length ? (
              <p className="py-12 text-center text-gray-400">이 기간에 기록이 없어요.</p>
            ) : (
              <OverlayTrendChart
                key={period}
                pain={overlayScoreSeries}
                aux={{ sleep: overlaySleepSeries, temperature: temperatureSeries, humidity: humiditySeries }}
                active={overlayKey}
                onToggle={toggleOverlayKey}
              />
            )
          ) : isWeatherTab ? (
            weather.loading ? (
              <LoadingMessage />
            ) : weather.error ? (
              <ErrorMessage message={getErrorMessage(weather.error)} onRetry={weather.reload} />
            ) : !hasWeather ? (
              <p className="py-12 text-center text-gray-400">이 기간의 날씨 정보를 가져오지 못했어요.</p>
            ) : (
              <div className="flex flex-col gap-6">
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-500">온도</p>
                  <TrendLineChart
                    data={temperatureSeries}
                    domain={[TEMPERATURE_MIN, TEMPERATURE_MAX]}
                    ticks={TEMPERATURE_TICKS}
                    formatValue={(v) => `평균 기온 ${v}°C`}
                    ariaLabel="기온 변화 그래프"
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-500">습도</p>
                  <TrendLineChart
                    data={humiditySeries}
                    domain={[HUMIDITY_MIN, HUMIDITY_MAX]}
                    ticks={HUMIDITY_TICKS}
                    formatValue={(v) => `평균 습도 ${v}%`}
                    ariaLabel="습도 변화 그래프"
                  />
                </div>
              </div>
            )
          ) : records.loading ? (
            <LoadingMessage />
          ) : records.error ? (
            <ErrorMessage message={getErrorMessage(records.error)} onRetry={records.reload} />
          ) : !hasValue ? (
            <p className="py-12 text-center text-gray-400">이 기간에 기록이 없어요.</p>
          ) : (
            <TrendLineChart
              data={series}
              domain={[SCORE_MIN, SCORE_MAX]}
              ticks={SCORE_TICKS}
              formatValue={(v) => `${BODY_PART_LABELS[bodyPart]} 고통 점수 ${v}점`}
              onPointClick={selectDay}
              ariaLabel="부위별 고통 점수 변화 그래프"
            />
          )}

          {!isWeatherTab && !isOverlayTab && hasValue && !records.loading && !records.error && (
            <p className="mt-3 text-sm text-gray-400">날짜를 누르면 그래프 아래에서 그날 기록을 볼 수 있어요.</p>
          )}
          {!isWeatherTab && !isOverlayTab && summary.data && !summary.data.availableForComparison && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              아직 기록이 부족해요 (이 기간 {summary.data.recordCount}일). 7일 이상 기록하면 피부 변화를 비교해 드릴게요.
            </p>
          )}
        </section>

        {!isWeatherTab && !isOverlayTab && summary.data?.availableForComparison && (
          <PeriodInsights key={period} insights={summary.data.insights} />
        )}
      </div>

      {selected && (
        <SelectedDayRecord
          key={selected.recordId}
          date={selected.date}
          recordId={selected.recordId}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="grid grid-cols-3 rounded-xl bg-gray-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-lg py-2.5 font-bold ${
            value === option.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-9 shrink-0 text-sm font-medium text-gray-500">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex gap-1.5 overflow-x-auto pb-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
              value === option.value ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
