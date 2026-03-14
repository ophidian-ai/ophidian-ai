"use client";

import React, { useEffect, useRef, useCallback, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export interface GalleryItem {
  title: string;
  subtitle: string;
  href?: string;
  photo: {
    url: string;
    text: string;
    pos?: string;
  };
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  radius?: number;
  autoRotateSpeed?: number;
  scrollSensitivity?: number;
  smoothing?: number;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  (
    {
      items,
      className,
      radius = 600,
      autoRotateSpeed = 0.02,
      scrollSensitivity = 0.15,
      smoothing = 0.08,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const carouselRef = useRef<HTMLDivElement | null>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const targetRotation = useRef(0);
    const currentRotation = useRef(0);
    const isInteracting = useRef(false);
    const interactionTimeout = useRef<NodeJS.Timeout | null>(null);
    const rafId = useRef<number | null>(null);

    const anglePerItem = 360 / items.length;

    const handleWheel = useCallback(
      (e: WheelEvent) => {
        e.preventDefault();
        isInteracting.current = true;
        targetRotation.current += e.deltaY * scrollSensitivity;

        if (interactionTimeout.current) {
          clearTimeout(interactionTimeout.current);
        }
        interactionTimeout.current = setTimeout(() => {
          isInteracting.current = false;
        }, 200);
      },
      [scrollSensitivity]
    );

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => {
        container.removeEventListener("wheel", handleWheel);
        if (interactionTimeout.current) {
          clearTimeout(interactionTimeout.current);
        }
      };
    }, [handleWheel]);

    useEffect(() => {
      const animate = () => {
        // Auto-rotate when not interacting
        if (!isInteracting.current) {
          targetRotation.current += autoRotateSpeed;
        }

        // Lerp toward target
        const diff = targetRotation.current - currentRotation.current;
        currentRotation.current += diff * smoothing;

        // Apply transform directly to DOM (no React re-render)
        if (carouselRef.current) {
          carouselRef.current.style.transform = `rotateY(${currentRotation.current}deg)`;
        }

        // Update card opacities
        const totalRot = currentRotation.current % 360;
        cardRefs.current.forEach((card, i) => {
          if (!card) return;
          const itemAngle = i * anglePerItem;
          const relativeAngle = (itemAngle + totalRot + 360) % 360;
          const normalizedAngle = Math.abs(
            relativeAngle > 180 ? 360 - relativeAngle : relativeAngle
          );
          card.style.opacity = String(Math.max(0.3, 1 - normalizedAngle / 180));
        });

        rafId.current = requestAnimationFrame(animate);
      };

      rafId.current = requestAnimationFrame(animate);
      return () => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
      };
    }, [autoRotateSpeed, smoothing, anglePerItem]);

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        role="region"
        aria-label="3D Project Gallery"
        className={cn(
          "relative w-full h-full flex items-center justify-center",
          className
        )}
        style={{ perspective: "2000px" }}
        {...props}
      >
        <div
          ref={carouselRef}
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem;

            const cardContent = (
              <div className="relative w-full h-full rounded-xl shadow-2xl overflow-hidden group border border-primary/20 bg-surface/70 backdrop-blur-lg transition-all duration-300 hover:border-primary/40 hover:shadow-glow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.photo.url}
                  alt={item.photo.text}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: item.photo.pos || "center" }}
                />
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background/90 via-background/60 to-transparent text-foreground">
                  <h2 className="text-xl font-bold">{item.title}</h2>
                  <em className="text-sm italic text-primary opacity-80">
                    {item.subtitle}
                  </em>
                </div>
              </div>
            );

            return (
              <div
                key={item.photo.url}
                ref={(el) => { cardRefs.current[i] = el; }}
                role="group"
                aria-label={item.title}
                className="absolute w-[300px] h-[400px]"
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  left: "50%",
                  top: "50%",
                  marginLeft: "-150px",
                  marginTop: "-200px",
                }}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    {...(item.href.startsWith("/") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                    className="block w-full h-full"
                  >
                    {cardContent}
                  </a>
                ) : (
                  cardContent
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = "CircularGallery";

export { CircularGallery };
