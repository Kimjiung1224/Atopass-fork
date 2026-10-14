// 액세스 토큰은 메모리에만 보관한다 (localStorage 사용 금지 — 화면 명세서 3. 공통 처리 규칙)
let accessToken: string | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
};
