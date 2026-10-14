package com.atopy.Skinlog.domain.chatbot.dto.response;

import com.atopy.Skinlog.domain.chatbot.entity.ChatMode;
import com.atopy.Skinlog.domain.chatbot.entity.ChatSession;

public record ChatSessionResponse(String sessionId, ChatMode mode) {

	public static ChatSessionResponse from(ChatSession session) {
		return new ChatSessionResponse(session.getId(), session.getMode());
	}

}
