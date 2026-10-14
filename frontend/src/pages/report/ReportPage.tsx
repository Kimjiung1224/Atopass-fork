import Disclaimer from '@/components/common/Disclaimer';
import Placeholder from '@/components/common/Placeholder';

// TODO(진료기록 담당): POST /reports, GET /reports/{reportId}/file 미리보기·다운로드
export default function ReportPage() {
  return (
    <>
      <Placeholder title="진료 참고용 기록" description="기간·포함 항목 선택, PDF 미리보기 및 다운로드" />
      <Disclaimer />
    </>
  );
}
