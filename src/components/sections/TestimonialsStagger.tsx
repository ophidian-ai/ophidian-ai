import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import { ParticleBackground } from "@/components/ui/particle-background";

export function TestimonialsStagger() {
  return (
    <section className="relative bg-forest py-24 md:py-32 overflow-hidden">
      <ParticleBackground density={600} />
      <div className="max-w-[1400px] mx-auto px-8 mb-16">
        <h2 className="text-3xl md:text-5xl font-display text-text-light">What our clients say</h2>
      </div>
      <StaggerTestimonials />
    </section>
  );
}
