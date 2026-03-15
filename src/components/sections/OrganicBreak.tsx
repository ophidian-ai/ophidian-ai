"use client";

import { useEffect, useRef } from "react";

export function OrganicBreak() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    function onScroll() {
      const img = imgRef.current;
      if (!img) return;
      const container = img.closest(".organic-break");
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = -rect.top / window.innerHeight;
      img.style.transform = `translateY(${-7.5 + pct * 15}%)`;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="organic-break relative overflow-hidden flex items-center justify-center"
      style={{ height: "520px" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src="/images/break-bg.png"
        alt=""
        className="absolute inset-0 w-full object-cover block"
        style={{ height: "115%", transform: "translateY(-7.5%)", willChange: "transform" }}
      />
      {/* Edge overlays */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.75) 100%),
            linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)
          `,
        }}
      />
    </div>
  );
}
