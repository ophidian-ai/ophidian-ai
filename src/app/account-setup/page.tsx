"use client";

import { useState } from "react";
import { MeshGradientBg } from "@/components/ui/mesh-gradient-bg";
import { User, Mail, Building2, ArrowRight } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";

export default function AccountSetupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    window.location.href = "/dashboard";
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12">
      <MeshGradientBg
        colors={["#39FF14", "#2BCC10", "#0D1B2A", "#162032", "#0DB1B2", "#098F90"]}
        distortion={1.0}
        speed={0.3}
        veilOpacity="bg-background/80"
      />

      <div className="relative z-10 w-full max-w-lg">
        <div className="p-8 sm:p-10 rounded-2xl backdrop-blur-md bg-background/60 border border-primary/10 shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <span className="text-background font-bold text-sm">O</span>
              </div>
              <span className="text-xl font-semibold text-foreground tracking-tight">
                OphidianAI
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Set up your account
            </h2>
            <p className="text-foreground-muted text-sm">
              Tell us a bit about yourself to get started.
            </p>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-8">
            <div className="h-1 flex-1 rounded-full bg-primary" />
            <div className="h-1 flex-1 rounded-full bg-primary/30" />
            <div className="h-1 flex-1 rounded-full bg-primary/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-foreground-muted mb-1.5">
                  First name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <User className="text-foreground-dim" size={18} />
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                    className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-foreground-muted mb-1.5">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                  className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-foreground-muted mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail className="text-foreground-dim" size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                  required
                  className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-foreground-muted mb-1.5">
                Company (optional)
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Building2 className="text-foreground-dim" size={18} />
                </div>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Inc."
                  className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>
            </div>

            <GlassButton
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="w-full"
              contentClassName="flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                "Setting up..."
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight size={18} />
                </>
              )}
            </GlassButton>
          </form>
        </div>
      </div>
    </div>
  );
}
