package com.atopy.Atopass.domain.visit.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/** 재진 날짜. 지난 날짜(이미 다녀온 재진)와 앞으로의 날짜 모두 넣을 수 있다. */
public record ClinicVisitCreateRequest(
	@NotNull(message = "재진 날짜를 입력해 주세요.")
	LocalDate visitDate
) {
}
