package com.atopy.Skinlog.domain.chatbot.llm;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * LLM(Claude) 설정. apiKey는 환경변수(ANTHROPIC_API_KEY)로만 주입한다.
 *
 * @param effort 응답 깊이(low, medium, high, xhigh, max). 비워 두면 모델 기본값을 쓴다.
 */
@ConfigurationProperties(prefix = "app.llm")
public record LlmProperties(
	String apiKey,
	@DefaultValue("claude-opus-5-5") String model,
	@DefaultValue("low") String effort,
	@DefaultValue("2048") long maxTokens,
	@DefaultValue("30") long timeoutSeconds
) {
}
