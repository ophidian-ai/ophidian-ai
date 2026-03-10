"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import {
  Users,
  Plus,
  Search,
  ChevronRight,
} from "lucide-react";
import type {
  Client,
  ClientService,
  Project,
  ServiceType,
  ProjectPhase,
} from "@/lib/supabase/types";

type FilterType = "all" | "active" | "completed";

interface ClientWithRelations extends Client {
  client_services: ClientService[];
  projects: Project[];
}

const SERVICE_LABELS: Record<ServiceType, string> = {
  web_starter: "Web Starter",
  web_professional: "Web Pro",
  web_ecommerce: "Web E-Commerce",
  seo_cleanup: "SEO Cleanup",
  seo_growth: "SEO Growth",
  maintenance: "Maintenance",
};

const SERVICE_COLORS: Record<ServiceType, string> = {
  web_starter: "bg-green-500/15 text-green-400 border-green-500/30",
  web_professional: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  web_ecommerce: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  seo_cleanup: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  seo_growth: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  maintenance: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

export default function AdminClientsPage() {
  const router = useRouter();
  const { role } = useDashboard();
  const [clients, setClients] = useState<ClientWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchClients() {
      const res = await fetch("/api/admin/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients ?? []);
      }
      setLoading(false);
    }

    fetchClients();
  }, [role, router]);

  const filteredClients = useMemo(() => {
    let result = clients;

    // Filter
    if (filter === "active") {
      result = result.filter((c) =>
        c.client_services.some((s) => s.status === "active")
      );
    } else if (filter === "completed") {
      result = result.filter(
        (c) =>
          c.client_services.length > 0 &&
          c.client_services.every((s) => s.status === "completed")
      );
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.company_name.toLowerCase().includes(q) ||
          c.contact_email.toLowerCase().includes(q)
      );
    }

    return result;
  }, [clients, filter, search]);

  if (role !== "admin") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  function getProjectPhase(client: ClientWithRelations): ProjectPhase | null {
    const activeProject = client.projects.find((p) => p.status === "active");
    return activeProject?.phase ?? null;
  }

  function getClientStatus(client: ClientWithRelations): string {
    if (client.client_services.some((s) => s.status === "active"))
      return "Active";
    if (client.client_services.every((s) => s.status === "completed"))
      return "Completed";
    return "Inactive";
  }

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-foreground-muted text-sm mt-1">
            {clients.length} total client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <GlassButton size="sm" href="/dashboard/admin/clients/new">
          <span className="flex items-center gap-2">
            <Plus size={16} />
            Add Client
          </span>
        </GlassButton>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                filter === f.value
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-foreground-muted hover:text-foreground border border-white/10 hover:border-white/20"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
          />
          <input
            type="text"
            placeholder="Search by company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface/50 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* Client Table */}
      <GlowCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Company
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Services
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Phase
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-foreground-muted text-sm"
                  >
                    No clients found.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const phase = getProjectPhase(client);
                  const status = getClientStatus(client);
                  return (
                    <tr
                      key={client.id}
                      onClick={() =>
                        router.push(`/dashboard/admin/clients/${client.id}`)
                      }
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-foreground">
                        {client.company_name}
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground-muted">
                        {client.contact_email}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {client.client_services.map((s) => (
                            <span
                              key={s.id}
                              className={`text-xs px-2 py-0.5 rounded-full border ${SERVICE_COLORS[s.service_type]}`}
                            >
                              {SERVICE_LABELS[s.service_type]}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground-muted capitalize">
                        {phase ?? "-"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            status === "Active"
                              ? "bg-green-500/15 text-green-400 border-green-500/30"
                              : status === "Completed"
                                ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                : "bg-gray-500/15 text-gray-400 border-gray-500/30"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <ChevronRight
                          size={16}
                          className="text-foreground-muted"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlowCard>
    </div>
  );
}
