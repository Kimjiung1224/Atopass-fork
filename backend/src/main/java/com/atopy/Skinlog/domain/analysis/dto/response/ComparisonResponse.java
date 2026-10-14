package com.atopy.Skinlog.domain.analysis.dto.response;

import com.atopy.Skinlog.domain.record.dto.response.SkinConditionResponse;
import java.time.LocalDate;
import java.util.List;

public record ComparisonResponse(ComparisonSide dateA, ComparisonSide dateB) {

	/** 해당 날짜에 기록이 없으면 side 전체가 null이다. */
	public record ComparisonSide(LocalDate date, List<SkinConditionResponse> skinConditions) {
	}

}
