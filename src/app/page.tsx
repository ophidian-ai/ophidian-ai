import { NavLava } from "@/components/layout/NavLava";
import { FooterLava } from "@/components/layout/FooterLava";
import { HeroVideo } from "@/components/sections/HeroVideo";
import { StatsTestimonial } from "@/components/sections/StatsTestimonial";
import { ServicesShowcase } from "@/components/sections/ServicesShowcase";
import { VisualBreak } from "@/components/sections/VisualBreak";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { ParticleBackground } from "@/components/ui/particle-background";

export default function Home() {
  return (
    <>
      {/* Global fixed particle background */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: "var(--color-surface-base)" }}>
        <ParticleBackground density={800} speed={0.4} opacity={0.35} glow />
      </div>
      <NavLava />
      <main className="relative z-10">
        <HeroVideo />
        <StatsTestimonial />
        <ServicesShowcase />
        <VisualBreak />
        <FinalCTA />
      </main>
      <FooterLava />
    </>
  );
}
