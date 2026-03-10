"use client";

import { useEffect, useState, useMemo } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { createClient } from "@/lib/supabase/client";
import type {
  Payment,
  ClientService,
  PaymentStatus,
} from "@/lib/supabase/types";

const SERVICE_LABELS: Record<string, string> = {
  web_starter: "Web Starter",
  web_professional: "Web Professional",
  web_ecommerce: "Web E-Commerce",
  seo_cleanup: "SEO Cleanup",
  seo_growth: "SEO Growth",
  maintenance: "Maintenance",
};

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, { label: string; className: string }> = {
  paid: { label: "Paid", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  overdue: { label: "Overdue", className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const MILESTONE_LABELS: Record<string, string> = {
  deposit: "Deposit",
  midpoint: "Midpoint",
  final: "Final",
  monthly: "Monthly",
};

export default function BillingPage() {
  const { clientId } = useDashboard();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [services, setServices] = useState<ClientService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    async function fetchData() {
      const supabase = createClient();

      const [paymentsRes, servicesRes] = await Promise.all([
        supabase
          .from("payments")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false }),
        supabase
          .from("client_services")
          .select("*")
          .eq("client_id", clientId),
      ]);

      setPayments(paymentsRes.data ?? []);
      setServices(servicesRes.data ?? []);
      setLoading(false);
    }

    fetchData();
  }, [clientId]);

  const activeSubscriptions = useMemo(
    () => services.filter((s) => s.monthly_amount != null && s.status === "active"),
    [services]
  );

  const nextPayment = useMemo(() => {
    const pending = payments
      .filter((p) => p.status === "pending" && p.due_date)
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
    return pending[0] ?? null;
  }, [payments]);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <div className="glass rounded-xl border border-primary/10 p-6 animate-pulse">
          <div className="h-6 w-48 bg-white/5 rounded" />
          <div className="h-32 w-full bg-white/5 rounded mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Billing</h1>

      {/* Next Payment Due */}
      {nextPayment && (
        <div className="glass rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
          <p className="text-sm text-foreground-dim">Next Payment Due</p>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(nextPayment.amount)}
            </span>
            <span className="text-sm text-foreground-dim">
              {MILESTONE_LABELS[nextPayment.milestone_label] ?? nextPayment.milestone_label}
              {nextPayment.due_date &&
                ` -- Due ${new Date(nextPayment.due_date).toLocaleDateString()}`}
            </span>
          </div>
        </div>
      )}

      {/* Active Subscriptions */}
      {activeSubscriptions.length > 0 && (
        <div className="glass rounded-xl border border-primary/10 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Active Subscriptions
          </h2>
          <div className="space-y-3">
            {activeSubscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {SERVICE_LABELS[sub.service_type] ?? sub.service_type}
                  </p>
                  <p className="text-xs text-foreground-dim">
                    Since {new Date(sub.started_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-foreground font-medium">
                  {formatCurrency(sub.monthly_amount!)}/mo
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      {payments.length > 0 ? (
        <div className="glass rounded-xl border border-primary/10 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Payment History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 pr-4 text-foreground-dim font-medium">Date</th>
                  <th className="text-left py-2 px-4 text-foreground-dim font-medium">Milestone</th>
                  <th className="text-right py-2 px-4 text-foreground-dim font-medium">Amount</th>
                  <th className="text-right py-2 pl-4 text-foreground-dim font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const style = PAYMENT_STATUS_STYLES[payment.status];
                  return (
                    <tr key={payment.id} className="border-b border-white/5">
                      <td className="py-3 pr-4 text-foreground">
                        {payment.paid_at
                          ? new Date(payment.paid_at).toLocaleDateString()
                          : payment.due_date
                            ? new Date(payment.due_date).toLocaleDateString()
                            : "--"}
                      </td>
                      <td className="py-3 px-4 text-foreground-dim">
                        {MILESTONE_LABELS[payment.milestone_label] ?? payment.milestone_label}
                      </td>
                      <td className="text-right py-3 px-4 text-foreground font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="text-right py-3 pl-4">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${style.className}`}
                        >
                          {style.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass rounded-xl border border-primary/10 p-12 text-center">
          <div className="text-foreground-dim text-4xl mb-4">--</div>
          <p className="text-foreground-dim">
            No payment history yet.
          </p>
        </div>
      )}
    </div>
  );
}
