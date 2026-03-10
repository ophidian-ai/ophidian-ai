"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { ModuleGuard } from "@/components/dashboard/module-guard";
import { GlassButton } from "@/components/ui/glass-button";

export default function NewContentRequestPage() {
  const { modules } = useDashboard();

  return (
    <ModuleGuard modules={modules} required="content_requests">
      <NewRequestForm />
    </ModuleGuard>
  );
}

function NewRequestForm() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/content-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, description }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit request");
      }

      router.push("/dashboard/content-requests");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">New Content Request</h1>

      <form onSubmit={handleSubmit} className="glass rounded-xl border border-primary/10 p-6 space-y-6">
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-foreground-dim mb-2">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="What needs to be updated?"
            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-foreground placeholder:text-foreground-dim/50 focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground-dim mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={6}
            placeholder="Describe the changes you'd like..."
            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-foreground placeholder:text-foreground-dim/50 focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 resize-y"
          />
        </div>

        <div className="flex gap-3">
          <GlassButton type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Request"}
          </GlassButton>
          <button
            type="button"
            onClick={() => router.push("/dashboard/content-requests")}
            className="px-6 py-3.5 rounded-full text-foreground-dim hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
