package com.atopy.Skinlog.domain.chatbot.llm;

import com.atopy.Skinlog.domain.chatbot.entity.ChatRole;

/** LLM에 보내는 대화 한 턴 */
public record ChatTurn(ChatRole role, String content) {
}
