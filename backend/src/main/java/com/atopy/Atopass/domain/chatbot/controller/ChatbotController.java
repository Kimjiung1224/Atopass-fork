package com.atopy.Atopass.domain.chatbot.controller;

import com.atopy.Atopass.domain.chatbot.dto.request.ChatChoiceRequest;
import com.atopy.Atopass.domain.chatbot.dto.request.ChatMessageRequest;
import com.atopy.Atopass.domain.chatbot.dto.request.ChatRecordSaveRequest;
import com.atopy.Atopass.domain.chatbot.dto.request.CreateSessionRequest;
import com.atopy.Atopass.domain.chatbot.dto.response.ChatDraftStateResponse;
import com.atopy.Atopass.domain.chatbot.dto.response.ChatMessagesResponse;
import com.atopy.Atopass.domain.chatbot.dto.response.ChatReplyResponse;
import com.atopy.Atopass.domain.chatbot.dto.response.ChatSessionResponse;
import com.atopy.Atopass.domain.chatbot.service.ChatbotService;
import com.atopy.Atopass.domain.record.dto.response.RecordCreatedResponse;
import com.atopy.Atopass.global.response.ApiResponse;
import com.atopy.Atopass.global.security.CurrentMember;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chatbot/sessions")
@RequiredArgsConstructor
public class ChatbotController {

	private final ChatbotService chatbotService;

	@PostMapping
	public ResponseEntity<ApiResponse<ChatSessionResponse>> createSession(
		@CurrentMember Long memberId, @Valid @RequestBody CreateSessionRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(ApiResponse.ok(chatbotService.createSession(memberId, request.mode())));
	}

	@PostMapping("/{sessionId}/messages")
	public ApiResponse<ChatReplyResponse> sendMessage(
		@CurrentMember Long memberId, @PathVariable String sessionId,
		@Valid @RequestBody ChatMessageRequest request) {
		return ApiResponse.ok(chatbotService.sendMessage(memberId, sessionId, request.message().trim()));
	}

	/** 선택지 버튼으로 고른 답. LLM을 부르지 않으므로 이용 한도에 세지 않는다. */
	@PostMapping("/{sessionId}/choices")
	public ApiResponse<ChatReplyResponse> answerChoice(
		@CurrentMember Long memberId, @PathVariable String sessionId,
		@Valid @RequestBody ChatChoiceRequest request) {
		return ApiResponse.ok(chatbotService.answerChoice(memberId, sessionId, request));
	}

	/**
	 * 기록 화면의 고통 지수·수면 시간 막대로 직접 고친 값. 지금 묻는 항목이 아니어도 언제든 반영한다.
	 * LLM을 부르지 않으므로 이용 한도에 세지 않는다.
	 */
	@PostMapping("/{sessionId}/values")
	public ApiResponse<ChatReplyResponse> adjustValue(
		@CurrentMember Long memberId, @PathVariable String sessionId,
		@Valid @RequestBody ChatChoiceRequest request) {
		return ApiResponse.ok(chatbotService.adjustValue(memberId, sessionId, request));
	}

	/** "기록 마치기" 버튼. 필수 항목이 채워졌으면 확인 단계로 넘어간다. */
	@PostMapping("/{sessionId}/finish")
	public ApiResponse<ChatReplyResponse> finish(@CurrentMember Long memberId, @PathVariable String sessionId) {
		return ApiResponse.ok(chatbotService.finish(memberId, sessionId));
	}

	@GetMapping("/{sessionId}/messages")
	public ApiResponse<ChatMessagesResponse> messages(
		@CurrentMember Long memberId, @PathVariable String sessionId) {
		return ApiResponse.ok(chatbotService.messages(memberId, sessionId));
	}

	/** 새로고침 뒤에도 일일 총정리 화면이 초안을 다시 채울 수 있도록 세션의 현재 초안을 준다. */
	@GetMapping("/{sessionId}/draft")
	public ApiResponse<ChatDraftStateResponse> draft(
		@CurrentMember Long memberId, @PathVariable String sessionId) {
		return ApiResponse.ok(chatbotService.draft(memberId, sessionId));
	}

	@PostMapping("/{sessionId}/records")
	public ResponseEntity<ApiResponse<RecordCreatedResponse>> saveRecord(
		@CurrentMember Long memberId, @PathVariable String sessionId,
		@Valid @RequestBody ChatRecordSaveRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(ApiResponse.ok(chatbotService.saveRecord(memberId, sessionId, request), "피부 기록이 저장되었습니다."));
	}

}
