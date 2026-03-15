import Link from "next/link";

export function FooterMain() {
  return (
    <footer className="border-t border-white/8 pt-16 pb-0 overflow-hidden">
      {/* Upper footer — links + contact */}
      <div className="px-6 md:px-12 pb-16 grid grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto">
        {/* Contact */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/40 mb-4">Contact</p>
          <a
            href="mailto:eric.lefler@ophidianai.com"
            className="text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            eric.lefler@ophidianai.com
          </a>
          <div className="flex flex-col gap-2 mt-4">
            <a
              href="https://www.linkedin.com/company/ophidianai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-foreground/40 hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/ophidian-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-foreground/40 hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/40 mb-4">Navigation</p>
          <div className="flex flex-col gap-2">
            {[
              { label: "Services", href: "/services" },
              { label: "Projects", href: "/projects" },
              { label: "Pricing", href: "/pricing" },
              { label: "About", href: "/about" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/40 hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/40 mb-4">Resources</p>
          <div className="flex flex-col gap-2">
            {[
              { label: "Blog", href: "/blog" },
              { label: "FAQ", href: "/faq" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/40 hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Studio Note */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/40 mb-4">Studio Note</p>
          <p className="text-sm text-foreground/40 leading-relaxed">
            We build for businesses that are serious about AI. If it feels right,{" "}
            <Link
              href="/contact"
              className="text-foreground/60 hover:text-foreground underline underline-offset-2 transition-colors"
            >
              this can be the starting point
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Oversized wordmark */}
      <div className="px-4 md:px-8 select-none" aria-hidden="true">
        <p
          className="font-bold leading-none tracking-tighter text-foreground/10"
          style={{
            fontSize: "clamp(4rem, 16vw, 18rem)",
            lineHeight: 0.85,
          }}
        >
          Ophidian<span style={{ color: "#39FF14" }}>AI</span>
        </p>
      </div>

      {/* Bottom bar */}
      <div className="px-6 md:px-12 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/5 mt-4">
        <p className="text-xs text-foreground/30">
          &copy;{new Date().getFullYear()} OphidianAI. All rights reserved.
        </p>
        <p className="text-xs text-foreground/20">Columbus, Indiana</p>
        <div className="flex gap-4">
          <Link
            href="/privacy"
            className="text-xs text-foreground/30 hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-xs text-foreground/30 hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
