package com.atopy.Skinlog.domain.report.dto.response;

import java.util.List;
import org.springframework.data.domain.Page;

public record ReportPageResponse(
	List<ReportResponse> content,
	int page,
	int size,
	long totalElements,
	int totalPages
) {

	public static ReportPageResponse from(Page<ReportResponse> page) {
		return new ReportPageResponse(
			page.getContent(), page.getNumber(), page.getSize(),
			page.getTotalElements(), page.getTotalPages());
	}

}
