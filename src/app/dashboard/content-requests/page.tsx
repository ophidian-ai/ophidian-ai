"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/lib/dashboard-context";
import { ModuleGuard } from "@/components/dashboard/module-guard";
import { GlassButton } from "@/components/ui/glass-button";
import { createClient } from "@/lib/supabase/client";
import type { ContentRequest, RequestStatus } from "@/lib/supabase/types";

const STATUS_STYLES: Record<RequestStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  in_progress: { label: "In Progress", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  completed: { label: "Completed", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

export default function ContentRequestsPage() {
  const { modules, clientId } = useDashboard();

  return (
    <ModuleGuard modules={modules} required="content_requests">
      <ContentRequestsContent clientId={clientId} />
    </ModuleGuard>
  );
}

function ContentRequestsContent({ clientId }: { clientId: string | null }) {
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    async function fetchData() {
      const supabase = createClient();
      const { data } = await supabase
        .from("content_requests")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      setRequests(data ?? []);
      setLoading(false);
    }

    fetchData();
  }, [clientId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Content Requests</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-xl border border-primary/10 p-6 animate-pulse">
              <div className="h-5 w-48 bg-white/5 rounded" />
              <div className="h-4 w-32 bg-white/5 rounded mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Content Requests</h1>
        <Link href="/dashboard/content-requests/new">
          <GlassButton size="sm">New Request</GlassButton>
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="glass rounded-xl border border-primary/10 p-12 text-center">
          <div className="text-foreground-dim text-4xl mb-4">--</div>
          <p className="text-foreground-dim">
            No content requests yet. Submit a request to update your website content.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const style = STATUS_STYLES[req.status];
            return (
              <div
                key={req.id}
                className="glass rounded-xl border border-primary/10 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground">{req.subject}</h3>
                    <p className="text-sm text-foreground-dim mt-1 line-clamp-2">
                      {req.description}
                    </p>
                    <p className="text-xs text-foreground-dim mt-2">
                      Submitted {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${style.className}`}
                  >
                    {style.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
