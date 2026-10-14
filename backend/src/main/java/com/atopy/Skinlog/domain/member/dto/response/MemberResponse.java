package com.atopy.Skinlog.domain.member.dto.response;

import com.atopy.Skinlog.domain.member.entity.Member;

public record MemberResponse(Long memberId, String email, String nickname) {

	public static MemberResponse from(Member member) {
		return new MemberResponse(member.getId(), member.getEmail(), member.getNickname());
	}

}
