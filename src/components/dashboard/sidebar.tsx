"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/supabase/types";
import type { DashboardModule } from "@/lib/modules";
import { useSidebar } from "./dashboard-shell";
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
  Share2,
  Sparkles,
  MessageSquare,
  Mail,
  ContactRound,
  Star,
  LogOut,
  Menu,
  X,
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
    icon: Share2,
    label: "Social Media",
    href: "/dashboard/social",
    module: "social_media",
  },
  {
    icon: Sparkles,
    label: "Content Engine",
    href: "/dashboard/content-engine",
    module: "content_engine",
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
  { icon: Share2, label: "Social Media", href: "/dashboard/social" },
  { icon: Sparkles, label: "Content Engine", href: "/dashboard/content-engine" },
  { icon: MessageSquare, label: "AI Chatbot", href: "/dashboard/admin/chatbot" },
  { icon: Search, label: "SEO Automation", href: "/dashboard/admin/seo" },
  { icon: Mail, label: "Email Marketing", href: "/dashboard/admin/email" },
  { icon: ContactRound, label: "CRM", href: "/dashboard/admin/crm" },
  { icon: Star, label: "Review Management", href: "/dashboard/admin/review" },
  { icon: Settings, label: "Account Settings", href: "/dashboard/account" },
];

interface SidebarProps {
  role: UserRole;
  modules: DashboardModule[];
}

export function Sidebar({ role, modules }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { open, toggle, close } = useSidebar();
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
    <>
      {/* Toggle button -- always visible */}
      <button
        onClick={toggle}
        aria-label={open ? "Close sidebar" : "Open sidebar"}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm border border-primary/10 text-foreground-muted hover:text-foreground hover:bg-white/5 transition-colors md:top-5 md:left-5 cursor-pointer"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={close}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-background/80 backdrop-blur-xl border-r border-primary/10 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo -- padded to clear toggle button */}
        <div className="p-6 pt-16 flex items-center gap-2">
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

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 768) close();
              }}
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
    </>
  );
}
