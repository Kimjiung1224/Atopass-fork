import type { ApiSuccess } from '@/types/api';
import type {
  ChatConsent,
  ChatDraftState,
  ChatMessagesResponse,
  ChatMode,
  ChatSession,
  SaveChatRecordRequest,
  SendMessageResponse,
} from '@/types/chatbot';
import type { RecordCreated } from '@/types/record';
import { client, unwrap } from './client';

export const chatbotApi = {
  /** 외부 LLM 이용 동의 여부. 동의 전에는 세션 생성·메시지 전송이 403 CONSENT_REQUIRED */
  getConsent: () => client.get<ApiSuccess<ChatConsent>>('/chatbot/consent').then(unwrap),

  agreeConsent: () => client.post<ApiSuccess<ChatConsent>>('/chatbot/consent').then(unwrap),

  createSession: (mode: ChatMode = 'RECORD') =>
    client.post<ApiSuccess<ChatSession>>('/chatbot/sessions', { mode }).then(unwrap),

  sendMessage: (sessionId: string, message: string) =>
    client
      .post<ApiSuccess<SendMessageResponse>>(`/chatbot/sessions/${sessionId}/messages`, { message })
      .then(unwrap),

  getMessages: (sessionId: string) =>
    client.get<ApiSuccess<ChatMessagesResponse>>(`/chatbot/sessions/${sessionId}/messages`).then(unwrap),

  /** 세션의 현재 초안과 진행 상태 (새로고침 뒤 복원용) */
  getDraft: (sessionId: string) =>
    client.get<ApiSuccess<ChatDraftState>>(`/chatbot/sessions/${sessionId}/draft`).then(unwrap),

  /** confirmed: true일 때만 저장된다 */
  saveRecord: (sessionId: string, body: SaveChatRecordRequest) =>
    client.post<ApiSuccess<RecordCreated>>(`/chatbot/sessions/${sessionId}/records`, body).then(unwrap),
};
