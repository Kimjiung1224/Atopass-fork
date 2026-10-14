package com.atopy.Skinlog.domain.report.controller;

import com.atopy.Skinlog.domain.report.dto.request.ReportCreateRequest;
import com.atopy.Skinlog.domain.report.dto.response.ReportResponse;
import com.atopy.Skinlog.domain.report.service.ReportService;
import com.atopy.Skinlog.global.response.ApiResponse;
import com.atopy.Skinlog.global.security.CurrentMember;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 보고서 목록·상세 조회(GET /reports, GET /reports/{reportId})는 별도 작업에서 이 컨트롤러에 추가한다. */
@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

	private final ReportService reportService;

	@PostMapping
	public ResponseEntity<ApiResponse<ReportResponse>> create(
		@CurrentMember Long memberId, @Valid @RequestBody ReportCreateRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(ApiResponse.ok(reportService.create(memberId, request), "보고서가 생성되었습니다."));
	}

	/** 브라우저에서 바로 미리 볼 수 있도록 inline으로 내려준다. 건강 정보이므로 캐시하지 않는다. */
	@GetMapping("/{reportId}/file")
	public ResponseEntity<byte[]> file(@CurrentMember Long memberId, @PathVariable Long reportId) {
		ReportService.ReportFile file = reportService.download(memberId, reportId);
		return ResponseEntity.ok()
			.contentType(MediaType.APPLICATION_PDF)
			.header(HttpHeaders.CONTENT_DISPOSITION,
				ContentDisposition.inline().filename(file.fileName()).build().toString())
			.cacheControl(CacheControl.noStore())
			.body(file.content());
	}

}
