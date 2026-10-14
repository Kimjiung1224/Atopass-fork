import { Link } from 'react-router';
import Disclaimer from '@/components/common/Disclaimer';
import Placeholder from '@/components/common/Placeholder';
import { recordPath } from '@/utils/routes';

// TODO(홈 담당): 사용자 이름(GET /members/me), 오늘 기록 여부, 최근 7일 증상 점수 차트
export default function HomePage() {
  return (
    <>
      <Placeholder title="홈" description="오늘 기록 상태, 최근 7일 증상 점수, 바로가기" />
      <div className="flex flex-col gap-2 px-4">
        <Link to="/chatbot" className="rounded-xl bg-emerald-600 py-4 text-center text-lg font-bold text-white">
          오늘 기록하기
        </Link>
        <Link to={recordPath()} className="rounded-xl border py-3 text-center text-base">
          오늘 총정리 보기
        </Link>
      </div>
      <Disclaimer />
    </>
  );
}
