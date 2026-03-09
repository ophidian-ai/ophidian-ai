"use client";

import React, { useEffect, useRef, forwardRef } from "react";

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

const GlowCard = forwardRef<HTMLDivElement, GlowCardProps>(
  ({ children, className = "", as: Tag = "div", ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);

    // Merge forwarded ref with internal ref
    const cardRef = (ref as React.RefObject<HTMLDivElement>) || internalRef;

    useEffect(() => {
      const syncPointer = (e: PointerEvent) => {
        const { clientX: x, clientY: y } = e;
        const el =
          (ref as React.RefObject<HTMLDivElement>)?.current ??
          internalRef.current;

        if (el) {
          el.style.setProperty("--x", x.toFixed(2));
          el.style.setProperty(
            "--xp",
            (x / window.innerWidth).toFixed(2)
          );
          el.style.setProperty("--y", y.toFixed(2));
          el.style.setProperty(
            "--yp",
            (y / window.innerHeight).toFixed(2)
          );
        }
      };

      document.addEventListener("pointermove", syncPointer);
      return () => document.removeEventListener("pointermove", syncPointer);
    }, [ref]);

    return (
      <Tag
        ref={cardRef}
        data-glow
        className={`glow-card ${className}`}
        {...props}
      >
        <div data-glow aria-hidden="true" />
        {children}
      </Tag>
    );
  }
);

GlowCard.displayName = "GlowCard";

export { GlowCard };
