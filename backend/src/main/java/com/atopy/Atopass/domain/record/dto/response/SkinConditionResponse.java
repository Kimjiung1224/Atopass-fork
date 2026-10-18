package com.atopy.Atopass.domain.record.dto.response;

import com.atopy.Atopass.domain.record.entity.BodyPart;
import com.atopy.Atopass.domain.record.entity.SkinCondition;
import com.atopy.Atopass.domain.record.entity.SkinSign;
import com.atopy.Atopass.domain.record.entity.Symptom;
import com.atopy.Atopass.domain.record.entity.SymptomScore;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/** 부위별 증상. skinSigns는 그 부위에 나타난 증상이며 없으면 빈 배열이다. */
public record SkinConditionResponse(BodyPart bodyPart, SymptomsResponse symptoms, List<SkinSign> skinSigns) {

	public static SkinConditionResponse from(SkinCondition condition) {
		Map<Symptom, Integer> scores = new EnumMap<>(Symptom.class);
		for (SymptomScore score : condition.getScores()) {
			scores.put(score.getSymptom(), score.getScore());
		}
		return new SkinConditionResponse(condition.getBodyPart(), SymptomsResponse.from(scores),
			condition.getSkinSigns().stream().sorted().toList());
	}

}
