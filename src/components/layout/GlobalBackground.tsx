"use client";

import { MeshGradientBg } from "@/components/ui/mesh-gradient-bg";

export function GlobalBackground() {
  return (
    <MeshGradientBg
      colors={["#39FF14", "#2BCC10", "#0A0A0A", "#161616", "#0DB1B2", "#098F90"]}
      distortion={0.8}
      swirl={0.6}
      speed={0.3}
      veilOpacity="bg-background/75"
    />
  );
}
