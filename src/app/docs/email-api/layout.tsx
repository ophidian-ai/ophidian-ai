import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Marketing API Docs",
  description: "API documentation for the OphidianAI Email Marketing product.",
};

const navLinks = [
  { href: "/docs/email-api", label: "Getting Started" },
  { href: "/docs/email-api/contacts", label: "Contacts API" },
  { href: "/docs/email-api/triggers", label: "Triggers API" },
];

export default function EmailApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] flex gap-12 px-6 py-12">
        <aside className="w-52 shrink-0">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Email Marketing API
          </p>
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 prose prose-invert max-w-none">
          {children}
        </main>
      </div>
    </div>
  );
}
