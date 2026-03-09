"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Bot,
  BarChart3,
  Package,
  Settings,
  LogOut,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Users,
  Zap,
  ChevronRight,
  Bell,
  Search,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- Data ---
const revenueData = [
  { month: "Jan", revenue: 2400, cost: 1200 },
  { month: "Feb", revenue: 3600, cost: 1400 },
  { month: "Mar", revenue: 4200, cost: 1600 },
  { month: "Apr", revenue: 3800, cost: 1500 },
  { month: "May", revenue: 5100, cost: 1800 },
  { month: "Jun", revenue: 6200, cost: 2000 },
];

const usageData = [
  { day: "Mon", calls: 320 },
  { day: "Tue", calls: 450 },
  { day: "Wed", calls: 380 },
  { day: "Thu", calls: 520 },
  { day: "Fri", calls: 610 },
  { day: "Sat", calls: 280 },
  { day: "Sun", calls: 190 },
];

const integrations = [
  { name: "AI Chatbot Pro", status: "active", usage: 87, icon: Bot },
  { name: "Document Processor", status: "active", usage: 62, icon: Zap },
  { name: "Analytics Engine", status: "active", usage: 45, icon: BarChart3 },
  { name: "Lead Qualifier", status: "paused", usage: 0, icon: Users },
];

const recentActivity = [
  { action: "Chatbot handled 142 conversations", time: "2 hours ago", type: "success" },
  { action: "Document batch processed (38 files)", time: "5 hours ago", type: "success" },
  { action: "Analytics report generated", time: "8 hours ago", type: "info" },
  { action: "API rate limit warning", time: "1 day ago", type: "warning" },
];

// --- Sidebar ---
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Bot, label: "AI Integrations", active: false },
  { icon: BarChart3, label: "Analytics", active: false },
  { icon: Package, label: "Products", active: false },
  { icon: Settings, label: "Settings", active: false },
];

function Sidebar() {
  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-background/80 backdrop-blur-xl border-r border-primary/10 flex flex-col z-30">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
          <span className="text-background font-bold text-sm">O</span>
        </div>
        <span className="text-lg font-semibold text-foreground tracking-tight">
          OphidianAI
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              item.active
                ? "bg-primary/10 text-primary"
                : "text-foreground-muted hover:text-foreground hover:bg-white/5"
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-primary/10">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// --- Stat Card ---
function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  delay,
}: {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  icon: React.ElementType;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="glass rounded-xl border border-primary/10 p-5 hover:border-primary/20 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon size={20} className="text-primary" />
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            changeType === "up" ? "text-primary" : "text-red-400"
          }`}
        >
          {changeType === "up" ? (
            <TrendingUp size={14} />
          ) : (
            <TrendingDown size={14} />
          )}
          {change}
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-foreground-muted mt-1">{title}</div>
    </motion.div>
  );
}

// --- Chart Card ---
function ChartCard({
  title,
  children,
  delay,
}: {
  title: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="glass rounded-xl border border-primary/10 p-5"
    >
      <h3 className="text-sm font-medium text-foreground-muted mb-4">
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

// --- Main Dashboard ---
export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-primary/10 px-6 py-4 flex items-center justify-between">
          <div className="relative w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-dim"
            />
            <input
              type="text"
              placeholder="Search integrations, reports..."
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
              <span className="text-background text-xs font-bold">JD</span>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-foreground-muted text-sm mt-1">
              Overview of your AI integrations and usage
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value="$18,342.00"
              change="+12.5%"
              changeType="up"
              icon={DollarSign}
              delay={0.1}
            />
            <StatCard
              title="AI API Calls"
              value="52,240"
              change="+8.2%"
              changeType="up"
              icon={Activity}
              delay={0.15}
            />
            <StatCard
              title="Active Integrations"
              value="3"
              change="+1"
              changeType="up"
              icon={Zap}
              delay={0.2}
            />
            <StatCard
              title="End Users Served"
              value="1,847"
              change="-2.1%"
              changeType="down"
              icon={Users}
              delay={0.25}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard title="Revenue Overview" delay={0.3}>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#39FF14"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#39FF14"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="month"
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#162032",
                        border: "1px solid rgba(57,255,20,0.2)",
                        borderRadius: "8px",
                        color: "#F1F5F9",
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#39FF14"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="API Usage (This Week)" delay={0.35}>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="day"
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                    />
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
                      dataKey="calls"
                      fill="#39FF14"
                      radius={[4, 4, 0, 0]}
                      opacity={0.8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Integrations List */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="glass rounded-xl border border-primary/10 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground-muted">
                  AI Integrations
                </h3>
                <button className="text-xs text-primary hover:underline cursor-pointer">
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {integrations.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.5 + i * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-primary/15 transition-colors cursor-pointer group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon size={16} className="text-primary" />
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
                        {item.usage > 0 && (
                          <span className="text-xs text-foreground-dim">
                            {item.usage}% capacity
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-foreground-dim group-hover:text-primary transition-colors"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="glass rounded-xl border border-primary/10 p-5"
          >
            <h3 className="text-sm font-medium text-foreground-muted mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.6 + i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex items-center gap-3 py-2"
                >
                  <span
                    className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      item.type === "success"
                        ? "bg-primary"
                        : item.type === "warning"
                        ? "bg-yellow-400"
                        : "bg-accent"
                    }`}
                  />
                  <span className="text-sm text-foreground flex-1">
                    {item.action}
                  </span>
                  <span className="text-xs text-foreground-dim whitespace-nowrap">
                    {item.time}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
