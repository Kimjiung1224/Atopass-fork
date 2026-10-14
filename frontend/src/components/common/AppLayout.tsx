import { NavLink, Outlet } from 'react-router';

// 하단 탭: 홈 / 기록 / 캘린더 / 그래프 / 진료기록 (화면 명세서 1. 화면 목록)
const TABS = [
  { to: '/', label: '홈', end: true },
  { to: '/chatbot', label: '기록' },
  { to: '/calendar', label: '캘린더' },
  { to: '/analysis', label: '그래프' },
  { to: '/report', label: '진료기록' },
];

export default function AppLayout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-white">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <ul className="grid grid-cols-5">
          {TABS.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `block py-3 text-center text-base ${isActive ? 'font-bold text-emerald-600' : 'text-gray-500'}`
                }
              >
                {tab.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
