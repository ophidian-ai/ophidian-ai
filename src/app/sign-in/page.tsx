"use client"

import { Suspense, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LoginForm } from "@/components/ui/login-form"
import { MeshGradientBg } from "@/components/ui/mesh-gradient-bg"

function SignInContent() {
  const searchParams = useSearchParams()
  const sessionExpired = searchParams.get("reason") === "session_expired"
  const [error, setError] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSignIn = async (email: string, password: string, remember: boolean) => {
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
        return
      }

      // Set remember-me cookie and last-activity timestamp
      const cookieOpts = remember
        ? ";path=/;max-age=" + 30 * 24 * 60 * 60 + ";samesite=lax"
        : ";path=/;samesite=lax"
      document.cookie = `remember_me=${remember}${cookieOpts}`
      document.cookie = `last_activity=${Date.now()}${cookieOpts}`

      // Save or clear remembered email
      if (remember) {
        localStorage.setItem("remembered_email", email)
      } else {
        localStorage.removeItem("remembered_email")
      }

      // Fade out then hard-navigate to bypass Next.js router cache
      setIsTransitioning(true)
      await new Promise((resolve) => setTimeout(resolve, 400))
      window.location.href = "/dashboard"
    } catch (err) {
      setIsTransitioning(false)
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.")
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative min-h-screen w-full flex items-center justify-center px-4 py-12 transition-opacity duration-400 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
    >
      <MeshGradientBg
        colors={["#39FF14", "#2BCC10", "#0A0A0A", "#161616", "#0DB1B2", "#098F90"]}
        distortion={1.0}
        speed={0.3}
        veilOpacity="bg-background/80"
      />

      <div className="relative z-10 w-full max-w-md">
        {sessionExpired && !error && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm text-center">
            Your session expired due to inactivity. Please sign in again.
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        <LoginForm
          onSubmit={handleSignIn}
          onGoogleSignIn={handleGoogleSignIn}
          signUpHref="/sign-up"
        />
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center text-foreground-dim text-xs z-20">
        2026 OphidianAI. All rights reserved.
      </footer>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  )
}
