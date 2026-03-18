"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    OphidianChat?: { open: () => void; close: () => void; destroy: () => void };
  }
}

export function DemoWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/chat/embed.js";
    script.setAttribute("data-client", "ophidianai-demo");
    script.setAttribute("data-color", "#39ff14");
    document.body.appendChild(script);

    return () => {
      if (window.OphidianChat) window.OphidianChat.destroy();
      script.remove();
    };
  }, []);

  return null;
}
