package com.atopy.Atopass.domain.visit.repository;

import com.atopy.Atopass.domain.visit.entity.ClinicVisit;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClinicVisitRepository extends JpaRepository<ClinicVisit, Long> {

	List<ClinicVisit> findByMemberIdOrderByVisitDateAsc(Long memberId);

	boolean existsByMemberIdAndVisitDate(Long memberId, LocalDate visitDate);

	/** 다른 회원의 재진 날짜는 존재하지 않는 것처럼 조회되지 않는다. */
	Optional<ClinicVisit> findByIdAndMemberId(Long id, Long memberId);

}
