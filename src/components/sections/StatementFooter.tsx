"use client";

export function StatementFooter() {
  return (
    <footer
      style={{
        background: "var(--color-dark)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "72px 24px",
        scrollSnapAlign: "start",
      }}
    >
      {/* Display wordmark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/logotext.svg"
        alt="OphidianAI"
        style={{
          height: "clamp(48px, 8vw, 72px)",
          width: "auto",
          display: "block",
          filter: "brightness(0) invert(1)",
          opacity: 0.9,
        }}
      />

      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "18px",
          fontWeight: 400,
          lineHeight: 1.65,
          color: "rgba(247, 239, 230, 0.7)",
          marginTop: "20px",
          maxWidth: "400px",
        }}
      >
        Let&apos;s build something together.
      </p>

      <button
        onClick={() => window.dispatchEvent(new CustomEvent("ophidian:open-chat"))}
        style={{
          marginTop: "32px",
          background: "var(--color-terracotta)",
          color: "var(--color-cream)",
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          fontWeight: 600,
          border: "none",
          borderRadius: "var(--radius-md)",
          padding: "12px 24px",
          cursor: "pointer",
          transition:
            "background var(--duration-fast), box-shadow var(--duration-fast), transform var(--duration-fast)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.background = "var(--color-cta-hover-bg)";
          el.style.boxShadow = "var(--shadow-md)";
          el.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.background = "var(--color-terracotta)";
          el.style.boxShadow = "none";
          el.style.transform = "translateY(0)";
        }}
      >
        Get in touch →
      </button>

      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "14px",
          fontWeight: 400,
          color: "rgba(247, 239, 230, 0.4)",
          marginTop: "48px",
        }}
      >
        ophidianai.com · 2026
      </p>
    </footer>
  );
}
