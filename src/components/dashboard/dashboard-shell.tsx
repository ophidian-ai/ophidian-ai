"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface SidebarState {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarState>({
  open: true,
  toggle: () => {},
  close: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <SidebarContext.Provider value={{ open, toggle, close }}>
      <div data-dashboard className="flex min-h-screen bg-background">{children}</div>
    </SidebarContext.Provider>
  );
}
