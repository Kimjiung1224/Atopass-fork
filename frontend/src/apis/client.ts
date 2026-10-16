import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorBody, ApiSuccess, ErrorCode, ErrorDetail } from '@/types/api';
import type { TokenResponse } from '@/types/member';
import { tokenStore } from '@/utils/tokenStore';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 리프레시 토큰 쿠키 전송
});

client.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** 서버 오류 응답을 화면에서 쓰기 쉬운 형태로 감싼 에러 */
export class ApiError extends Error {
  readonly status?: number;
  readonly code?: ErrorCode;
  readonly details: ErrorDetail[];

  constructor(message: string, status?: number, code?: ErrorCode, details: ErrorDetail[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// ---------- 401 처리: /auth/refresh 한 번 시도 후 재요청, 실패하면 /login ----------
let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  // 동시에 여러 요청이 401을 받아도 refresh는 한 번만 호출
  refreshPromise ??= axios
    .post<ApiSuccess<TokenResponse>>(`${API_BASE_URL}/auth/refresh`, null, { withCredentials: true })
    .then((res) => {
      tokenStore.set(res.data.data.accessToken);
      return res.data.data.accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

type RetryConfig = InternalAxiosRequestConfig & { _retried?: boolean };

const AUTH_PATHS = ['/auth/login', '/auth/signup', '/auth/refresh'];

client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiErrorBody>) => {
    const config = error.config as RetryConfig | undefined;
    const isAuthPath = AUTH_PATHS.some((p) => config?.url?.startsWith(p));

    if (error.response?.status === 401 && config && !config._retried && !isAuthPath) {
      config._retried = true;
      try {
        await refreshAccessToken();
        return client(config);
      } catch {
        tokenStore.clear();
        if (window.location.pathname !== '/login') window.location.assign('/login');
      }
    }

    const apiError = error.response?.data?.error;
    return Promise.reject(
      new ApiError(
        apiError?.message ?? '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.',
        error.response?.status,
        apiError?.code,
        apiError?.details,
      ),
    );
  },
);

/** 공통 응답에서 data만 꺼낸다 */
export const unwrap = <T>(res: { data: ApiSuccess<T> }): T => res.data.data;
