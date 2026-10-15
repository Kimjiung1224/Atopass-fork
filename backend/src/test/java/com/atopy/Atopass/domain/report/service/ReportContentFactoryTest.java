package com.atopy.Atopass.domain.report.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.atopy.Atopass.domain.record.entity.BodyPart;
import com.atopy.Atopass.domain.record.entity.Symptom;
import com.atopy.Atopass.domain.report.service.ReportContent.DayEntry;
import com.atopy.Atopass.domain.report.service.ReportContent.FlareDay;
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

	@Test
	void 고통_지수가_3점_이상_오르면_부위별_증상이_없어도_심해진_날이다() {
		List<FlareDay> flares = ReportContentFactory.flareDays(List.of(
			painDay(0, 2), painDay(1, 3), painDay(2, 6), painDay(3, 5)));

		assertThat(flares).singleElement().satisfies(flare -> {
			assertThat(flare.day().date()).isEqualTo(START.plusDays(2));
			assertThat(flare.jumps()).singleElement().satisfies(jump -> {
				assertThat(jump.bodyPart()).isNull();
				assertThat(jump.symptom()).isNull();
				assertThat(jump.previousScore()).isEqualTo(3);
				assertThat(jump.score()).isEqualTo(6);
			});
		});
	}

	@Test
	void 고통_지수가_0에서_3으로_올라도_심해진_날이다() {
		// 0은 기록한 값이다. 기록하지 않은 날로 건너뛰면 이 상승을 놓친다.
		List<FlareDay> flares = ReportContentFactory.flareDays(List.of(painDay(0, 0), painDay(1, 3)));

		assertThat(flares).singleElement().satisfies(flare ->
			assertThat(flare.jumps().get(0).previousScore()).isZero());
	}

	@Test
	void 고통_지수는_기록하지_않은_날을_건너뛰고_직전_기록과_비교한다() {
		List<FlareDay> flares = ReportContentFactory.flareDays(List.of(
			painDay(0, 1), day(1, 4), painDay(2, 5)));

		assertThat(flares).singleElement().satisfies(flare -> {
			assertThat(flare.day().date()).isEqualTo(START.plusDays(2));
			assertThat(flare.jumps().get(0).previousDate()).isEqualTo(START);
		});
	}

	private DayEntry painDay(int plusDays, int painIndex) {
		return new DayEntry(START.plusDays(plusDays), new EnumMap<>(BodyPart.class), null, null, null, null,
			List.of(), painIndex, null, List.of());
	}

	private DayEntry day(int plusDays, int itching) {
		Map<BodyPart, Map<Symptom, Integer>> conditions = new EnumMap<>(BodyPart.class);
		conditions.put(BodyPart.ARM, new EnumMap<>(Map.of(Symptom.ITCHING, itching)));
		return new DayEntry(START.plusDays(plusDays), conditions, null, null, null, null, List.of());
	}

}
