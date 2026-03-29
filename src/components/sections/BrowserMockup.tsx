import Image from "next/image";

interface BrowserMockupProps {
  src: string;
  alt: string;
  url: string;
}

/**
 * Realistic browser chrome mockup wrapping a site screenshot.
 * Spec: DESIGN.md §2.7
 */
export function BrowserMockup({ src, alt, url }: BrowserMockupProps) {
  return (
    <div
      style={{
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        overflow: "hidden",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          height: "40px",
          background: "var(--color-surface)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: "12px",
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
          {["#C45B5B", "#D4924A", "#7B816E"].map((color, i) => (
            <div
              key={i}
              aria-hidden="true"
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "9999px",
                background: color,
              }}
            />
          ))}
        </div>
        {/* URL bar */}
        <div
          style={{
            flex: 1,
            background: "var(--color-background)",
            borderRadius: "var(--radius-sm)",
            height: "24px",
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "12px",
              fontWeight: 400,
              lineHeight: 1.5,
              color: "var(--color-taupe)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {url}
          </span>
        </div>
      </div>

      {/* Screenshot */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
        <Image
          src={src}
          alt={alt}
          fill
          style={{ objectFit: "cover", display: "block" }}
          sizes="(max-width: 900px) 100vw, 900px"
        />
      </div>
    </div>
  );
}
