import { useRef, useState, type PointerEvent, type ReactNode } from 'react';

interface Props {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  children: ReactNode;
}

/** 접었을 때 화면에서 차지하는 높이(%) — 뒤의 기록 화면이 위쪽에 보인다 */
const COLLAPSED_PERCENT = 45;
/** 이만큼(px) 넘게 끌어야 펼치거나 접는다. 그보다 짧으면 손잡이를 누른 것으로 보고 펼침·접힘을 바꾼다 */
const DRAG_THRESHOLD = 40;

/**
 * 기록 화면 위에 겹치는 채팅 패널. 손잡이를 위로 끌어올리면 채팅을 크게 보고, 아래로 내리면 뒤의 기록 화면을 본다.
 * 끄는 동안에는 손가락을 따라 높이가 바뀌고, 놓으면 펼침·접힘 중 가까운 쪽으로 맞춘다.
 */
export default function ChatBottomSheet({ expanded, onExpandedChange, children }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; startHeight: number; parentHeight: number } | null>(null);
  const [dragHeight, setDragHeight] = useState<number | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const sheet = sheetRef.current;
    const parent = sheet?.parentElement;
    if (!sheet || !parent) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId); // 손잡이 밖으로 끌어도 계속 따라가도록
    } catch {
      // 캡처를 못 해도 손잡이 위에서는 그대로 끌 수 있다
    }
    drag.current = { startY: e.clientY, startHeight: sheet.offsetHeight, parentHeight: parent.offsetHeight };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const minHeight = (d.parentHeight * COLLAPSED_PERCENT) / 100;
    setDragHeight(Math.min(d.parentHeight, Math.max(minHeight, d.startHeight + d.startY - e.clientY)));
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    setDragHeight(null);
    if (!d) return;
    const moved = d.startY - e.clientY; // 위로 끌면 양수
    if (Math.abs(moved) < DRAG_THRESHOLD) onExpandedChange(!expanded);
    else onExpandedChange(moved > 0);
  };

  const height = dragHeight !== null ? `${dragHeight}px` : expanded ? '100%' : `${COLLAPSED_PERCENT}%`;

  return (
    <div
      ref={sheetRef}
      style={{ height }}
      className={`absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-2xl border-t border-gray-200 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)] ${
        dragHeight === null ? 'transition-[height] duration-200' : ''
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={expanded ? '채팅 내리고 기록 보기' : '채팅 크게 보기'}
        aria-expanded={expanded}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null;
          setDragHeight(null);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onExpandedChange(!expanded);
          }
        }}
        className="flex shrink-0 cursor-grab touch-none flex-col items-center gap-1 pb-1 pt-2 active:cursor-grabbing"
      >
        <span className="h-1.5 w-10 rounded-full bg-gray-300" aria-hidden />
        <span className="text-xs text-gray-400">{expanded ? '내리면 기록 화면' : '올리면 채팅'}</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
