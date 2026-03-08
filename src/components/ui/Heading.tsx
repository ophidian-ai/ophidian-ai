import type { HTMLAttributes } from "react";

type Level = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: Level;
  gradient?: boolean;
};

export function Heading({
  level = 2,
  gradient = false,
  className = "",
  children,
  ...props
}: HeadingProps) {
  const Tag = `h${level}` as const;
  const gradientClass = gradient ? "gradient-text" : "text-foreground";

  return (
    <Tag className={`${gradientClass} ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export default Heading;
