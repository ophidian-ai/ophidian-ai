import { Mail, Phone, MapPin } from "lucide-react";
import { NewsletterSignup } from "@/components/ui/NewsletterSignup";

export function FooterLava() {
  return (
    <footer id="contact-footer" className="relative overflow-hidden">
      <div className="flex items-center justify-center py-24" style={{ marginBottom: "2.75rem" }}>
        <div className="text-center">
          <h2 className="text-3xl sm:text-6xl md:text-8xl font-display tracking-[0.15em] sm:tracking-[0.3em] uppercase" style={{ color: "var(--color-secondary)" }}>
            OphidianAI
          </h2>
          <p className="mt-4 text-lg tracking-[0.2em] uppercase" style={{ color: "rgba(196,162,101,0.6)" }}>
            Intelligence. Engineered.
          </p>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-12 sm:py-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
        <div>
          <h3 className="text-sm font-display tracking-wider uppercase mb-4" style={{ color: "var(--color-on-surface)" }}>Contacts</h3>
          <div className="space-y-3 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
            <a href="tel:+18123434786" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Phone className="w-4 h-4" /> (812) 343-4786
            </a>
            <a href="mailto:eric.lefler@ophidianai.com" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Mail className="w-4 h-4" /> eric.lefler@ophidianai.com
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-display tracking-wider uppercase mb-4" style={{ color: "var(--color-on-surface)" }}>Address</h3>
          <div className="text-sm space-y-1" style={{ color: "var(--color-on-surface-variant)" }}>
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Columbus, Indiana
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-display tracking-wider uppercase mb-4" style={{ color: "var(--color-on-surface)" }}>Working Hours</h3>
          <div className="text-sm space-y-1" style={{ color: "var(--color-on-surface-variant)" }}>
            <p>Monday - Friday: 9:00 - 18:00</p>
            <p>Saturday - Sunday: Closed</p>
          </div>
        </div>
        <div>
          <NewsletterSignup
            variant="stacked"
            source="footer"
            description="AI, web design, and small business tips. No spam."
          />
        </div>
      </div>
      <div className="py-6 text-center text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
        <p>2026 OphidianAI</p>
      </div>
    </footer>
  );
}
