import type { HTMLAttributes, ReactNode } from "react";

type Variant = "content" | "feature" | "testimonial";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
  icon?: ReactNode;
};

const base =
  "glass rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover";

export function Card({
  variant = "content",
  icon,
  className = "",
  children,
  ...props
}: CardProps) {
  if (variant === "feature") {
    return (
      <div className={`${base} ${className}`} {...props}>
        {icon && (
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        {children}
      </div>
    );
  }

  if (variant === "testimonial") {
    return (
      <div className={`${base} ${className}`} {...props}>
        <blockquote className="relative pl-4 border-l-2 border-primary/40">
          {children}
        </blockquote>
      </div>
    );
  }

  return (
    <div className={`${base} ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
