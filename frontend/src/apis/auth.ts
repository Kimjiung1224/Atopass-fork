import type { ApiSuccess } from '@/types/api';
import type { LoginRequest, TokenResponse, Member, SignupRequest } from '@/types/member';
import { tokenStore } from '@/utils/tokenStore';
import { client, unwrap } from './client';

export const authApi = {
  signup: (body: SignupRequest) => client.post<ApiSuccess<Member>>('/auth/signup', body).then(unwrap),

  login: async (body: LoginRequest) => {
    const data = await client.post<ApiSuccess<TokenResponse>>('/auth/login', body).then(unwrap);
    tokenStore.set(data.accessToken);
    return data;
  },

  logout: async () => {
    try {
      await client.post('/auth/logout');
    } finally {
      tokenStore.clear();
    }
  },
};
