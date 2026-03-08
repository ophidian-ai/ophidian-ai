import { NavMain } from "./NavMain";
import { FooterMain } from "./FooterMain";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <>
      <NavMain />
      <main className={`pt-20 ${className ?? ""}`}>{children}</main>
      <FooterMain />
    </>
  );
}
