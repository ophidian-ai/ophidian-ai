import Link from "next/link";

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
] as const;

const resourceLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;

export function FooterMain() {
  return (
    <footer className="border-t border-surface-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="text-xl font-bold text-foreground">
              OphidianAI
            </Link>
            <p className="mt-1 font-mono text-xs tracking-widest text-primary">
              Intelligence. Engineered.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
              AI-powered solutions that transform how businesses operate.
              Subscription integrations, custom builds, and strategic consulting.
            </p>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {companyLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-foreground-muted transition-colors hover:text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Resources
            </h3>
            <ul className="mt-4 space-y-3">
              {resourceLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-foreground-muted transition-colors hover:text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Connect
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="mailto:eric.lefler@ophidianai.com"
                  className="text-sm text-foreground-muted transition-colors hover:text-primary"
                >
                  eric.lefler@ophidianai.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-surface-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-foreground-dim">
            &copy; 2026 OphidianAI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-foreground-dim">
              Columbus, Indiana
            </span>
            <Link
              href="/privacy"
              className="text-xs text-foreground-dim transition-colors hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-foreground-dim transition-colors hover:text-primary"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
