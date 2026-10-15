package com.atopy.Skinlog.domain.report.service;

import com.atopy.Skinlog.domain.record.entity.BodyPart;
import com.atopy.Skinlog.domain.record.entity.OutdoorActivity;
import com.atopy.Skinlog.domain.record.entity.SkinCondition;
import com.atopy.Skinlog.domain.record.entity.SkinRecord;
import com.atopy.Skinlog.domain.record.entity.Symptom;
import com.atopy.Skinlog.domain.record.entity.SymptomScore;
import com.atopy.Skinlog.domain.report.service.ReportContent.DayEntry;
import com.atopy.Skinlog.domain.report.service.ReportContent.FlareDay;
import com.atopy.Skinlog.domain.report.service.ReportContent.LifestyleSummary;
import com.atopy.Skinlog.domain.report.service.ReportContent.ScoreJump;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** 선택한 기간의 기록을 보고서 내용으로 정리한다. 기간 안에 있는 기록만 사용한다. */
@Component
@RequiredArgsConstructor
class ReportContentFactory {

	private final ReportPhotoSource photoSource;

	/** 같은 부위·증상이 직전 기록보다 이만큼 이상 오르면 "갑자기 심해진 날"로 본다 */
	static final int FLARE_JUMP = 3;

	/** @param records 기간 내 기록. 날짜 오름차순이어야 한다. */
	ReportContent create(List<SkinRecord> records, LocalDate startDate, LocalDate endDate,
		boolean includePhotos, LocalDate today) {
		List<DayEntry> days = records.stream().map(r -> dayEntry(r, includePhotos)).toList();
		return new ReportContent(startDate, endDate, today, records.size(), includePhotos,
			flareDays(days), days, lifestyleSummary(records));
	}

	/**
	 * 부위·증상마다 직전에 기록한 점수와 비교해 {@link #FLARE_JUMP}점 이상 오른 날을 고른다.
	 * 기간 첫 기록은 비교할 직전 기록이 없어 고르지 않는다.
	 */
	static List<FlareDay> flareDays(List<DayEntry> days) {
		record Last(LocalDate date, int score) {
		}
		Map<BodyPart, Map<Symptom, Last>> last = new EnumMap<>(BodyPart.class);
		List<FlareDay> flares = new ArrayList<>();
		DayEntry previous = null;
		for (DayEntry day : days) {
			List<ScoreJump> jumps = new ArrayList<>();
			day.conditions().forEach((bodyPart, scores) -> scores.forEach((symptom, score) -> {
				Last before = last.computeIfAbsent(bodyPart, k -> new EnumMap<>(Symptom.class)).get(symptom);
				if (before != null && score - before.score() >= FLARE_JUMP) {
					jumps.add(new ScoreJump(bodyPart, symptom, before.date(), before.score(), score));
				}
				last.get(bodyPart).put(symptom, new Last(day.date(), score));
			}));
			if (!jumps.isEmpty()) {
				jumps.sort(Comparator.comparingInt((ScoreJump j) -> j.score() - j.previousScore()).reversed());
				boolean hasDayBefore = previous != null && previous.date().equals(day.date().minusDays(1));
				flares.add(new FlareDay(day, hasDayBefore ? previous : null, jumps));
			}
			previous = day;
		}
		return flares;
	}

	private DayEntry dayEntry(SkinRecord record, boolean includePhotos) {
		Map<BodyPart, Map<Symptom, Integer>> conditions = new EnumMap<>(BodyPart.class);
		for (SkinCondition condition : record.getConditions()) {
			Map<Symptom, Integer> scores = new EnumMap<>(Symptom.class);
			for (SymptomScore score : condition.getScores()) {
				scores.put(score.getSymptom(), score.getScore());
			}
			conditions.put(condition.getBodyPart(), scores);
		}
		List<ReportPhoto> photos = includePhotos ? photoSource.photosOf(record.getId()) : List.of();
		return new DayEntry(record.getRecordDate(), conditions, record.getSleepHours(),
			record.getAlcohol(), record.getOutdoorActivity(), record.getNotes(), photos);
	}

	private LifestyleSummary lifestyleSummary(List<SkinRecord> records) {
		List<BigDecimal> sleeps = records.stream().map(SkinRecord::getSleepHours).filter(h -> h != null).toList();
		Double averageSleep = sleeps.isEmpty() ? null
			: sleeps.stream().mapToDouble(BigDecimal::doubleValue).average().orElse(0);
		int alcoholRecorded = (int) records.stream().filter(r -> r.getAlcohol() != null).count();
		int alcoholDays = (int) records.stream().filter(r -> Boolean.TRUE.equals(r.getAlcohol())).count();
		Map<OutdoorActivity, Integer> outdoor = new EnumMap<>(OutdoorActivity.class);
		for (SkinRecord record : records) {
			if (record.getOutdoorActivity() != null) {
				outdoor.merge(record.getOutdoorActivity(), 1, Integer::sum);
			}
		}
		return new LifestyleSummary(averageSleep, sleeps.size(), alcoholDays, alcoholRecorded, outdoor);
	}

}
