"use client";

export interface SplitTextProps {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number; // ms per character stagger
}

/**
 * Renders text as individually-wrapped characters for letter-by-letter animation.
 * Renders two stacked copies; CSS hover on parent triggers slide transition.
 *
 * Usage:
 *   <a className="group overflow-hidden relative inline-flex">
 *     <SplitText text="Services" />
 *   </a>
 *
 * The parent needs: `group`, `overflow-hidden`, and `relative inline-flex`
 * (or `inline-block`).
 */
export function SplitText({ text, className = "", charClassName = "", delay = 30 }: SplitTextProps) {
  const chars = text.split("");

  return (
    <>
      {/* Top copy — visible at rest, slides up on hover */}
      <span
        aria-hidden="true"
        className={`flex transition-transform duration-300 ease-out group-hover:-translate-y-full ${className}`}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            className={`inline-block transition-transform duration-300 ease-out ${charClassName}`}
            style={{ transitionDelay: `${i * delay}ms` }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>

      {/* Bottom copy — starts below, slides up on hover */}
      <span
        aria-hidden="true"
        className={`flex absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 ${className}`}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            className={`inline-block transition-transform duration-300 ease-out ${charClassName}`}
            style={{ transitionDelay: `${i * delay}ms` }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>

      {/* Accessible text (sr-only) */}
      <span className="sr-only">{text}</span>
    </>
  );
}
