"use client";

import { LoginForm } from "@/components/ui/login-form";
import { MeshGradientBg } from "@/components/ui/mesh-gradient-bg";

export default function SignInPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12">
      <MeshGradientBg
        colors={["#39FF14", "#2BCC10", "#0D1B2A", "#162032", "#0DB1B2", "#098F90"]}
        distortion={1.0}
        speed={0.3}
        veilOpacity="bg-background/80"
      />

      <div className="relative z-10 w-full max-w-md">
        <LoginForm
          onSubmit={(email, password, remember) => {
            console.log("Sign in:", { email, remember });
            window.location.href = "/account-setup";
          }}
          onGoogleSignIn={() => {
            console.log("Google sign in");
            window.location.href = "/account-setup";
          }}
          signUpHref="/contact"
        />
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center text-foreground-dim text-xs z-20">
        2026 OphidianAI. All rights reserved.
      </footer>
    </div>
  );
}
