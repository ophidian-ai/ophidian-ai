import type { HTMLAttributes } from "react";

type Variant = "default" | "accent" | "muted";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
};

const variantClasses: Record<Variant, string> = {
  default: "border border-primary/40 text-primary",
  accent: "border border-accent/40 text-accent bg-accent-muted",
  muted: "border border-foreground-dim/30 text-foreground-muted",
};

export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
