import type { ApiSuccess } from '@/types/api';
import type {
  ChatMessagesResponse,
  ChatMode,
  ChatSession,
  SaveChatRecordRequest,
  SendMessageResponse,
} from '@/types/chatbot';
import type { RecordCreated } from '@/types/record';
import { client, unwrap } from './client';

export const chatbotApi = {
  createSession: (mode: ChatMode = 'RECORD') =>
    client.post<ApiSuccess<ChatSession>>('/chatbot/sessions', { mode }).then(unwrap),

  sendMessage: (sessionId: string, message: string) =>
    client
      .post<ApiSuccess<SendMessageResponse>>(`/chatbot/sessions/${sessionId}/messages`, { message })
      .then(unwrap),

  getMessages: (sessionId: string) =>
    client.get<ApiSuccess<ChatMessagesResponse>>(`/chatbot/sessions/${sessionId}/messages`).then(unwrap),

  /** confirmed: true일 때만 저장된다 */
  saveRecord: (sessionId: string, body: SaveChatRecordRequest) =>
    client.post<ApiSuccess<RecordCreated>>(`/chatbot/sessions/${sessionId}/records`, body).then(unwrap),
};
