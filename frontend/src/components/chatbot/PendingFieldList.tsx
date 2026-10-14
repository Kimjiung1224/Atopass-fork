import type { PendingField } from '@/types/chatbot';
import { PENDING_FIELD_LABELS } from '@/utils/constants';

/** 챗봇이 아직 묻지 않은 항목 — pendingFields를 한글로 보여준다 */
export default function PendingFieldList({ fields }: { fields: PendingField[] }) {
  if (fields.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-100 px-3 py-2 text-sm">
      <span className="text-gray-500">남은 항목</span>
      {fields.map((field) => (
        <span key={field} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-700">
          {PENDING_FIELD_LABELS[field] ?? field}
        </span>
      ))}
    </div>
  );
}
