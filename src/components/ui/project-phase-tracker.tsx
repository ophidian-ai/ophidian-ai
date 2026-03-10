"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { ProjectPhase } from "@/lib/supabase/types";

interface PhaseNode {
  id: ProjectPhase;
  label: string;
  date?: string | null;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

const PHASE_NODES: PhaseNode[] = [
  { id: "discovery", label: "Discovery", color: "#39FF14", gradientFrom: "#39FF14", gradientTo: "#2BCC10" },
  { id: "design", label: "Design", color: "#2BCC10", gradientFrom: "#2BCC10", gradientTo: "#1FA88E" },
  { id: "development", label: "Development", color: "#1FA88E", gradientFrom: "#1FA88E", gradientTo: "#15B0A0" },
  { id: "review", label: "Review", color: "#15B0A0", gradientFrom: "#15B0A0", gradientTo: "#0DB1B2" },
  { id: "live", label: "Live", color: "#0DB1B2", gradientFrom: "#0DB1B2", gradientTo: "#0DB1B2" },
];

const PHASE_ORDER: ProjectPhase[] = ["discovery", "design", "development", "review", "live"];

interface ProjectPhaseTrackerProps {
  currentPhase: ProjectPhase;
  milestoneDates?: Partial<Record<ProjectPhase, string | null>>;
  editable?: boolean;
  onPhaseChange?: (phase: ProjectPhase) => void;
  className?: string;
}

export function ProjectPhaseTracker({
  currentPhase,
  milestoneDates,
  editable = false,
  onPhaseChange,
  className,
}: ProjectPhaseTrackerProps) {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [gradientPosition, setGradientPosition] = useState<{ x: number; y: number } | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (currentIndex >= 0 && circleRefs.current[currentIndex] && containerRef.current) {
      const circleRect = circleRefs.current[currentIndex]!.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      setGradientPosition({
        x: circleRect.left + circleRect.width / 2 - containerRect.left,
        y: circleRect.top + circleRect.height / 2 - containerRect.top,
      });
    }
  }, [currentIndex]);

  const handleClick = (phase: ProjectPhase) => {
    if (editable && onPhaseChange) {
      onPhaseChange(phase);
    }
  };

  const createOrbitalDots = (count: number, radius: number, color: string) => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 2 * Math.PI;
      const x = Math.cos(angle) * radius - 2;
      const y = Math.sin(angle) * radius - 2;
      return (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0.2 : 0.6,
            delay: shouldReduceMotion ? 0 : i * 0.03,
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
          style={{ backgroundColor: color, left: "50%", top: "50%", x, y }}
        />
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col items-center gap-8 p-8 border border-white/10 rounded-xl overflow-hidden bg-surface/50 backdrop-blur",
        className
      )}
    >
      {/* Radial glow */}
      {gradientPosition && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle at ${gradientPosition.x}px ${gradientPosition.y + 200}px, ${PHASE_NODES[currentIndex].color}18 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Phase nodes */}
      <div className="relative z-10 flex items-center gap-4 sm:gap-6 border border-white/10 bg-background/80 rounded-full p-4 sm:p-6">
        {PHASE_NODES.map((node, index) => (
          <div key={node.id} className="flex items-center gap-4 sm:gap-6">
            <div
              ref={(el) => { circleRefs.current[index] = el; }}
              className={cn(
                "relative w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-transparent transition-all duration-200",
                editable && "cursor-pointer hover:scale-110"
              )}
              onClick={() => handleClick(node.id)}
              style={{
                backgroundColor: currentIndex >= index ? node.color : "#4B5563",
                boxShadow: currentIndex >= index
                  ? `0 0 20px ${node.color}40, 0 0 40px ${node.color}20`
                  : "none",
              }}
            >
              {currentIndex === index && createOrbitalDots(12, 16, node.color)}
            </div>

            {index < PHASE_NODES.length - 1 && (
              <div
                className="w-12 sm:w-20 h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: currentIndex > index
                    ? `linear-gradient(to right, ${node.gradientFrom}, ${PHASE_NODES[index + 1].gradientTo})`
                    : "#4B5563",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="relative z-10 flex items-start gap-2 sm:gap-4">
        {PHASE_NODES.map((node, index) => (
          <div key={`label-${node.id}`} className="flex flex-col items-center">
            <div className="flex items-center gap-2 sm:gap-4">
              <span
                className={cn(
                  "text-xs sm:text-sm font-medium transition-colors duration-200",
                  editable && "cursor-pointer"
                )}
                onClick={() => handleClick(node.id)}
                style={{ color: currentIndex >= index ? node.color : "#6B7280" }}
              >
                {node.label}
              </span>
              {index < PHASE_NODES.length - 1 && <div className="w-12 sm:w-20" />}
            </div>
            {milestoneDates?.[node.id] && (
              <span className="text-[10px] sm:text-xs text-foreground-dim mt-1">
                {milestoneDates[node.id]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
