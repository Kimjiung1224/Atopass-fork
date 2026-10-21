import type { ReactNode } from 'react';

export default function PageHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-[#f5f7fb]/90 px-5 py-4 backdrop-blur">
      <h1 className="text-xl font-bold">{title}</h1>
      {right}
    </header>
  );
}
