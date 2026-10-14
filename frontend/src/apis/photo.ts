import type { ApiSuccess } from '@/types/api';
import type { PhotoUploaded } from '@/types/record';
import { client, unwrap } from './client';

export const photoApi = {
  upload: (recordId: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return client.post<ApiSuccess<PhotoUploaded>>(`/records/${recordId}/photos`, form).then(unwrap);
  },

  /** 인증이 필요한 사진이라 img src로 직접 못 쓴다 — blob으로 받아 object URL로 표시 */
  getObjectUrl: async (recordId: number, photoId: number) => {
    const res = await client.get<Blob>(`/records/${recordId}/photos/${photoId}`, { responseType: 'blob' });
    return URL.createObjectURL(res.data);
  },

  remove: (recordId: number, photoId: number) => client.delete(`/records/${recordId}/photos/${photoId}`),
};
