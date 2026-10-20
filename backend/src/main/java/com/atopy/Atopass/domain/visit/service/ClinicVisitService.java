package com.atopy.Atopass.domain.visit.service;

import com.atopy.Atopass.domain.member.repository.MemberRepository;
import com.atopy.Atopass.domain.visit.dto.request.ClinicVisitCreateRequest;
import com.atopy.Atopass.domain.visit.dto.response.ClinicVisitResponse;
import com.atopy.Atopass.domain.visit.entity.ClinicVisit;
import com.atopy.Atopass.domain.visit.repository.ClinicVisitRepository;
import com.atopy.Atopass.global.exception.BusinessException;
import com.atopy.Atopass.global.exception.ErrorCode;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 피부과 재진 날짜 기록. 지난 재진·다음 재진 계산은 오늘 날짜를 아는 화면에서 한다. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClinicVisitService {

	private final ClinicVisitRepository visitRepository;
	private final MemberRepository memberRepository;

	/** 날짜 오름차순 */
	public List<ClinicVisitResponse> list(Long memberId) {
		return visitRepository.findByMemberIdOrderByVisitDateAsc(memberId).stream()
			.map(ClinicVisitResponse::from)
			.toList();
	}

	@Transactional
	public ClinicVisitResponse create(Long memberId, ClinicVisitCreateRequest request) {
		if (visitRepository.existsByMemberIdAndVisitDate(memberId, request.visitDate())) {
			throw new BusinessException(ErrorCode.VISIT_ALREADY_EXISTS);
		}
		ClinicVisit visit = visitRepository.save(
			new ClinicVisit(memberRepository.getReferenceById(memberId), request.visitDate()));
		return ClinicVisitResponse.from(visit);
	}

	@Transactional
	public void delete(Long memberId, Long visitId) {
		ClinicVisit visit = visitRepository.findByIdAndMemberId(visitId, memberId)
			.orElseThrow(() -> new BusinessException(ErrorCode.VISIT_NOT_FOUND));
		visitRepository.delete(visit);
	}

}
