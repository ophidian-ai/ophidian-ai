"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { createClient } from "@/lib/supabase/client";
import type { Report } from "@/lib/supabase/types";

export default function ReportsPage() {
  const { clientId } = useDashboard();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    async function fetchData() {
      const supabase = createClient();
      const { data } = await supabase
        .from("reports")
        .select("*")
        .eq("client_id", clientId)
        .order("period_end", { ascending: false });

      setReports(data ?? []);
      setLoading(false);
    }

    fetchData();
  }, [clientId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
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
      <h1 className="text-2xl font-bold text-foreground">Reports</h1>

      {reports.length === 0 ? (
        <div className="glass rounded-xl border border-primary/10 p-12 text-center">
          <div className="text-foreground-dim text-4xl mb-4">--</div>
          <p className="text-foreground-dim">
            No reports yet. Monthly reports will appear here once your services are active.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="glass rounded-xl border border-primary/10 p-6 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <h3 className="font-medium text-foreground">{report.title}</h3>
                <p className="text-sm text-foreground-dim mt-1">
                  {new Date(report.period_start).toLocaleDateString()} &ndash;{" "}
                  {new Date(report.period_end).toLocaleDateString()}
                </p>
                <p className="text-xs text-foreground-dim mt-1">
                  Generated {new Date(report.created_at).toLocaleDateString()}
                </p>
              </div>
              <a
                href={report.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium text-primary border border-primary/20 hover:bg-primary/10 transition-colors"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
