"use client";

import React, { type RefObject } from "react";
import { motion, type Variants, useInView } from "motion/react";

interface TimelineContentProps {
  children: React.ReactNode;
  animationNum: number;
  timelineRef: RefObject<HTMLDivElement | null>;
  customVariants?: Variants;
  className?: string;
}

export function TimelineContent({
  children,
  animationNum,
  timelineRef,
  customVariants,
  className,
}: TimelineContentProps) {
  const isInView = useInView(timelineRef, { once: true, margin: "-100px" });

  const defaultVariants: Variants = {
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
  };

  const variants = customVariants || defaultVariants;

  return (
    <motion.div
      custom={animationNum}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
