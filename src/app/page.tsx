import { NavLava } from "@/components/layout/NavLava";
import { FooterLava } from "@/components/layout/FooterLava";
import { HeroVideo } from "@/components/sections/HeroVideo";
import { MissionStatement } from "@/components/sections/MissionStatement";
import { ImageCarousel } from "@/components/sections/ImageCarousel";
import { Manifesto } from "@/components/sections/Manifesto";
import { ProcessOrbit } from "@/components/sections/ProcessOrbit";
import { BrandStatement } from "@/components/sections/BrandStatement";
import { PortfolioGrid } from "@/components/sections/PortfolioGrid";
import { ServicesGrid } from "@/components/sections/ServicesGrid";

import { PricingCards } from "@/components/sections/PricingCards";
import { FAQNested } from "@/components/sections/FAQNested";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <>
      <NavLava />
      <main>
        <HeroVideo />
        <MissionStatement />
        <ImageCarousel />
        <Manifesto />
        <PortfolioGrid />
        <ProcessOrbit />
        <BrandStatement />
        <ServicesGrid />

        <PricingCards />
        <FAQNested />
        <ContactSection />
      </main>
      <FooterLava />
    </>
  );
}
