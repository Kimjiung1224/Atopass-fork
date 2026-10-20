import { useSyncExternalStore } from 'react';

/** html에 dark 클래스가 붙었는지. 그래프처럼 Tailwind dark: 대신 색 값을 직접 넘겨야 하는 곳에서 쓴다 */
export function useIsDark() {
  return useSyncExternalStore(subscribe, () => document.documentElement.classList.contains('dark'));
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}
