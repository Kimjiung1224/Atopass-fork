package com.atopy.Skinlog.domain.analysis.dto.response;

import com.atopy.Skinlog.domain.record.entity.BodyPart;
import com.atopy.Skinlog.domain.record.entity.Symptom;
import java.time.LocalDate;
import java.util.List;

public record TrendResponse(BodyPart bodyPart, Symptom symptom, List<TrendPoint> points) {

	public record TrendPoint(LocalDate date, int score) {
	}

}
