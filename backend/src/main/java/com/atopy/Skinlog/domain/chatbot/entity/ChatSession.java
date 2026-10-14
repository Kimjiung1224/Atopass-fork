package com.atopy.Skinlog.domain.chatbot.entity;

import com.atopy.Skinlog.domain.member.entity.Member;
import com.atopy.Skinlog.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 챗봇 대화 세션. 날짜 하나당 하나이며, 기록을 저장(확정)하면 닫힌다.
 * draft에는 확정 전 기록 초안(JSON)을 보관한다.
 */
@Getter
@Entity
@Table(name = "chatbot_sessions",
	indexes = @Index(name = "idx_chatbot_sessions_member_date", columnList = "member_id, record_date"))
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatSession extends BaseTimeEntity {

	@Id
	@Column(length = 36)
	private String id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;

	@Column(nullable = false)
	private LocalDate recordDate;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 10)
	private ChatMode mode;

	/** 확정 전 기록 초안(JSON). 질의 모드에서는 비어 있다. */
	@Column(columnDefinition = "text")
	private String draft;

	/** 직접 입력을 연속으로 해석하지 못한 횟수. 해석에 성공하면 0으로 돌아간다. */
	@Column(nullable = false)
	private int failCount;

	/** 기록을 저장해 더 이상 대화할 수 없으면 true */
	@Column(nullable = false)
	private boolean closed;

	public static ChatSession open(Member member, LocalDate recordDate, ChatMode mode) {
		ChatSession session = new ChatSession();
		session.id = UUID.randomUUID().toString();
		session.member = member;
		session.recordDate = recordDate;
		session.mode = mode;
		return session;
	}

	public void updateTurn(String draft, int failCount) {
		this.draft = draft;
		this.failCount = failCount;
	}

	public void close() {
		this.closed = true;
	}

}
