package com.atopy.Atopass.domain.record.dto.response;

import com.atopy.Atopass.domain.record.entity.Symptom;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

/** 부위 점수. 지금은 고통 점수(pain) 하나이며, 없으면 생략한다. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record SymptomsResponse(
	Integer pain
) {

	public static SymptomsResponse from(Map<Symptom, Integer> scores) {
		return new SymptomsResponse(scores.get(Symptom.PAIN));
	}

}
