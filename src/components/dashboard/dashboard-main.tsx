"use client";

import { useSidebar } from "./dashboard-shell";

export function DashboardMain({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();

  return (
    <main
      className={`flex-1 min-w-0 p-4 pt-16 transition-[margin] duration-300 ease-in-out sm:p-6 md:p-8 md:pt-8 ${
        open ? "md:ml-64" : "md:ml-0"
      }`}
    >
      {children}
    </main>
  );
}
