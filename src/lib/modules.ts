// src/lib/modules.ts
// Determines which dashboard modules a client can access based on their services

import type { ClientService, ServiceType, ProjectPhase } from "@/lib/supabase/types";

export type DashboardModule =
  | "project_tracker"
  | "content_requests"
  | "analytics"
  | "seo_performance"
  | "reports"
  | "billing"
  | "proposals";

const SERVICE_MODULE_MAP: Record<ServiceType, DashboardModule[]> = {
  web_starter: ["project_tracker", "proposals", "billing", "reports"],
  web_professional: ["project_tracker", "proposals", "billing", "reports"],
  web_ecommerce: ["project_tracker", "proposals", "billing", "reports"],
  seo_cleanup: ["seo_performance", "proposals", "billing", "reports"],
  seo_growth: ["seo_performance", "content_requests", "billing", "reports"],
  maintenance: ["content_requests", "analytics", "billing", "reports"],
};

// Modules that activate only when a project reaches "live" phase
const LIVE_SITE_MODULES: DashboardModule[] = ["analytics", "seo_performance", "content_requests"];

export function getClientModules(
  services: ClientService[],
  projectPhase?: ProjectPhase | null
): Set<DashboardModule> {
  const modules = new Set<DashboardModule>();

  for (const service of services) {
    if (service.status === "cancelled") continue;
    const serviceModules = SERVICE_MODULE_MAP[service.service_type] ?? [];
    for (const mod of serviceModules) {
      modules.add(mod);
    }
  }

  // Web design clients get analytics and content_requests only after site is live
  const hasWebService = services.some(
    (s) =>
      s.status !== "cancelled" &&
      ["web_starter", "web_professional", "web_ecommerce"].includes(s.service_type)
  );

  if (hasWebService && projectPhase === "live") {
    modules.add("analytics");
    modules.add("content_requests");
  }

  // SEO performance for cleanup clients only if they have a done-for-you engagement
  // (Advisory clients don't get Search Console access -- handled at service creation time
  // by not adding seo_cleanup to their services if advisory-only)

  return modules;
}

export function hasModule(
  modules: Set<DashboardModule>,
  module: DashboardModule
): boolean {
  return modules.has(module);
}
