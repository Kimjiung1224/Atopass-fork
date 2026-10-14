package com.atopy.Skinlog.domain.report.service;

import com.atopy.Skinlog.domain.record.entity.BodyPart;
import com.atopy.Skinlog.domain.record.entity.OutdoorActivity;
import com.atopy.Skinlog.domain.record.entity.Symptom;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * PDF에 들어갈 내용. DB 엔티티와 분리해 두어 PDF 만드는 부분을 DB 없이 테스트할 수 있다.
 * 사용자가 기록하지 않은 값은 null이며, 임의의 값으로 채우지 않는다.
 * 기간 전체를 요약하지 않고, 증상이 갑자기 심해진 날과 그 무렵의 생활을 중심으로 보여 준다.
 *
 * @param includePhotos 사진 포함을 요청했는지
 * @param flareDays 증상이 갑자기 심해진 날 (날짜 오름차순)
 */
record ReportContent(
	LocalDate startDate,
	LocalDate endDate,
	LocalDate generatedDate,
	int recordCount,
	boolean includePhotos,
	List<FlareDay> flareDays,
	List<DayEntry> days,
	LifestyleSummary lifestyle
) {

	/** 같은 부위·증상이 직전 기록보다 크게 오른 것 */
	record ScoreJump(
		BodyPart bodyPart,
		Symptom symptom,
		LocalDate previousDate,
		int previousScore,
		int score
	) {
	}

	/**
	 * 증상이 갑자기 심해진 날.
	 *
	 * @param dayBefore 바로 전날의 기록. 전날 기록이 없으면 null
	 */
	record FlareDay(
		DayEntry day,
		DayEntry dayBefore,
		List<ScoreJump> jumps
	) {
	}

	/** 하루의 기록 */
	record DayEntry(
		LocalDate date,
		Map<BodyPart, Map<Symptom, Integer>> conditions,
		BigDecimal sleepHours,
		Boolean alcohol,
		OutdoorActivity outdoorActivity,
		String notes,
		List<ReportPhoto> photos
	) {
	}

	/** 기간 내 수면·생활 기록 요약. 기록한 날만 센다. 특이점을 평소와 비교하는 기준으로 쓴다. */
	record LifestyleSummary(
		Double averageSleepHours,
		int sleepRecordedDays,
		int alcoholDays,
		int alcoholRecordedDays,
		Map<OutdoorActivity, Integer> outdoorDays
	) {
	}

}
