"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STEPS = [
  { num: 1, title: "Discovery", desc: "We learn your business inside and out. Goals, audience, constraints — everything that shapes the right solution." },
  { num: 2, title: "Strategy", desc: "A clear plan emerges. Technology choices, content structure, timeline — mapped out before a single line of code." },
  { num: 3, title: "Design", desc: "Visual direction tailored to your brand. You see the design before we build, and you shape it until it's right." },
  { num: 4, title: "Build", desc: "Fast, clean, production-grade development. Every pixel matches the design. Every interaction feels intentional." },
  { num: 5, title: "Launch", desc: "Go live with confidence. Performance tested, SEO configured, analytics connected. Your digital presence, fully operational." },
  { num: 6, title: "Grow", desc: "Post-launch optimization, content updates, and strategic improvements. We grow with your business, not just deliver and disappear." },
];

export function ProcessOrbit() {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const getPosition = (index: number, total: number) => {
    const angle = (Math.PI * index) / (total - 1) - Math.PI;
    return {
      x: 400 + 340 * Math.cos(angle),
      y: 200 + 160 * Math.sin(angle),
    };
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const stepIndex = Math.min(
          STEPS.length - 1,
          Math.floor(self.progress * STEPS.length)
        );
        setActive(stepIndex);
      },
    });

    return () => st.kill();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative bg-forest"
      style={{ height: `${(STEPS.length + 1) * 50}vh` }}
    >
      {/* Sticky inner — stays centered while outer scrolls */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-[1400px]">
          <h2 className="text-3xl md:text-5xl font-display text-text-light mb-12 md:mb-20">
            Your path starts here
          </h2>

          <div className="relative max-w-[800px] mx-auto mb-12 md:mb-16">
            <svg viewBox="0 0 800 400" className="w-full">
              <ellipse cx="400" cy="200" rx="340" ry="160" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

              {STEPS.map((_, i) => {
                if (i >= active) return null;
                const p1 = getPosition(i, STEPS.length);
                const p2 = getPosition(i + 1, STEPS.length);
                return (
                  <line
                    key={`progress-${i}`}
                    x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                    stroke="var(--color-gold)"
                    strokeWidth="2"
                    opacity="0.4"
                    className="transition-opacity duration-500"
                  />
                );
              })}

              {STEPS.map((_, i) => {
                if (i === STEPS.length - 1) return null;
                const p1 = getPosition(i, STEPS.length);
                const p2 = getPosition(i + 1, STEPS.length);
                return (
                  <line
                    key={`line-${i}`}
                    x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                  />
                );
              })}

              {STEPS.map((step, i) => {
                const pos = getPosition(i, STEPS.length);
                const isActive = i === active;
                const isCompleted = i < active;
                return (
                  <g key={step.num} onClick={() => setActive(i)} className="cursor-pointer">
                    <circle
                      cx={pos.x} cy={pos.y}
                      r={isActive ? 24 : 18}
                      fill={isActive || isCompleted ? "var(--color-gold)" : "var(--color-forest-deep)"}
                      stroke={isActive || isCompleted ? "var(--color-gold)" : "rgba(255,255,255,0.2)"}
                      strokeWidth="1.5"
                      opacity={isCompleted && !isActive ? 0.5 : 1}
                      className="transition-all duration-500"
                    />
                    {isActive && (
                      <circle
                        cx={pos.x} cy={pos.y} r={32}
                        fill="none" stroke="var(--color-gold)" strokeWidth="1" opacity="0.3"
                      />
                    )}
                    <text
                      x={pos.x} y={pos.y + 5}
                      textAnchor="middle"
                      fill={isActive || isCompleted ? "var(--color-forest-deep)" : "var(--color-text-light)"}
                      fontSize="14" fontWeight="600"
                    >
                      {step.num}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="max-w-2xl mx-auto text-center min-h-[100px]">
            <h3 className="text-2xl md:text-3xl font-display italic text-text-light mb-4">
              {STEPS[active].title}
            </h3>
            <p className="text-text-muted text-lg leading-relaxed">
              {STEPS[active].desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
