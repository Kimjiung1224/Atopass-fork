package com.atopy.Atopass.domain.visit.dto.response;

import com.atopy.Atopass.domain.visit.entity.ClinicVisit;
import java.time.LocalDate;

public record ClinicVisitResponse(
	Long visitId,
	LocalDate visitDate
) {

	public static ClinicVisitResponse from(ClinicVisit visit) {
		return new ClinicVisitResponse(visit.getId(), visit.getVisitDate());
	}

}
