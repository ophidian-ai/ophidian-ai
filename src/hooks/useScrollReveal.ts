"use client";

import { useEffect } from "react";

const REVEAL_SELECTORS = [
  ".reveal",
  ".reveal-flip",
  ".reveal-right",
  ".reveal-left",
  ".reveal-scale",
  ".reveal-rise",
].join(", ");

const PANEL_SELECTORS = ".img-panel";

/**
 * Activates scroll reveal animations within a container element.
 * Uses IntersectionObserver to add .visible (text/UI elements)
 * and .in-view (image panels) classes when elements enter the viewport.
 *
 * Call once at the page level, passing the page root ref.
 */
export function useScrollReveal(
  containerRef: React.RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Observer for text/UI reveals
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            revealObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    // Observer for image panel clip-path reveals (lower threshold)
    const panelObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            panelObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -30px 0px" }
    );

    container.querySelectorAll(REVEAL_SELECTORS).forEach((el) =>
      revealObserver.observe(el)
    );
    container.querySelectorAll(PANEL_SELECTORS).forEach((el) =>
      panelObserver.observe(el)
    );

    return () => {
      revealObserver.disconnect();
      panelObserver.disconnect();
    };
  }, [containerRef]);
}
