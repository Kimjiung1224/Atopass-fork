package com.atopy.Skinlog.domain.record.dto.response;

import com.atopy.Skinlog.domain.record.entity.BodyPart;
import com.atopy.Skinlog.domain.record.entity.SkinCondition;
import com.atopy.Skinlog.domain.record.entity.Symptom;
import com.atopy.Skinlog.domain.record.entity.SymptomScore;
import java.util.EnumMap;
import java.util.Map;

public record SkinConditionResponse(BodyPart bodyPart, SymptomsResponse symptoms) {

	public static SkinConditionResponse from(SkinCondition condition) {
		Map<Symptom, Integer> scores = new EnumMap<>(Symptom.class);
		for (SymptomScore score : condition.getScores()) {
			scores.put(score.getSymptom(), score.getScore());
		}
		return new SkinConditionResponse(condition.getBodyPart(), SymptomsResponse.from(scores));
	}

}
