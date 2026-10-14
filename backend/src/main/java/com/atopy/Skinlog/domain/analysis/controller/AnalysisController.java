package com.atopy.Skinlog.domain.analysis.controller;

import com.atopy.Skinlog.domain.analysis.dto.response.AnalysisSummaryResponse;
import com.atopy.Skinlog.domain.analysis.service.AnalysisService;
import com.atopy.Skinlog.global.response.ApiResponse;
import com.atopy.Skinlog.global.security.CurrentMember;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analysis")
@RequiredArgsConstructor
public class AnalysisController {

	private final AnalysisService analysisService;

	@GetMapping("/summary")
	public ApiResponse<AnalysisSummaryResponse> summary(
		@CurrentMember Long memberId,
		@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
		@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
		return ApiResponse.ok(analysisService.summary(memberId, startDate, endDate));
	}

}
