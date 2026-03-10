"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { type DashboardModule } from "@/lib/modules";

interface ModuleGuardProps {
  modules: Set<DashboardModule>;
  required: DashboardModule;
  children: React.ReactNode;
  fallbackUrl?: string;
}

export function ModuleGuard({
  modules,
  required,
  children,
  fallbackUrl = "/dashboard",
}: ModuleGuardProps) {
  const router = useRouter();

  useEffect(() => {
    if (!modules.has(required)) {
      router.replace(fallbackUrl);
    }
  }, [modules, required, fallbackUrl, router]);

  if (!modules.has(required)) {
    return null;
  }

  return <>{children}</>;
}
