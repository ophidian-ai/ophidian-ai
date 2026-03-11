"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import { ArrowLeft, Plus, X } from "lucide-react";
import type { ServiceType, PaymentMilestone } from "@/lib/supabase/types";
import { formatPhone } from "@/lib/format-phone";

interface ServiceOption {
  value: ServiceType;
  label: string;
}

interface DiscountOption {
  code: string;
  label: string;
  amount: number; // in cents
}

interface ServiceTemplate {
  scope: string;
  timeline: string;
  deliverables: string[];
  basePrice: string;
}

const SERVICE_OPTIONS: ServiceOption[] = [
  { value: "web_starter", label: "Web Starter" },
  { value: "web_professional", label: "Web Professional" },
  { value: "web_ecommerce", label: "Web E-Commerce" },
  { value: "seo_cleanup", label: "SEO Cleanup" },
  { value: "seo_growth", label: "SEO Growth" },
  { value: "maintenance", label: "Maintenance" },
];

const SERVICE_TEMPLATES: Record<ServiceType, ServiceTemplate> = {
  web_starter: {
    scope: "Design and build a modern, mobile-responsive website with up to 5 pages. Includes basic on-page SEO setup, contact form integration, and 2 rounds of design revisions.",
    timeline: "1-2 weeks from kickoff",
    deliverables: [
      "Custom homepage design",
      "Up to 4 additional pages (About, Services, Contact, etc.)",
      "Mobile-responsive design",
      "Basic on-page SEO (meta tags, headings, alt text)",
      "Contact form with email notifications",
      "Google Maps embed",
      "Social media links",
      "SSL certificate and hosting setup",
    ],
    basePrice: "2200",
  },
  web_professional: {
    scope: "Design and build a full-featured, mobile-responsive website with up to 10 pages. Includes comprehensive SEO setup, AI-assisted copywriting, Google Business Profile optimization, unlimited design revisions, and ongoing support options.",
    timeline: "2-3 weeks from kickoff",
    deliverables: [
      "Custom homepage design with brand-aligned visuals",
      "Up to 9 additional pages",
      "Mobile-responsive design optimized for all devices",
      "Full on-page SEO (meta tags, schema markup, sitemap, robots.txt)",
      "AI-assisted copywriting for all pages",
      "Google Business Profile setup and optimization",
      "Contact form with email notifications",
      "Google Maps embed",
      "Social media integration",
      "Analytics setup (Google Analytics / Search Console)",
      "SSL certificate and hosting setup",
      "Unlimited design revisions",
    ],
    basePrice: "3500",
  },
  web_ecommerce: {
    scope: "Design and build a full e-commerce website with product catalog, shopping cart, and Stripe payment integration. Includes everything in the Professional tier plus inventory management, order notifications, and checkout flow.",
    timeline: "3-4 weeks from kickoff",
    deliverables: [
      "Custom homepage and storefront design",
      "Product catalog with categories and search",
      "Shopping cart and secure checkout (Stripe)",
      "Order confirmation and notification emails",
      "Up to 8 additional pages",
      "Mobile-responsive design optimized for all devices",
      "Full on-page SEO with product schema markup",
      "AI-assisted copywriting for all pages",
      "Google Business Profile setup and optimization",
      "Analytics setup (Google Analytics / Search Console)",
      "SSL certificate and hosting setup",
      "Unlimited design revisions",
    ],
    basePrice: "4500",
  },
  seo_cleanup: {
    scope: "Comprehensive SEO audit and done-for-you cleanup of your existing website. Includes fixing technical issues, optimizing on-page elements, improving site speed, and submitting to search engines.",
    timeline: "1-2 weeks",
    deliverables: [
      "Full SEO audit report with findings",
      "Meta tag optimization (titles, descriptions) for all pages",
      "Heading structure and content optimization",
      "Image alt text and compression",
      "XML sitemap creation and submission",
      "Google Search Console setup and verification",
      "Robots.txt optimization",
      "Fix broken links and redirect issues",
      "Page speed improvements",
    ],
    basePrice: "800",
  },
  seo_growth: {
    scope: "Ongoing monthly SEO growth retainer focused on improving search rankings, driving organic traffic, and tracking performance. Includes keyword research, content strategy, and monthly reporting.",
    timeline: "3-month minimum commitment",
    deliverables: [
      "Monthly keyword research and tracking",
      "Content strategy and optimization recommendations",
      "On-page SEO updates and improvements",
      "Google Business Profile management",
      "Monthly performance report with analytics",
      "Competitor analysis",
      "Local SEO optimization",
    ],
    basePrice: "250",
  },
  maintenance: {
    scope: "Monthly website maintenance and support. Includes hosting, SSL management, security monitoring, minor content updates, uptime monitoring, and priority support.",
    timeline: "Month-to-month",
    deliverables: [
      "Vercel hosting and SSL management",
      "Security monitoring and updates",
      "Minor content updates (text, images)",
      "Uptime monitoring with alerts",
      "Monthly performance check",
      "Priority email support",
    ],
    basePrice: "100",
  },
};

