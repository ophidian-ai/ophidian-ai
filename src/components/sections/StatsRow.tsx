"use client";

import { useEffect, useRef } from "react";

interface Stat {
  value: string;
  label: string;
  countTo?: number; // if set, animates from 0 to countTo
}

interface StatsRowProps {
  stats: Stat[];
}

export function StatsRow({ stats }: StatsRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const counters = rowRef.current?.querySelectorAll<HTMLElement>("[data-count]");
    if (!counters?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const target = Number(el.dataset.count);
          let current = 0;
          const step = Math.ceil(target / 30);
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current + "+";
            if (current >= target) clearInterval(timer);
          }, 40);
          observer.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rowRef}
      className="grid grid-cols-4"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "#000",
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={i}
          className="reveal"
          style={{
            padding: "36px 48px",
            borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.06)" : undefined,
          }}
        >
          <div
            className="text-primary font-bold leading-none"
            style={{ fontSize: "40px", letterSpacing: "-0.03em" }}
            data-count={stat.countTo ?? undefined}
          >
            {stat.value}
          </div>
          <div
            className="mt-2 text-[11px] font-normal tracking-[0.1em] uppercase"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
