"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MeshGradientBg } from "@/components/ui/mesh-gradient-bg"
import { GlassButton } from "@/components/ui/glass-button"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"

export default function SignUpPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    setIsSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(true)
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12">
      <MeshGradientBg
        colors={["#39FF14", "#2BCC10", "#0D1B2A", "#162032", "#0DB1B2", "#098F90"]}
        distortion={1.0}
        speed={0.3}
        veilOpacity="bg-background/80"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="p-8 sm:p-10 rounded-2xl backdrop-blur-md bg-background/60 border border-primary/10 shadow-2xl shadow-black/40">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
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
              Create an account
            </h2>
            <p className="text-foreground-muted text-sm">
              Get started with OphidianAI
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
                Check your email to confirm your account.
              </div>
              <button
                onClick={() => router.push("/sign-in")}
                className="text-sm text-foreground-muted hover:text-primary transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <User className="text-foreground-dim" size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail className="text-foreground-dim" size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="text-foreground-dim" size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-dim hover:text-foreground focus:outline-none transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex justify-center">
                <GlassButton
                  type="submit"
                  disabled={isSubmitting}
                  size="default"
                >
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </GlassButton>
              </div>
            </form>
          )}

          {!success && (
            <p className="mt-6 text-center text-sm text-foreground-dim">
              Already have an account?{" "}
              <a
                href="/sign-in"
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                Sign In
              </a>
            </p>
          )}
        </div>
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center text-foreground-dim text-xs z-20">
        2026 OphidianAI. All rights reserved.
      </footer>
    </div>
  )
}
