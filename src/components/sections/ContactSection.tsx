import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";

export function ContactSection() {
  return (
    <section id="contact" className="relative py-24 md:py-32 overflow-hidden">
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-display mb-10 sm:mb-16" style={{ color: "var(--color-on-surface)" }}>We are right here.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <div className="space-y-8">
            <p className="text-lg leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>Ready to get started? Reach out and we&apos;ll set up a free discovery conversation to understand your needs.</p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--color-surface-container-high)" }}><Phone className="w-5 h-5" style={{ color: "var(--color-primary)" }} /></div>
                <div><p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Phone</p><a href="tel:+18123434786" className="transition-colors hover:opacity-80" style={{ color: "var(--color-on-surface)" }}>(812) 343-4786</a></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--color-surface-container-high)" }}><Mail className="w-5 h-5" style={{ color: "var(--color-primary)" }} /></div>
                <div><p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Email</p><a href="mailto:eric.lefler@ophidianai.com" className="transition-colors hover:opacity-80" style={{ color: "var(--color-on-surface)" }}>eric.lefler@ophidianai.com</a></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--color-surface-container-high)" }}><MapPin className="w-5 h-5" style={{ color: "var(--color-primary)" }} /></div>
                <div><p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Location</p><p style={{ color: "var(--color-on-surface)" }}>Columbus, Indiana</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--color-surface-container-high)" }}><Clock className="w-5 h-5" style={{ color: "var(--color-primary)" }} /></div>
                <div><p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Hours</p><p style={{ color: "var(--color-on-surface)" }}>Monday - Friday: 9:00 - 18:00</p></div>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6 sm:p-8 md:p-12 flex flex-col justify-center">
            <h3 className="text-2xl font-display mb-4" style={{ color: "var(--color-on-surface)" }}>Let&apos;s talk about your project</h3>
            <p className="mb-8 leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>Book a free 30-minute discovery call. We&apos;ll discuss your goals, explore what&apos;s possible, and outline next steps — no pressure, no commitment.</p>
            <GlassButton size="default" href="mailto:eric.lefler@ophidianai.com?subject=Project%20Inquiry">Start a Conversation</GlassButton>
          </div>
        </div>
      </div>
    </section>
  );
}
