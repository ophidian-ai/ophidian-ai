"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MeshGradientBg } from "@/components/ui/mesh-gradient-bg";
import { Lock, Phone, Eye, EyeOff, ArrowRight, User } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { formatPhone } from "@/lib/format-phone";
import Image from "next/image";

export default function AccountSetupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Listen for auth state changes -- recovery links deliver tokens
    // via URL hash fragments that the Supabase client exchanges automatically
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const fullName = session.user.user_metadata?.full_name || "";
        const parts = fullName.split(" ");
        setUserName(parts[0] || "there");
        if (parts[0] && !firstName) setFirstName(parts[0]);
        if (parts.length > 1 && !lastName) setLastName(parts.slice(1).join(" "));
      }
    });

    // Also check if already authenticated
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const fullName = user.user_metadata?.full_name || "";
        const parts = fullName.split(" ");
        setUserName(parts[0] || "there");
        if (parts[0] && !firstName) setFirstName(parts[0]);
        if (parts.length > 1 && !lastName) setLastName(parts.slice(1).join(" "));
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, firstName, lastName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    // Update password
    const { error: pwError } = await supabase.auth.updateUser({
      password,
    });

    if (pwError) {
      setError(pwError.message);
      setIsSubmitting(false);
      return;
    }

    // Update profile with name and phone
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const profileUpdate: Record<string, string> = {};
      if (fullName) profileUpdate.full_name = fullName;
      if (phone.trim()) profileUpdate.phone = phone.trim();

      if (Object.keys(profileUpdate).length > 0) {
        await supabase
          .from("profiles")
          .update(profileUpdate)
          .eq("id", user.id);
      }
    }

    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12">
      <MeshGradientBg
        colors={[
          "#39FF14",
          "#2BCC10",
          "#0A0A0A",
          "#161616",
          "#0DB1B2",
          "#098F90",
        ]}
        distortion={1.0}
        speed={0.3}
        veilOpacity="bg-background/80"
      />

      <div className="relative z-10 w-full max-w-lg">
        <div className="p-8 sm:p-10 rounded-2xl backdrop-blur-md bg-background/60 border border-primary/10 shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/images/logo_icon.png"
                alt="OphidianAI"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-semibold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                OphidianAI
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Welcome{userName ? `, ${userName}` : ""}
            </h2>
            <p className="text-foreground-muted text-sm">
              Set your password and complete your profile to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-foreground-muted mb-1.5">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <User className="text-foreground-dim" size={18} />
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    required
                    className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-foreground-muted mb-1.5">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <User className="text-foreground-dim" size={18} />
                  </div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    required
                    className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-foreground-muted mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="text-foreground-dim" size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-dim hover:text-foreground focus:outline-none transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-foreground-muted mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="text-foreground-dim" size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm text-foreground-muted mb-1.5">
                Phone Number{" "}
                <span className="text-foreground-dim">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Phone className="text-foreground-dim" size={18} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(555) 123-4567"
                  className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

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

      <footer className="absolute bottom-4 left-0 right-0 text-center text-foreground-dim text-xs z-20">
        2026 OphidianAI. All rights reserved.
      </footer>
    </div>
  );
}
