package com.atopy.Atopass.domain.visit.entity;

import com.atopy.Atopass.domain.member.entity.Member;
import com.atopy.Atopass.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 피부과 재진(다시 진료받는) 날짜. 지난 재진과 다음 재진 사이를 한 주기로 보고
 * 홈의 D-day, 그래프·진료 참고용 기록의 기간으로 쓴다. 한 회원이 같은 날짜를 두 번 넣을 수 없다.
 */
@Getter
@Entity
@Table(name = "clinic_visits",
	uniqueConstraints = @UniqueConstraint(name = "uk_clinic_visits_member_date", columnNames = {"member_id", "visit_date"}))
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ClinicVisit extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;

	@Column(name = "visit_date", nullable = false)
	private LocalDate visitDate;

	public ClinicVisit(Member member, LocalDate visitDate) {
		this.member = member;
		this.visitDate = visitDate;
	}

}
