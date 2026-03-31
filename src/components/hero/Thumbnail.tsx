"use client";

import Image from "next/image";

export type ThumbnailSize = "lg" | "md" | "sm";

const SIZE_MAP: Record<ThumbnailSize, number> = { lg: 160, md: 120, sm: 80 };

interface ThumbnailProps {
  src?: string | null;
  alt: string;
  projectName: string;
  size?: ThumbnailSize;
  driftClass?: "animate-drift-a" | "animate-drift-b";
  style?: React.CSSProperties;
}

export function Thumbnail({
  src,
  alt,
  projectName,
  size = "md",
  driftClass = "animate-drift-a",
  style,
}: ThumbnailProps) {
  const px = SIZE_MAP[size];

  return (
    <div
      className={`thumbnail-wrapper ${driftClass}`}
      style={{ position: "absolute", ...style }}
    >
      <div
        className="thumbnail"
        style={{
          width: px,
          height: px,
          borderRadius: "9999px",
          border: "2px solid var(--color-sage)",
          overflow: "hidden",
          cursor: "pointer",
          transition: "transform var(--duration-base) var(--ease-organic), border-color var(--duration-fast)",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "scale(1.12)";
          el.style.borderColor = "var(--color-terracotta)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "scale(1)";
          el.style.borderColor = "var(--color-sage)";
        }}
      >
        {src ? (
          <Image src={src} alt={alt} fill style={{ objectFit: "cover" }} sizes={`${px}px`} />
        ) : (
          // Fallback gradient when no project image
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "radial-gradient(circle at 40% 40%, var(--color-sage) 0%, var(--color-taupe) 100%)",
            }}
            aria-hidden="true"
          />
        )}
      </div>
      {/* Hover label */}
      <p
        className="thumbnail-label"
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: "13px",
          lineHeight: 1.4,
          color: "var(--color-taupe)",
          textAlign: "center",
          marginTop: "8px",
          opacity: 0,
          transform: "translateY(4px)",
          transition: "opacity var(--duration-fast), transform var(--duration-fast)",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        {projectName}
      </p>

      <style>{`
        .thumbnail:hover + .thumbnail-label,
        .thumbnail-wrapper:hover .thumbnail-label {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
}
