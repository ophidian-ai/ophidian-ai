"use client";

import { useEffect, useRef } from "react";

type PanelVariant = "curtain-up" | "wipe-right" | "curtain-down" | "fade-scale";
type PanelSize = "medium" | "tall" | "quote";

interface ImagePanelProps {
  src: string;
  alt?: string;
  variant: PanelVariant;
  size?: PanelSize;
  objectPosition?: string;
  children?: React.ReactNode; // overlay content
}

const sizeStyles: Record<PanelSize, string> = {
  medium: "h-[55vh] min-h-[300px]",
  tall:   "h-[68vh] min-h-[400px]",
  quote:  "h-[44vh] min-h-[260px]",
};

const variantClass: Record<PanelVariant, string> = {
  "curtain-up":    "img-panel img-panel--curtain-up",
  "wipe-right":    "img-panel img-panel--wipe-right",
  "curtain-down":  "img-panel img-panel--curtain-down",
  "fade-scale":    "img-panel",  // uses default opacity/scale reveal
};

export function ImagePanel({
  src,
  alt = "",
  variant,
  size = "medium",
  objectPosition = "center",
  children,
}: ImagePanelProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Parallax: image translates slightly on scroll
  useEffect(() => {
    const img = imgRef.current;
    const wrap = wrapRef.current;
    if (!img || !wrap) return;

    function onScroll() {
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const pct = -rect.top / window.innerHeight;
      const offset = -7.5 + pct * 15;
      img!.style.transform = `translateY(${offset}%)`;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`${variantClass[variant]} ${sizeStyles[size]} w-full overflow-hidden relative`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full object-cover block"
        style={{
          height: "115%",
          objectPosition,
          transform: "translateY(-7.5%)",
          willChange: "transform",
        }}
      />
      {children}
    </div>
  );
}
