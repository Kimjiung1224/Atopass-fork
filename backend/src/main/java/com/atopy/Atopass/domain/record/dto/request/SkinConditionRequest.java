package com.atopy.Atopass.domain.record.dto.request;

import com.atopy.Atopass.domain.record.entity.BodyPart;
import com.atopy.Atopass.domain.record.entity.SkinSign;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/** 부위별 증상. 고통 점수(symptoms.pain)와 그 부위에 나타난 증상(skinSigns, 없으면 생략)을 함께 받는다. */
public record SkinConditionRequest(
	@NotNull(message = "신체 부위를 입력해 주세요.")
	BodyPart bodyPart,

	@NotNull(message = "증상 점수를 입력해 주세요.")
	@Valid
	SymptomsRequest symptoms,

	List<@NotNull(message = "증상 항목이 비어 있습니다.") SkinSign> skinSigns
) {
}
