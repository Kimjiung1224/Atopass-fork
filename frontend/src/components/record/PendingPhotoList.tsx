import { useEffect, useMemo } from 'react';

/** 아직 업로드되지 않은(기록 저장 전) 사진 미리보기 */
export default function PendingPhotoList({ files, onRemove }: { files: File[]; onRemove: (index: number) => void }) {
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  if (files.length === 0) return null;

  return (
    <ul className="flex gap-2 overflow-x-auto">
      {urls.map((url, i) => (
        <li key={url} className="relative shrink-0">
          <img src={url} alt={`추가한 사진 ${i + 1}`} className="size-20 rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute -right-1 -top-1 size-6 rounded-full bg-gray-800 text-sm text-white"
            aria-label={`사진 ${i + 1} 빼기`}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
