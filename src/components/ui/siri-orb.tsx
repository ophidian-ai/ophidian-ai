"use client"

import { cn } from "@/lib/utils"

interface SiriOrbProps {
  size?: string
  className?: string
  colors?: {
    bg?: string
    c1?: string
    c2?: string
    c3?: string
  }
  animationDuration?: number
}

const SiriOrb: React.FC<SiriOrbProps> = ({
  size = "192px",
  className,
  colors,
  animationDuration = 20,
}) => {
  const defaultColors = {
    bg: "transparent",
    c1: "#39FF14",
    c2: "#0DB1B2",
    c3: "#5FFF42",
  }

  const finalColors = { ...defaultColors, ...colors }
  const sizeValue = parseInt(size.replace("px", ""), 10)

  const blurAmount = sizeValue <= 80 ? Math.max(sizeValue * 0.05, 3) : Math.max(sizeValue * 0.06, 6)
  const contrastAmount = sizeValue <= 80 ? 3.5 : 2.5

  return (
    <div
      className={cn("siri-orb", className)}
      style={
        {
          width: size,
          height: size,
          "--bg": finalColors.bg,
          "--c1": finalColors.c1,
          "--c2": finalColors.c2,
          "--c3": finalColors.c3,
          "--animation-duration": `${animationDuration}s`,
          "--blur-amount": `${blurAmount}px`,
          "--contrast-amount": contrastAmount,
        } as React.CSSProperties
      }
    >
      <style jsx>{`
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        .siri-orb {
          display: grid;
          grid-template-areas: "stack";
          overflow: hidden;
          border-radius: 50%;
          position: relative;
          background: radial-gradient(
            circle,
            rgba(5, 20, 30, 0.95) 0%,
            rgba(5, 15, 25, 1) 100%
          );
          box-shadow:
            inset 0 0 20% rgba(57, 255, 20, 0.05),
            0 0 15px rgba(57, 255, 20, 0.15),
            0 0 30px rgba(13, 177, 178, 0.08);
        }

        .siri-orb::before {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background:
            radial-gradient(
              ellipse 60% 50% at calc(35% + sin(var(--angle)) * 10%) calc(60% + cos(var(--angle)) * 8%),
              var(--c1) 0%,
              transparent 70%
            ),
            radial-gradient(
              ellipse 50% 60% at calc(65% + cos(var(--angle)) * 12%) calc(35% + sin(var(--angle)) * 10%),
              var(--c2) 0%,
              transparent 65%
            ),
            radial-gradient(
              ellipse 55% 45% at calc(50% + sin(var(--angle) * 1.3) * 15%) calc(70% + cos(var(--angle) * 0.7) * 12%),
              var(--c3) 0%,
              transparent 60%
            ),
            radial-gradient(
              ellipse 40% 55% at calc(25% + cos(var(--angle) * 0.6) * 8%) calc(30% + sin(var(--angle) * 1.1) * 10%),
              var(--c2) 0%,
              transparent 70%
            ),
            radial-gradient(
              ellipse 45% 40% at calc(75% + sin(var(--angle) * 0.9) * 10%) calc(75% + cos(var(--angle) * 1.4) * 8%),
              var(--c1) 0%,
              transparent 65%
            );
          filter: blur(var(--blur-amount)) contrast(var(--contrast-amount)) saturate(1.6) brightness(1.1);
          animation: siri-orb-rotate var(--animation-duration) linear infinite;
          transform: translateZ(0);
          will-change: transform;
        }

        .siri-orb::after {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background:
            radial-gradient(
              circle at 35% 35%,
              rgba(255, 255, 255, 0.15) 0%,
              rgba(255, 255, 255, 0.05) 20%,
              transparent 50%
            ),
            radial-gradient(
              circle at 65% 70%,
              rgba(255, 255, 255, 0.03) 0%,
              transparent 40%
            );
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        @keyframes siri-orb-rotate {
          from {
            --angle: 0deg;
          }
          to {
            --angle: 360deg;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .siri-orb::before {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

export { SiriOrb }
export default SiriOrb
