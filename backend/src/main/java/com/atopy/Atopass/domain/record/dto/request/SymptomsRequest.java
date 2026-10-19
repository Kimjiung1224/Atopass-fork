package com.atopy.Atopass.domain.record.dto.request;

import com.atopy.Atopass.domain.record.entity.Symptom;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import java.util.EnumMap;
import java.util.Map;

/** 부위 점수. 지금은 고통 점수(pain, 0~10) 하나다. */
public record SymptomsRequest(
	@Score Integer pain
) {

	/** 입력된(null이 아닌) 증상만 모은다. */
	public Map<Symptom, Integer> toScores() {
		Map<Symptom, Integer> scores = new EnumMap<>(Symptom.class);
		put(scores, Symptom.PAIN, pain);
		return scores;
	}

	@JsonIgnore
	@AssertTrue(message = "고통 점수를 입력해 주세요.")
	public boolean isAtLeastOneSymptom() {
		return !toScores().isEmpty();
	}

	private static void put(Map<Symptom, Integer> scores, Symptom symptom, Integer value) {
		if (value != null) {
			scores.put(symptom, value);
		}
	}

}
