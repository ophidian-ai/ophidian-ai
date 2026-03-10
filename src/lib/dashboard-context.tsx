"use client";

import { createContext, useContext, useMemo } from "react";
import type { UserRole } from "@/lib/supabase/types";
import type { DashboardModule } from "@/lib/modules";

interface DashboardContextValue {
  role: UserRole;
  modules: Set<DashboardModule>;
  clientId: string | null;
}

const DashboardContext = createContext<DashboardContextValue>({
  role: "client",
  modules: new Set(),
  clientId: null,
});

interface DashboardProviderProps {
  role: UserRole;
  modules: DashboardModule[];
  clientId: string | null;
  children: React.ReactNode;
}

export function DashboardProvider({
  role,
  modules,
  clientId,
  children,
}: DashboardProviderProps) {
  const modulesSet = useMemo(() => new Set(modules), [modules]);

  return (
    <DashboardContext.Provider
      value={{ role, modules: modulesSet, clientId }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
