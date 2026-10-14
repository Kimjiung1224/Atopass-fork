import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { authApi } from '@/apis/auth';

// TODO(로그인 담당): 회원가입, 입력 검증, 디자인 적용. 지금은 다른 화면 개발용 최소 로그인
export default function LoginPage() {
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await authApi.login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인하지 못했어요.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3 p-6">
      <h1 className="mb-4 text-2xl font-bold">Skinlog</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일"
        autoComplete="email"
        className="rounded-xl border border-gray-300 px-4 py-3 text-base"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        autoComplete="current-password"
        className="rounded-xl border border-gray-300 px-4 py-3 text-base"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button type="submit" className="rounded-xl bg-emerald-600 py-3 text-lg font-bold text-white">
        로그인
      </button>
    </form>
  );
}
