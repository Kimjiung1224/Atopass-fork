package com.atopy.Atopass.domain.visit.controller;

import com.atopy.Atopass.domain.visit.dto.request.ClinicVisitCreateRequest;
import com.atopy.Atopass.domain.visit.dto.response.ClinicVisitResponse;
import com.atopy.Atopass.domain.visit.service.ClinicVisitService;
import com.atopy.Atopass.global.response.ApiResponse;
import com.atopy.Atopass.global.security.CurrentMember;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/visits")
@RequiredArgsConstructor
public class ClinicVisitController {

	private final ClinicVisitService visitService;

	@GetMapping
	public ApiResponse<List<ClinicVisitResponse>> list(@CurrentMember Long memberId) {
		return ApiResponse.ok(visitService.list(memberId));
	}

	@PostMapping
	public ResponseEntity<ApiResponse<ClinicVisitResponse>> create(
		@CurrentMember Long memberId, @Valid @RequestBody ClinicVisitCreateRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(ApiResponse.ok(visitService.create(memberId, request), "재진 날짜가 저장되었습니다."));
	}

	@DeleteMapping("/{visitId}")
	public ResponseEntity<Void> delete(@CurrentMember Long memberId, @PathVariable Long visitId) {
		visitService.delete(memberId, visitId);
		return ResponseEntity.noContent().build();
	}

}
