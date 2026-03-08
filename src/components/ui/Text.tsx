import type { HTMLAttributes } from "react";

type Variant = "body" | "small" | "label" | "lead";

export type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  variant?: Variant;
  as?: "p" | "span";
};

const variantClasses: Record<Variant, string> = {
  body: "text-base text-foreground-muted leading-relaxed",
  small: "text-sm text-foreground-muted",
  label: "text-xs font-medium uppercase tracking-wider text-foreground-dim",
  lead: "text-lg text-foreground-muted leading-relaxed md:text-xl",
};

export function Text({
  variant = "body",
  as: Tag = "p",
  className = "",
  children,
  ...props
}: TextProps) {
  return (
    <Tag className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export default Text;
