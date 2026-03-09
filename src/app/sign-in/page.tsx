"use client";

import { SignIn } from "@/components/ui/sign-in";
import { MeshGradientBg } from "@/components/ui/mesh-gradient-bg";

export default function SignInPage() {
  return (
    <div className="relative min-h-screen">
      <MeshGradientBg
        colors={["#39FF14", "#2BCC10", "#0D1B2A", "#162032", "#0DB1B2", "#098F90"]}
        distortion={1.0}
        speed={0.3}
        veilOpacity="bg-background/80"
      />
      <div className="relative z-10">
        <SignIn
          signUpHref="/contact"
          onSignIn={(email, password) => {
            console.log("Sign in:", email);
          }}
        />
      </div>
    </div>
  );
}
