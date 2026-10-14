import type { ReactNode } from 'react';

export default function PageHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
      <h1 className="text-xl font-bold">{title}</h1>
      {right}
    </header>
  );
}