const DISCOUNT_OPTIONS: DiscountOption[] = [
  { code: "DISCOUNT_REFERRAL", label: "Referral Discount", amount: 50000 },
  { code: "DISCOUNT_RELIGION", label: "Religious Institution Discount", amount: 50000 },
];

function buildPaymentSchedule(
  finalPriceCents: number,
  serviceType: ServiceType | ""
): Array<{ milestone: PaymentMilestone; amount: number; percentage: number }> {
  if (finalPriceCents <= 0) return [];

  if (serviceType === "maintenance") {
    return [
      { milestone: "monthly", amount: finalPriceCents, percentage: 100 },
    ];
  }

  const deposit = Math.round(finalPriceCents * 0.4);
  const midpoint = Math.round(finalPriceCents * 0.3);
  const final = finalPriceCents - deposit - midpoint;

  return [
    { milestone: "deposit", amount: deposit, percentage: 40 },
    { milestone: "midpoint", amount: midpoint, percentage: 30 },
    { milestone: "final", amount: final, percentage: 30 },
  ];
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function NewProposalPage() {
  const router = useRouter();
  const { role } = useDashboard();

  // Client fields
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");

  // Proposal fields
  const [serviceType, setServiceType] = useState<ServiceType | "">("");
  const [scope, setScope] = useState("");
  const [timeline, setTimeline] = useState("");
  const [deliverables, setDeliverables] = useState<string[]>([""]);
  const [basePriceDollars, setBasePriceDollars] = useState("");
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);

  // Form state
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const basePriceCents = useMemo(() => {
    const val = parseFloat(basePriceDollars);
    return isNaN(val) ? 0 : Math.round(val * 100);
  }, [basePriceDollars]);

  const activeDiscounts = useMemo(
    () => DISCOUNT_OPTIONS.filter((d) => selectedDiscounts.includes(d.code)),
    [selectedDiscounts]
  );

  const totalDiscountCents = useMemo(
    () => activeDiscounts.reduce((sum, d) => sum + d.amount, 0),
    [activeDiscounts]
  );

  const finalPriceCents = useMemo(
    () => Math.max(0, basePriceCents - totalDiscountCents),
    [basePriceCents, totalDiscountCents]
  );

  const paymentSchedule = useMemo(
    () => buildPaymentSchedule(finalPriceCents, serviceType),
    [finalPriceCents, serviceType]
  );

  if (role !== "admin") {
    router.replace("/dashboard");
    return null;
  }

  function applyTemplate(type: ServiceType) {
    const template = SERVICE_TEMPLATES[type];
    setScope(template.scope);
    setTimeline(template.timeline);
    setDeliverables(template.deliverables);
    setBasePriceDollars(template.basePrice);
  }

  function toggleDiscount(code: string) {
    setSelectedDiscounts((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  function addDeliverable() {
    setDeliverables((prev) => [...prev, ""]);
  }

  function updateDeliverable(idx: number, value: string) {
    setDeliverables((prev) => prev.map((d, i) => (i === idx ? value : d)));
  }

  function removeDeliverable(idx: number) {
    setDeliverables((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!contactName.trim() || !contactEmail.trim() || !companyName.trim()) {
      setError("Contact name, email, and company name are required.");
      return;
    }

    if (!serviceType) {
      setError("Please select a service type.");
      return;
    }

    setSubmitting(true);

    const cleanedDeliverables = deliverables.filter((d) => d.trim() !== "");

    const content = {
      serviceType,
      scope: scope.trim(),
      timeline: timeline.trim(),
      deliverables: cleanedDeliverables,
      discounts: activeDiscounts.map((d) => ({
        code: d.code,
        label: d.label,
        amount: d.amount,
      })),
      basePrice: basePriceCents,
      finalPrice: finalPriceCents,
    };

    try {
      const res = await fetch("/api/admin/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_name: contactName.trim(),
          contact_email: contactEmail.trim(),
          company_name: companyName.trim(),
          phone: phone.trim() || undefined,
          content,
          payment_schedule: paymentSchedule,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create proposal.");
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      router.push(`/dashboard/admin/proposals/${data.proposal_id}`);
    } catch {
      setError("An unexpected error occurred.");
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full px-4 py-2.5 bg-surface/50 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary/50";

  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push("/dashboard/admin/proposals")}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} className="text-foreground-muted" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Proposal</h1>
          <p className="text-foreground-muted text-sm mt-0.5">
            Create a prospect client and draft a proposal
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Info */}
        <GlowCard className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Client Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Contact Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Jane Smith"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="jane@acme.com"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(555) 555-5555"
                className={inputClass}
              />
            </div>
          </div>
        </GlowCard>

        {/* Proposal Details */}
        <GlowCard className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Proposal Details</h2>

          {/* Service Type */}
          <div>
            <label className={labelClass}>
              Service Type <span className="text-red-400">*</span>
            </label>
            <select
              value={serviceType}
              onChange={(e) => {
                const type = e.target.value as ServiceType;
                setServiceType(type);
                if (type) applyTemplate(type);
              }}
              className={`${inputClass} cursor-pointer`}
              required
            >
              <option value="" disabled>
                Select a service...
              </option>
              {SERVICE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Scope */}
          <div>
            <label className={labelClass}>Scope of Work</label>
            <textarea
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="Describe what is included in this engagement..."
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Timeline */}
          <div>
            <label className={labelClass}>Timeline</label>
            <input
              type="text"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="e.g. 4-6 weeks from kickoff"
              className={inputClass}
            />
          </div>

          {/* Deliverables */}
          <div>
            <label className={labelClass}>Deliverables</label>
            <div className="space-y-2">
              {deliverables.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateDeliverable(idx, e.target.value)}
                    placeholder={`Deliverable ${idx + 1}`}
                    className={`${inputClass} flex-1`}
                  />
                  {deliverables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDeliverable(idx)}
                      className="p-2 text-foreground-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addDeliverable}
                className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors cursor-pointer mt-1"
              >
                <Plus size={14} />
                Add deliverable
              </button>
            </div>
          </div>
        </GlowCard>

        {/* Pricing */}
        <GlowCard className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Pricing</h2>

          {/* Base Price */}
          <div>
            <label className={labelClass}>Base Price (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted text-sm">
                $
              </span>
              <input
                type="number"
                value={basePriceDollars}
                onChange={(e) => setBasePriceDollars(e.target.value)}
                placeholder="0"
                min="0"
                step="1"
                className={`${inputClass} pl-8`}
              />
            </div>
          </div>

          {/* Discounts */}
          <div>
            <label className={labelClass}>Discounts</label>
            <div className="space-y-2">
              {DISCOUNT_OPTIONS.map((discount) => {
                const selected = selectedDiscounts.includes(discount.code);
                return (
                  <button
                    key={discount.code}
                    type="button"
                    onClick={() => toggleDiscount(discount.code)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors cursor-pointer ${
                      selected
                        ? "border-primary/50 bg-primary/10"
                        : "border-white/10 hover:border-white/20 bg-surface/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                            selected ? "border-primary bg-primary" : "border-white/30"
                          }`}
                        >
                          {selected && (
                            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-background">
                              <path
                                d="M10 3L4.5 8.5 2 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-foreground">{discount.label}</span>
                      </div>
                      <span className="text-sm text-red-400">
                        -{formatCurrency(discount.amount)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Summary */}
          <div className="border-t border-white/10 pt-4 space-y-2">
            {basePriceCents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Base Price</span>
                <span className="text-foreground">{formatCurrency(basePriceCents)}</span>
              </div>
            )}
            {totalDiscountCents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Total Discounts</span>
                <span className="text-red-400">-{formatCurrency(totalDiscountCents)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span className="text-foreground">Final Price</span>
              <span className="text-primary text-lg">{formatCurrency(finalPriceCents)}</span>
            </div>
          </div>

          {/* Payment Schedule Preview */}
          {paymentSchedule.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-2">
                Payment Schedule
              </p>
              <div className="space-y-1.5">
                {paymentSchedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm text-foreground-muted bg-surface/30 rounded-lg px-3 py-2"
                  >
                    <span className="capitalize">
                      {item.milestone} ({item.percentage}%)
                    </span>
                    <span className="text-foreground">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlowCard>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <GlassButton
            type="button"
            size="sm"
            onClick={() => router.push("/dashboard/admin/proposals")}
          >
            Cancel
          </GlassButton>
          <GlassButton type="submit" size="sm" disabled={submitting}>
            {submitting ? "Creating..." : "Create Proposal"}
          </GlassButton>
        </div>
      </form>
    </div>
  );
}
