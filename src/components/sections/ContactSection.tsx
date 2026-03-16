import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { ParticleBackground } from "@/components/ui/particle-background";

export function ContactSection() {
  return (
    <section id="contact" className="relative bg-forest py-24 md:py-32 overflow-hidden">
      <ParticleBackground density={600} />
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-display text-text-light mb-10 sm:mb-16">We are right here.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <div className="space-y-8">
            <p className="text-text-muted text-lg leading-relaxed">Ready to get started? Reach out and we&apos;ll set up a free discovery conversation to understand your needs.</p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-sage-accent/15 flex items-center justify-center"><Phone className="w-5 h-5 text-sage-accent" /></div>
                <div><p className="text-sm text-text-muted">Phone</p><a href="tel:+18125551234" className="text-text-light hover:text-sage-accent transition-colors">(812) 555-1234</a></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-sage-accent/15 flex items-center justify-center"><Mail className="w-5 h-5 text-sage-accent" /></div>
                <div><p className="text-sm text-text-muted">Email</p><a href="mailto:eric.lefler@ophidianai.com" className="text-text-light hover:text-sage-accent transition-colors">eric.lefler@ophidianai.com</a></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-sage-accent/15 flex items-center justify-center"><MapPin className="w-5 h-5 text-sage-accent" /></div>
                <div><p className="text-sm text-text-muted">Location</p><p className="text-text-light">Columbus, Indiana</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-sage-accent/15 flex items-center justify-center"><Clock className="w-5 h-5 text-sage-accent" /></div>
                <div><p className="text-sm text-text-muted">Hours</p><p className="text-text-light">Monday - Friday: 9:00 - 18:00</p></div>
              </div>
            </div>
          </div>
          <div className="bg-forest-deep rounded-2xl p-6 sm:p-8 md:p-12 border border-white/5 flex flex-col justify-center">
            <h3 className="text-2xl font-display text-text-light mb-4">Let&apos;s talk about your project</h3>
            <p className="text-text-muted mb-8 leading-relaxed">Book a free 30-minute discovery call. We&apos;ll discuss your goals, explore what&apos;s possible, and outline next steps — no pressure, no commitment.</p>
            <GlassButton size="default" href="mailto:eric.lefler@ophidianai.com?subject=Project%20Inquiry">Start a Conversation</GlassButton>
          </div>
        </div>
      </div>
    </section>
  );
}
