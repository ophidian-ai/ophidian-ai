import { Mail, Phone, MapPin } from "lucide-react";

export function FooterLava() {
  return (
    <footer id="contact-footer" className="bg-forest-deep">
      <div className="flex items-center justify-center py-24 border-b border-white/5">
        <div className="text-center">
          <h2 className="text-6xl md:text-8xl font-display tracking-[0.3em] uppercase text-gold">
            OphidianAI
          </h2>
          <p className="mt-4 text-lg tracking-[0.2em] uppercase text-gold/70">
            Intelligence. Engineered.
          </p>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <h3 className="text-sm font-display tracking-wider uppercase text-text-light mb-4">Contacts</h3>
          <div className="space-y-3 text-text-muted text-sm">
            <a href="tel:+18125551234" className="flex items-center gap-2 hover:text-text-light transition-colors">
              <Phone className="w-4 h-4" /> (812) 555-1234
            </a>
            <a href="mailto:eric@ophidianai.com" className="flex items-center gap-2 hover:text-text-light transition-colors">
              <Mail className="w-4 h-4" /> eric@ophidianai.com
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-display tracking-wider uppercase text-text-light mb-4">Address</h3>
          <div className="text-text-muted text-sm space-y-1">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Columbus, Indiana
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-display tracking-wider uppercase text-text-light mb-4">Working Hours</h3>
          <div className="text-text-muted text-sm space-y-1">
            <p>Monday - Friday: 9:00 - 18:00</p>
            <p>Saturday - Sunday: Closed</p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-display tracking-wider uppercase text-text-light mb-4">Connect</h3>
          <div className="text-text-muted text-sm space-y-2">
            <a href="https://facebook.com" className="block hover:text-text-light transition-colors">Facebook</a>
            <a href="https://instagram.com" className="block hover:text-text-light transition-colors">Instagram</a>
            <a href="https://linkedin.com" className="block hover:text-text-light transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-text-muted text-xs">
        <p>2026 OphidianAI</p>
      </div>
    </footer>
  );
}
