"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/supabase/types";
import type { DashboardModule } from "@/lib/modules";
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Search,
  FileText,
  Receipt,
  CreditCard,
  Settings,
  Users,
  FileSignature,
  DollarSign,
  LogOut,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  module?: DashboardModule;
}

const clientNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  {
    icon: FolderKanban,
    label: "Projects",
    href: "/dashboard/projects",
    module: "project_tracker",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/dashboard/analytics",
    module: "analytics",
  },
  {
    icon: Search,
    label: "SEO",
    href: "/dashboard/seo",
    module: "seo_performance",
  },
  {
    icon: FileText,
    label: "Content Requests",
    href: "/dashboard/content-requests",
    module: "content_requests",
  },
  {
    icon: FileSignature,
    label: "Proposals",
    href: "/dashboard/proposals",
    module: "proposals",
  },
  { icon: Receipt, label: "Reports", href: "/dashboard/reports" },
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
  { icon: Settings, label: "Account Settings", href: "/dashboard/account" },
];

const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Clients", href: "/dashboard/admin/clients" },
  {
    icon: FileSignature,
    label: "Proposals",
    href: "/dashboard/admin/proposals",
  },
  { icon: DollarSign, label: "Revenue", href: "/dashboard/admin/revenue" },
  { icon: Settings, label: "Account Settings", href: "/dashboard/account" },
];

interface SidebarProps {
  role: UserRole;
  modules: DashboardModule[];
}

export function Sidebar({ role, modules }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const modulesSet = new Set(modules);

  const navItems = role === "admin" ? adminNavItems : clientNavItems;

  const visibleItems = navItems.filter((item) => {
    if (!item.module) return true;
    return modulesSet.has(item.module);
  });

  function isActive(href: string): boolean {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-background/80 backdrop-blur-xl border-r border-primary/10 flex flex-col z-30">
      <div className="p-6 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo_icon.png"
            alt="OphidianAI"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-lg font-semibold text-foreground tracking-tight">
            OphidianAI
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-primary/10 text-primary"
                : "text-foreground-muted hover:text-foreground hover:bg-white/5"
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-primary/10">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
