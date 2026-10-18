package com.atopy.Atopass.domain.record.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** 부위별 증상 하나의 점수(0~10). 기록하지 않은 증상은 행을 만들지 않는다. */
@Getter
@Entity
@Table(name = "symptom_scores", uniqueConstraints = @UniqueConstraint(
	name = "uk_symptom_scores_condition_symptom", columnNames = {"skin_condition_id", "symptom"}))
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SymptomScore {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "skin_condition_id", nullable = false)
	private SkinCondition skinCondition;

	// 값 목록이 바뀌어도 저장되도록 MySQL ENUM 대신 문자열 칸으로 둔다. (SymptomMigration 참고)
	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	@Column(nullable = false, length = 30)
	private Symptom symptom;

	@Column(nullable = false)
	private int score;

	SymptomScore(SkinCondition skinCondition, Symptom symptom, int score) {
		this.skinCondition = skinCondition;
		this.symptom = symptom;
		this.score = score;
	}

	void changeScore(int score) {
		this.score = score;
	}

}
