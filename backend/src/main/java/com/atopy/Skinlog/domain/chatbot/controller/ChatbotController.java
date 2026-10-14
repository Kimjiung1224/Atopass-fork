package com.atopy.Skinlog.domain.chatbot.controller;

import com.atopy.Skinlog.domain.chatbot.dto.request.ChatMessageRequest;
import com.atopy.Skinlog.domain.chatbot.dto.request.ChatRecordSaveRequest;
import com.atopy.Skinlog.domain.chatbot.dto.request.CreateSessionRequest;
import com.atopy.Skinlog.domain.chatbot.dto.response.ChatMessagesResponse;
import com.atopy.Skinlog.domain.chatbot.dto.response.ChatReplyResponse;
import com.atopy.Skinlog.domain.chatbot.dto.response.ChatSessionResponse;
import com.atopy.Skinlog.domain.chatbot.service.ChatbotService;
import com.atopy.Skinlog.domain.record.dto.response.RecordCreatedResponse;
import com.atopy.Skinlog.global.response.ApiResponse;
import com.atopy.Skinlog.global.security.CurrentMember;
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

	@GetMapping("/{sessionId}/messages")
	public ApiResponse<ChatMessagesResponse> messages(
		@CurrentMember Long memberId, @PathVariable String sessionId) {
		return ApiResponse.ok(chatbotService.messages(memberId, sessionId));
	}

	@PostMapping("/{sessionId}/records")
	public ResponseEntity<ApiResponse<RecordCreatedResponse>> saveRecord(
		@CurrentMember Long memberId, @PathVariable String sessionId,
		@Valid @RequestBody ChatRecordSaveRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(ApiResponse.ok(chatbotService.saveRecord(memberId, sessionId, request), "피부 기록이 저장되었습니다."));
	}

}
