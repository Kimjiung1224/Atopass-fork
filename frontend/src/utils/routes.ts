import { today } from './date';

/** 일일 총정리 경로 */
export const recordPath = (date: string = today()) => `/record/${date}`;
