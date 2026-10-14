import type { ApiSuccess } from '@/types/api';
import type { Member } from '@/types/member';
import { client, unwrap } from './client';

export const memberApi = {
  getMe: () => client.get<ApiSuccess<Member>>('/members/me').then(unwrap),
  updateMe: (body: { nickname?: string; password?: string }) =>
    client.patch<ApiSuccess<Member>>('/members/me', body).then(unwrap),
};
