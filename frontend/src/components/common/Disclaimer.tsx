import { DISCLAIMER_TEXT } from '@/utils/constants';

/** 홈·진료 참고용 기록 화면 하단 면책 문구 */
export default function Disclaimer() {
  return <p className="px-4 py-6 text-center text-sm text-gray-400">{DISCLAIMER_TEXT}</p>;
}
