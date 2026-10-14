package com.atopy.Skinlog.domain.member.entity;

import com.atopy.Skinlog.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "members")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String email;

	/** BCrypt 해시. 원문은 저장하지 않는다. */
	@Column(nullable = false)
	private String password;

	@Column(nullable = false, length = 50)
	private String nickname;

	@Builder
	private Member(String email, String password, String nickname) {
		this.email = email;
		this.password = password;
		this.nickname = nickname;
	}

	public void changeNickname(String nickname) {
		this.nickname = nickname;
	}

	public void changePassword(String encodedPassword) {
		this.password = encodedPassword;
	}

}
