import type { HTMLAttributes } from "react";

type Width = "default" | "narrow" | "wide";

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  width?: Width;
};

const widthClasses: Record<Width, string> = {
  default: "max-w-6xl",
  narrow: "max-w-3xl",
  wide: "max-w-7xl",
};

export function Container({
  width = "default",
  className = "",
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${widthClasses[width]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Container;
