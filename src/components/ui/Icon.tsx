import type { SVGAttributes } from "react";

type IconSize = "sm" | "md" | "lg";

export type IconProps = SVGAttributes<SVGSVGElement> & {
  size?: IconSize;
};

const sizeMap: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

export function Icon({
  size = "md",
  className = "",
  children,
  ...props
}: IconProps) {
  const px = sizeMap[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={px}
      height={px}
      viewBox={`0 0 ${px} ${px}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      {...props}
    >
      {children}
    </svg>
  );
}

export default Icon;
