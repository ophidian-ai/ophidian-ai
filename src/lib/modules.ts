// src/lib/modules.ts
// Determines which dashboard modules a client can access based on their services

import type { ClientService, ServiceType, ProjectPhase } from "@/lib/supabase/types";

export type DashboardModule =
  | "project_tracker"
  | "content_requests"
  | "analytics"
  | "seo_performance"
  | "social_media"
  | "content_engine"
  | "reports"
  | "billing"
  | "proposals"
  | "chatbot"
  | "email_marketing"
  | "review_management"
  | "ad_management";

export interface AdminModule {
  label: string;
  path: string;
  adminOnly: true;
}

export const adminModules: AdminModule[] = [
  { label: "AI Chatbot", path: "/dashboard/admin/chatbot", adminOnly: true },
  { label: "Email Marketing", path: "/dashboard/admin/email", adminOnly: true },
  { label: "CRM", path: "/dashboard/admin/crm", adminOnly: true },
  { label: "Review Management", path: "/dashboard/admin/review", adminOnly: true },
  { label: "Ad Management", path: "/dashboard/admin/ads", adminOnly: true },
];

const SERVICE_MODULE_MAP: Record<ServiceType, DashboardModule[]> = {
  web_starter: ["project_tracker", "proposals", "billing", "reports"],
  web_professional: ["project_tracker", "proposals", "billing", "reports"],
  web_ecommerce: ["project_tracker", "proposals", "billing", "reports"],
  seo_cleanup: ["seo_performance", "proposals", "billing", "reports"],
  seo_growth: ["seo_performance", "content_requests", "billing", "reports"],
  maintenance: ["content_requests", "analytics", "billing", "reports"],
  social_media: ["social_media", "content_engine", "analytics", "content_requests", "billing", "reports"],
};

// Modules that activate only when a project reaches "live" phase
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _LIVE_SITE_MODULES: DashboardModule[] = ["analytics", "seo_performance", "content_requests"];

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

  if (hasWebService && (projectPhase === "live" || projectPhase === "maintenance")) {
    modules.add("analytics");
    modules.add("content_requests");
  }

  // SEO performance for cleanup clients only if they have a done-for-you engagement
  // (Advisory clients don't get Search Console access -- handled at service creation time
  // by not adding seo_cleanup to their services if advisory-only)

  return modules;
}

/** All modules — used to grant admins full access. */
export const ALL_MODULES: DashboardModule[] = [
  "project_tracker",
  "content_requests",
  "analytics",
  "seo_performance",
  "social_media",
  "content_engine",
  "reports",
  "billing",
  "proposals",
  "chatbot",
  "email_marketing",
  "review_management",
  "ad_management",
];

export function hasModule(
  modules: Set<DashboardModule>,
  module: DashboardModule
): boolean {
  return modules.has(module);
}
