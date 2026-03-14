"use client";

import React, { useEffect, useRef, forwardRef } from "react";

export type GlowCardProps = React.HTMLAttributes<HTMLDivElement>;

const GlowCard = forwardRef<HTMLDivElement, GlowCardProps>(
  ({ children, className = "", ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);

    // Merge forwarded ref with internal ref
    const cardRef = (ref as React.RefObject<HTMLDivElement>) || internalRef;

    useEffect(() => {
      const syncPointer = (e: PointerEvent) => {
        const el =
          (ref as React.RefObject<HTMLDivElement>)?.current ??
          internalRef.current;

        if (el) {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          el.style.setProperty("--x", x.toFixed(2));
          el.style.setProperty(
            "--xp",
            (e.clientX / window.innerWidth).toFixed(2)
          );
          el.style.setProperty("--y", y.toFixed(2));
          el.style.setProperty(
            "--yp",
            (e.clientY / window.innerHeight).toFixed(2)
          );
        }
      };

      document.addEventListener("pointermove", syncPointer);
      return () => document.removeEventListener("pointermove", syncPointer);
    }, [ref]);

    return (
      <div
        ref={cardRef}
        data-glow
        className={`glow-card ${className}`}
        {...props}
      >
        <div data-glow aria-hidden="true" />
        {children}
      </div>
    );
  }
);

GlowCard.displayName = "GlowCard";

export { GlowCard };
