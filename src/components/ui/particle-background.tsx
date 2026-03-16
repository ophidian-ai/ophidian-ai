"use client";

import { SparklesCore } from "@/components/ui/sparkles";

interface ParticleBackgroundProps {
  color?: string;
  density?: number;
  speed?: number;
  size?: number;
  opacity?: number;
  glow?: boolean;
}

export function ParticleBackground({
  color = "#C4A265",
  density = 800,
  speed = 0.4,
  size = 0.8,
  opacity = 0.3,
  glow = false,
}: ParticleBackgroundProps) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 h-full w-full z-0">
        <SparklesCore
          className="h-full w-full"
          color={color}
          density={density}
          speed={speed}
          size={size}
          opacity={opacity}
          direction="top"
        />
      </div>
      {glow && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full opacity-40 z-0"
          style={{
            background: "radial-gradient(ellipse at center, rgba(196,162,101,0.15) 0%, transparent 70%)",
          }}
        />
      )}
    </>
  );
}
