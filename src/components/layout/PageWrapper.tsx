import { NavLava } from "./NavLava";
import { FooterLava } from "./FooterLava";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <>
      <NavLava />
      <main className={`pt-20 ${className ?? ""}`}>{children}</main>
      <FooterLava />
    </>
  );
}
