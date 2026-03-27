"use client";

import Script from "next/script";

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || "";

export function CalendlyEmbed() {
  if (!CALENDLY_URL) return null;

  return (
    <>
      <div
        className="calendly-inline-widget rounded-xl overflow-hidden"
        data-url={`${CALENDLY_URL}?hide_gdpr_banner=1&background_color=0f1f14&text_color=d1e8d5&primary_color=aad0ad`}
        style={{ minWidth: 320, height: 700, width: "100%" }}
      />
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
    </>
  );
}
