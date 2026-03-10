"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import { ArrowLeft } from "lucide-react";
import type { ServiceType } from "@/lib/supabase/types";

interface ServiceOption {
  value: ServiceType;
  label: string;
  description: string;
}

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    value: "web_starter",
    label: "Web Starter",
    description: "Single-page website with essential sections",
  },
  {
    value: "web_professional",
    label: "Web Professional",
    description: "Multi-page website with advanced features",
  },
  {
    value: "web_ecommerce",
    label: "Web E-Commerce",
    description: "Full online store with product management",
  },
  {
    value: "seo_cleanup",
    label: "SEO Cleanup",
    description: "One-time technical SEO audit and fixes",
  },
  {
    value: "seo_growth",
    label: "SEO Growth",
    description: "Ongoing SEO management and content strategy",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    description: "Monthly updates, monitoring, and support",
  },
];

export default function NewClientPage() {
  const router = useRouter();
  const { role } = useDashboard();

  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (role !== "admin") {
    router.replace("/dashboard");
    return null;
  }

  function toggleService(service: ServiceType) {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!companyName.trim() || !contactEmail.trim()) {
      setError("Company name and contact email are required.");
      return;
    }

    if (selectedServices.length === 0) {
      setError("Select at least one service.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName.trim(),
          contact_email: contactEmail.trim(),
          website_url: websiteUrl.trim() || undefined,
          services: selectedServices,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create client.");
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      router.push(`/dashboard/admin/clients/${data.client.id}`);
    } catch {
      setError("An unexpected error occurred.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/admin/clients")}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} className="text-foreground-muted" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Add New Client
          </h1>
          <p className="text-foreground-muted text-sm mt-0.5">
            Create a client account and assign services
          </p>
        </div>
      </div>

      {/* Form */}
      <GlowCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Company Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Corp"
              className="w-full px-4 py-2.5 bg-surface/50 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary/50"
              required
            />
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Contact Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contact@example.com"
              className="w-full px-4 py-2.5 bg-surface/50 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary/50"
              required
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Website URL
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 bg-surface/50 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Services <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICE_OPTIONS.map((option) => {
                const selected = selectedServices.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleService(option.value)}
                    className={`text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                      selected
                        ? "border-primary/50 bg-primary/10"
                        : "border-white/10 hover:border-white/20 bg-surface/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selected
                            ? "border-primary bg-primary"
                            : "border-white/30"
                        }`}
                      >
                        {selected && (
                          <svg
                            viewBox="0 0 12 12"
                            className="w-2.5 h-2.5 text-background"
                          >
                            <path
                              d="M10 3L4.5 8.5 2 6"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {option.label}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-muted mt-1 ml-6">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <GlassButton
              type="button"
              size="sm"
              onClick={() => router.push("/dashboard/admin/clients")}
            >
              Cancel
            </GlassButton>
            <GlassButton type="submit" size="sm" disabled={submitting}>
              {submitting ? "Creating..." : "Create Client"}
            </GlassButton>
          </div>
        </form>
      </GlowCard>
    </div>
  );
}
