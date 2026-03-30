import { Nav } from "@/components/layout/Nav";
import { ConstellationHero } from "@/components/hero/ConstellationHero";
import { SnapScrollContainer } from "@/components/sections/ProjectSection";
import { getPortfolioProjects } from "@/lib/portfolio";

export const revalidate = 3600; // ISR — rebuild every hour

export default async function Home() {
  const projects = await getPortfolioProjects();

  return (
    <>
      <Nav />

      {/* Constellation hero — sticky 300vh container driving the GSAP funnel */}
      <ConstellationHero projects={projects} />

      {/* Snap-scroll project sections */}
      <SnapScrollContainer projects={projects} />
    </>
  );
}
