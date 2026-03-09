"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LoginForm } from "@/components/ui/login-form"
import { MeshGradientBg } from "@/components/ui/mesh-gradient-bg"

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (email: string, password: string) => {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  const handleGoogleSignIn = async () => {
    setError(null)
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
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12">
      <MeshGradientBg
        colors={["#39FF14", "#2BCC10", "#0D1B2A", "#162032", "#0DB1B2", "#098F90"]}
        distortion={1.0}
        speed={0.3}
        veilOpacity="bg-background/80"
      />

      <div className="relative z-10 w-full max-w-md">
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
