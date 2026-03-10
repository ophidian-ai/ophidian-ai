"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import {
  LayoutDashboard,
  Bot,
  BarChart3,
  Package,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Users,
  Zap,
  ChevronRight,
  Bell,
  FolderOpen,
  FolderKanban,
  FileText,
  Receipt,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// --- Types ---
interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalIntegrations: number;
  activeIntegrations: number;
  totalActiveUsers: number;
  totalProjects: number;
}

interface IntegrationBreakdown {
  name: string;
  category: string;
  clientCount: number;
  activeUsers: number;
  status: string;
}

interface ClientRow {
  id: string;
  name: string;
  status: string;
  contact_email: string | null;
  integrationCount: number;
}

// --- Pie chart colors ---
const PIE_COLORS = [
  "#39FF14",
  "#0DB1B2",
  "#5FFF42",
  "#2BCC10",
  "#098F90",
  "#64748B",
];

// --- Stat Card with float ---
function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  index,
}: {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: LucideIcon;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay: 0.1 + index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="dashboard-card"
    >
      <GlowCard className="glass rounded-xl border border-primary/10 p-5 hover:border-primary/20 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon size={20} className="text-primary" />
          </div>
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              changeType === "up"
                ? "text-primary"
                : changeType === "down"
                  ? "text-red-400"
                  : "text-foreground-dim"
            }`}
          >
            {changeType === "up" ? (
              <TrendingUp size={14} />
            ) : changeType === "down" ? (
              <TrendingDown size={14} />
            ) : null}
            {change}
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-sm text-foreground-muted mt-1">{title}</div>
      </GlowCard>
    </motion.div>
  );
}

// --- Chart Card with float ---
function ChartCard({
  title,
  children,
  index,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  index: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay: 0.3 + index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`dashboard-card ${className}`}
    >
      <GlowCard className="glass rounded-xl border border-primary/10 p-5 h-full">
        <h3 className="text-sm font-medium text-foreground-muted mb-4">
          {title}
        </h3>
        {children}
      </GlowCard>
    </motion.div>
  );
}

// --- Quick Link for Client Dashboard ---
function QuickLink({
  icon: Icon,
  label,
  href,
  index,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.15 + index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link href={href}>
        <GlowCard className="glass rounded-xl border border-primary/10 p-5 hover:border-primary/20 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon size={20} className="text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {label}
            </span>
            <ChevronRight
              size={16}
              className="ml-auto text-foreground-dim group-hover:text-primary transition-colors"
            />
          </div>
        </GlowCard>
      </Link>
    </motion.div>
  );
}

// --- Client Dashboard ---
function ClientDashboard() {
  const { modules } = useDashboard();

  const quickLinks: { icon: LucideIcon; label: string; href: string; module?: string }[] = [
    { icon: FolderKanban, label: "Projects", href: "/dashboard/projects", module: "project_tracker" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", module: "analytics" },
    { icon: Search, label: "SEO Performance", href: "/dashboard/seo", module: "seo_performance" },
    { icon: FileText, label: "Content Requests", href: "/dashboard/content-requests", module: "content_requests" },
    { icon: Receipt, label: "Reports", href: "/dashboard/reports" },
    { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
  ];

  const visibleLinks = quickLinks.filter((link) => {
    if (!link.module) return true;
    return modules.has(link.module as any);
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Welcome</h1>
        <p className="text-foreground-muted text-sm mt-1">
          Your client dashboard
        </p>
      </motion.div>

      {visibleLinks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleLinks.map((link, i) => (
            <QuickLink
              key={link.href}
              icon={link.icon}
              label={link.label}
              href={link.href}
              index={i}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <GlowCard className="glass rounded-xl border border-primary/10 p-8 text-center">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard size={24} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              No active services yet
            </h2>
            <p className="text-foreground-muted text-sm max-w-md mx-auto">
              Once your services are set up, you will see your project progress,
              analytics, and reports here.
            </p>
          </GlowCard>
        </motion.div>
      )}
    </div>
  );
}

// --- Admin Dashboard ---
function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationBreakdown[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const supabase = createClient();

        // Get current user profile
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();

        setUserName(
          profile?.full_name || user.email?.split("@")[0] || "Admin"
        );

        // Fetch stats in parallel
        const [
          clientsRes,
          integrationsRes,
          clientIntegrationsRes,
          projectsRes,
          usageRes,
        ] = await Promise.all([
          supabase.from("clients").select("id, name, status, contact_email"),
          supabase.from("integrations").select("id, name, category"),
          supabase
            .from("client_integrations")
            .select("id, client_id, integration_id, status"),
          supabase.from("projects").select("id, status"),
          supabase
            .from("usage_events")
            .select("id, client_integration_id, user_identifier, created_at"),
        ]);

        const allClients = clientsRes.data || [];
        const allIntegrations = integrationsRes.data || [];
        const allCI = clientIntegrationsRes.data || [];
        const allProjects = projectsRes.data || [];
        const allUsage = usageRes.data || [];

        // Compute stats
        const activeClients = allClients.filter(
          (c) => c.status === "active"
        ).length;
        const activeCI = allCI.filter((ci) => ci.status === "active").length;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentUsage = allUsage.filter(
          (u) => new Date(u.created_at) >= thirtyDaysAgo
        );
        const uniqueUsers = new Set(
          recentUsage.map((u) => u.user_identifier)
        );

        setStats({
          totalClients: allClients.length,
          activeClients,
          totalIntegrations: allIntegrations.length,
          activeIntegrations: activeCI,
          totalActiveUsers: uniqueUsers.size,
          totalProjects: allProjects.filter((p) => p.status === "active")
            .length,
        });

        // Integration breakdown
        const breakdown: IntegrationBreakdown[] = allIntegrations.map(
          (int) => {
            const ciForInt = allCI.filter(
              (ci) => ci.integration_id === int.id
            );
            const ciIds = new Set(ciForInt.map((ci) => ci.id));
            const usageForInt = recentUsage.filter((u) =>
              ciIds.has(u.client_integration_id)
            );
            const uniqueUsersForInt = new Set(
              usageForInt.map((u) => u.user_identifier)
            );

            return {
              name: int.name,
              category: int.category,
              clientCount: ciForInt.filter((ci) => ci.status === "active")
                .length,
              activeUsers: uniqueUsersForInt.size,
              status: ciForInt.some((ci) => ci.status === "active")
                ? "active"
                : "inactive",
            };
          }
        );
        setIntegrations(breakdown);

        // Client rows
        const clientRows: ClientRow[] = allClients.map((c) => ({
          id: c.id,
          name: c.name,
          status: c.status,
          contact_email: c.contact_email,
          integrationCount: allCI.filter(
            (ci) => ci.client_id === c.id && ci.status === "active"
          ).length,
        }));
        setClients(clientRows);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/20 animate-pulse" />
          <p className="text-foreground-muted text-sm">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Pie chart data from integration breakdown
  const pieData = integrations
    .filter((i) => i.clientCount > 0)
    .map((i) => ({ name: i.name, value: i.clientCount }));

  const hasPieData = pieData.length > 0;
  const displayPieData = hasPieData
    ? pieData
    : [{ name: "No integrations yet", value: 1 }];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-primary/10 -mx-6 -mt-6 md:-mx-8 md:-mt-8 px-6 py-4 md:px-8 flex items-center justify-between">
        <div className="relative w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-dim"
          />
          <input
            type="text"
            placeholder="Search integrations, clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder-foreground-dim focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-foreground-muted hover:text-foreground transition-colors cursor-pointer">
            <Bell size={18} />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
          </button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-background text-xs font-bold">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {userName.split(" ")[0]}
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Overview of your clients, AI integrations, and usage
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clients"
          value={String(stats?.totalClients ?? 0)}
          change={
            stats?.activeClients
              ? `${stats.activeClients} active`
              : "0 active"
          }
          changeType={stats?.activeClients ? "up" : "neutral"}
          icon={Users}
          index={0}
        />
        <StatCard
          title="Active Integrations"
          value={String(stats?.activeIntegrations ?? 0)}
          change={`${stats?.totalIntegrations ?? 0} total`}
          changeType={stats?.activeIntegrations ? "up" : "neutral"}
          icon={Zap}
          index={1}
        />
        <StatCard
          title="Active Users (30d)"
          value={String(stats?.totalActiveUsers ?? 0)}
          change="last 30 days"
          changeType={stats?.totalActiveUsers ? "up" : "neutral"}
          icon={Activity}
          index={2}
        />
        <StatCard
          title="Active Projects"
          value={String(stats?.totalProjects ?? 0)}
          change="in progress"
          changeType={stats?.totalProjects ? "up" : "neutral"}
          icon={FolderOpen}
          index={3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Integration Breakdown Pie */}
        <ChartCard title="Integration Breakdown" index={0}>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={hasPieData ? 4 : 0}
                  dataKey="value"
                  stroke="none"
                >
                  {displayPieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        hasPieData
                          ? PIE_COLORS[i % PIE_COLORS.length]
                          : "rgba(255,255,255,0.08)"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#162032",
                    border: "1px solid rgba(57,255,20,0.2)",
                    borderRadius: "8px",
                    color: "#F1F5F9",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {hasPieData && (
            <div className="mt-2 space-y-1.5">
              {pieData.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{
                      background: PIE_COLORS[i % PIE_COLORS.length],
                    }}
                  />
                  <span className="text-foreground-muted flex-1 truncate">
                    {item.name}
                  </span>
                  <span className="text-foreground font-medium">
                    {item.value} clients
                  </span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Active Users per Integration (Bar) */}
        <ChartCard title="Active Users per Integration" index={1}>
          <div className="h-64">
            {integrations.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={integrations.map((i) => ({
                    name:
                      i.name.length > 12
                        ? i.name.slice(0, 12) + "..."
                        : i.name,
                    users: i.activeUsers,
                  }))}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={11}
                  />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "#162032",
                      border: "1px solid rgba(57,255,20,0.2)",
                      borderRadius: "8px",
                      color: "#F1F5F9",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="users"
                    fill="#0DB1B2"
                    radius={[4, 4, 0, 0]}
                    opacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-foreground-dim text-sm">
                No integration data yet
              </div>
            )}
          </div>
        </ChartCard>

        {/* AI Integrations List */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="dashboard-card"
        >
          <GlowCard className="glass rounded-xl border border-primary/10 p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground-muted">
                AI Integrations
              </h3>
              <span className="text-xs text-foreground-dim">
                {integrations.length} total
              </span>
            </div>
            <div className="space-y-3">
              {integrations.length > 0 ? (
                integrations.map((item, i) => {
                  const IconMap: Record<string, LucideIcon> = {
                    chatbot: Bot,
                    automation: Zap,
                    analytics: BarChart3,
                    content: Package,
                    search: Search,
                    other: Zap,
                  };
                  const Icon = IconMap[item.category] || Zap;

                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.6 + i * 0.08,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-primary/15 transition-colors cursor-pointer group"
                    >
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ${
                              item.status === "active"
                                ? "bg-primary"
                                : "bg-foreground-dim"
                            }`}
                          />
                          <span className="text-xs text-foreground-dim capitalize">
                            {item.status}
                          </span>
                          <span className="text-xs text-foreground-dim">
                            {item.clientCount} clients
                          </span>
                          <span className="text-xs text-foreground-dim">
                            {item.activeUsers} users
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={14}
                        className="text-foreground-dim group-hover:text-primary transition-colors"
                      />
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-foreground-dim text-sm">
                  No integrations configured yet
                </div>
              )}
            </div>
          </GlowCard>
        </motion.div>
      </div>

      {/* Clients Table */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.7,
          delay: 0.6,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="dashboard-card"
      >
        <GlowCard className="glass rounded-xl border border-primary/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground-muted">
              Clients
            </h3>
            <span className="text-xs text-foreground-dim">
              {clients.length} total
            </span>
          </div>
          {clients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-2 px-3 text-foreground-dim font-medium">
                      Name
                    </th>
                    <th className="text-left py-2 px-3 text-foreground-dim font-medium">
                      Email
                    </th>
                    <th className="text-left py-2 px-3 text-foreground-dim font-medium">
                      Status
                    </th>
                    <th className="text-left py-2 px-3 text-foreground-dim font-medium">
                      Integrations
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client, i) => (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.7 + i * 0.05,
                      }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-3 text-foreground font-medium">
                        {client.name}
                      </td>
                      <td className="py-3 px-3 text-foreground-muted">
                        {client.contact_email || "--"}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                            client.status === "active"
                              ? "bg-primary/10 text-primary"
                              : client.status === "prospect"
                                ? "bg-accent/10 text-accent"
                                : "bg-white/5 text-foreground-dim"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              client.status === "active"
                                ? "bg-primary"
                                : client.status === "prospect"
                                  ? "bg-accent"
                                  : "bg-foreground-dim"
                            }`}
                          />
                          {client.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-foreground-muted">
                        {client.integrationCount}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-foreground-dim text-sm">
              No clients yet. Add your first client to get started.
            </div>
          )}
        </GlowCard>
      </motion.div>
    </div>
  );
}

// --- Main Dashboard ---
export default function DashboardPage() {
  const { role } = useDashboard();

  if (role === "admin") {
    return <AdminDashboard />;
  }

  return <ClientDashboard />;
}
