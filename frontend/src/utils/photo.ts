import { PHOTO_ACCEPT, PHOTO_MAX_BYTES, PHOTO_MAX_COUNT } from './constants';

/** 업로드 전 프론트 검증 — 서버도 다시 검증하므로 안내용 */
export function validatePhotos(files: File[], currentCount: number): string | null {
  if (currentCount + files.length > PHOTO_MAX_COUNT) return `사진은 최대 ${PHOTO_MAX_COUNT}장까지 올릴 수 있어요.`;
  if (files.some((f) => !PHOTO_ACCEPT.includes(f.type))) return 'JPG, PNG 사진만 올릴 수 있어요.';
  if (files.some((f) => f.size > PHOTO_MAX_BYTES)) return '사진 한 장은 10MB 이하여야 해요.';
  return null;
}
