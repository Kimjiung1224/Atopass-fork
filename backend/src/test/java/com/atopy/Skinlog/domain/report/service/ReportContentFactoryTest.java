package com.atopy.Skinlog.domain.report.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.atopy.Skinlog.domain.record.entity.BodyPart;
import com.atopy.Skinlog.domain.record.entity.Symptom;
import com.atopy.Skinlog.domain.report.service.ReportContent.DayEntry;
import com.atopy.Skinlog.domain.report.service.ReportContent.FlareDay;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ReportContentFactoryTest {

	private static final LocalDate START = LocalDate.of(2026, 3, 1);

	@Test
	void 직전_기록보다_3점_이상_오른_날만_고른다() {
		List<FlareDay> flares = ReportContentFactory.flareDays(List.of(
			day(0, 2), day(1, 4), day(2, 7), day(3, 6)));

		assertThat(flares).hasSize(1);
		FlareDay flare = flares.get(0);
		assertThat(flare.day().date()).isEqualTo(START.plusDays(2));
		assertThat(flare.dayBefore().date()).isEqualTo(START.plusDays(1));
		assertThat(flare.jumps()).singleElement().satisfies(jump -> {
			assertThat(jump.previousScore()).isEqualTo(4);
			assertThat(jump.score()).isEqualTo(7);
		});
	}

	@Test
	void 기록이_비어_있던_날을_건너뛰면_직전_기록과_비교하고_전날은_없다() {
		List<FlareDay> flares = ReportContentFactory.flareDays(List.of(day(0, 2), day(3, 6)));

		assertThat(flares).singleElement().satisfies(flare -> {
			assertThat(flare.dayBefore()).isNull();
			assertThat(flare.jumps().get(0).previousDate()).isEqualTo(START);
		});
	}

	@Test
	void 기간_첫_기록과_처음_기록한_증상은_비교하지_않는다() {
		assertThat(ReportContentFactory.flareDays(List.of(day(0, 9)))).isEmpty();
	}

	private DayEntry day(int plusDays, int itching) {
		Map<BodyPart, Map<Symptom, Integer>> conditions = new EnumMap<>(BodyPart.class);
		conditions.put(BodyPart.ARM, new EnumMap<>(Map.of(Symptom.ITCHING, itching)));
		return new DayEntry(START.plusDays(plusDays), conditions, null, null, null, null, List.of());
	}

}
