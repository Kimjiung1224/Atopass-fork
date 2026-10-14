import PageHeader from './PageHeader';

/** 아직 구현 전인 화면 자리 표시 */
export default function Placeholder({ title, description }: { title: string; description: string }) {
  return (
    <>
      <PageHeader title={title} />
      <p className="p-6 text-gray-500">{description}</p>
    </>
  );
}
