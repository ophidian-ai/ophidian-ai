"use client";

import { useState } from "react";

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

  const getPosition = (index: number, total: number) => {
    const angle = (Math.PI * index) / (total - 1) - Math.PI;
    const rx = 340;
    const ry = 160;
    const cx = 400;
    const cy = 200;
    return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
  };

  return (
    <section className="bg-forest py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-8">
        <h2 className="text-3xl md:text-5xl font-display text-text-light mb-20">Your path starts here</h2>
        <div className="relative max-w-[800px] mx-auto mb-16">
          <svg viewBox="0 0 800 400" className="w-full">
            <ellipse cx="400" cy="200" rx="340" ry="160" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            {STEPS.map((_, i) => {
              if (i === STEPS.length - 1) return null;
              const p1 = getPosition(i, STEPS.length);
              const p2 = getPosition(i + 1, STEPS.length);
              return <line key={`line-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
            })}
            {STEPS.map((step, i) => {
              const pos = getPosition(i, STEPS.length);
              const isActive = i === active;
              return (
                <g key={step.num} onClick={() => setActive(i)} className="cursor-pointer">
                  <circle cx={pos.x} cy={pos.y} r={isActive ? 24 : 18} fill={isActive ? "var(--color-venom)" : "var(--color-forest-deep)"} stroke={isActive ? "var(--color-venom)" : "rgba(255,255,255,0.2)"} strokeWidth="1.5" className="transition-all duration-300" />
                  {isActive && <circle cx={pos.x} cy={pos.y} r={32} fill="none" stroke="var(--color-venom)" strokeWidth="1" opacity="0.3" />}
                  <text x={pos.x} y={pos.y + 5} textAnchor="middle" fill={isActive ? "var(--color-forest-deep)" : "var(--color-text-light)"} fontSize="14" fontWeight="600">{step.num}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-display italic text-text-light mb-4">{STEPS[active].title}</h3>
          <p className="text-text-muted text-lg leading-relaxed">{STEPS[active].desc}</p>
        </div>
      </div>
    </section>
  );
}
