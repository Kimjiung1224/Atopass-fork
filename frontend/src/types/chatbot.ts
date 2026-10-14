import type { RecordInput } from './record';

export type ChatMode = 'RECORD' | 'QUERY';

export interface ChatSession {
  sessionId: string;
  mode: ChatMode;
}

export interface SendMessageResponse {
  reply: string;
  /** false면 해석 실패 — 같은 질문이 다시 온다 (오류 아님, 200) */
  understood: boolean;
  /** 아직 입력되지 않은 항목 */
  pendingFields: string[];
  /** true면 일일 총정리(확인) 단계로 이동 */
  requiresConfirmation: boolean;
}

export type ChatRole = 'USER' | 'ASSISTANT';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface ChatMessagesResponse {
  messages: ChatMessage[];
}

/** POST /chatbot/sessions/{sessionId}/records */
export interface SaveChatRecordRequest {
  recordDate: string;
  confirmed: boolean;
  record: Omit<RecordInput, 'recordDate'>;
}
