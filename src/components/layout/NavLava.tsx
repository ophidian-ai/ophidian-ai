"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AccountPopover } from "@/components/ui/account-popover";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { label: "About", anchor: "#about", route: "/about" },
  { label: "Portfolio", anchor: "#portfolio", route: "/portfolio" },
  { label: "Services", anchor: "#services", route: "/services" },
  { label: "Pricing", anchor: "#pricing", route: "/pricing" },
  { label: "FAQ", anchor: "#faq", route: "/faq" },
  { label: "Contact", anchor: "#contact", route: "/contact" },
];

export function NavLava() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [authUser, setAuthUser] = useState<{
    name: string;
    email: string;
    avatarUrl?: string;
    initials: string;
  } | null>(null);

  // Scroll tracking (homepage only)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      if (!isHomepage) return;
      const sections = NAV_LINKS.map((l) => l.anchor.slice(1));
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 200) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomepage]);

  // Auth state
  useEffect(() => {
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      return;
    }

    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setAuthUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      const name =
        profile?.full_name || user.email?.split("@")[0] || "User";
      const initials = name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      setAuthUser({
        name,
        email: user.email || "",
        avatarUrl: profile?.avatar_url || undefined,
        initials,
      });
    }

    getUser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => getUser());
    return () => subscription.unsubscribe();
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const closeMenu = useCallback(() => setIsOpen(false), []);

  const getHref = (link: (typeof NAV_LINKS)[number]) =>
    isHomepage ? link.anchor : link.route;

  const isActive = (link: (typeof NAV_LINKS)[number]) => {
    if (isHomepage) return activeSection === link.anchor.slice(1);
    return pathname === link.route;
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-forest-deep/80 backdrop-blur-md border-b border-white/5"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-[1400px] mx-auto flex items-center justify-between px-8 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo_icon.png"
              alt="OphidianAI"
              width={40}
              height={40}
            />
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={getHref(link)}
                  className={cn(
                    "text-sm tracking-wide transition-colors",
                    isActive(link)
                      ? "text-text-light border-b border-gold pb-1"
                      : "text-text-muted hover:text-text-light"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTA + Account */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href={isHomepage ? "#contact" : "/contact"}
              className="px-6 py-2.5 rounded-full text-sm font-medium bg-gold text-forest-deep hover:bg-gold-light transition-colors"
            >
              Get Started
            </Link>
            <AccountPopover user={authUser} />
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg text-text-muted transition-colors hover:text-text-light md:hidden"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            <div className="flex h-5 w-5 flex-col items-center justify-center gap-1.5">
              <span
                className={cn(
                  "block h-0.5 w-5 bg-current transition-all duration-300",
                  isOpen && "translate-y-2 rotate-45"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-current transition-all duration-300",
                  isOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-current transition-all duration-300",
                  isOpen && "-translate-y-2 -rotate-45"
                )}
              />
            </div>
          </button>
        </nav>
      </header>

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 z-40 h-full w-72 transform bg-forest-deep/95 backdrop-blur-xl border-l border-white/5 transition-transform duration-300 ease-out md:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col gap-2 px-6 pt-24">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={getHref(link)}
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 text-base font-medium text-text-muted transition-colors hover:bg-forest hover:text-text-light"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 border-t border-white/10 pt-4 space-y-3">
            <Link
              href={isHomepage ? "#contact" : "/contact"}
              onClick={closeMenu}
              className="block w-full text-center px-6 py-3 rounded-full text-sm font-medium bg-gold text-forest-deep hover:bg-gold-light transition-colors"
            >
              Get Started
            </Link>
            {authUser ? (
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="block w-full text-center px-6 py-3 rounded-full text-sm font-medium border border-white/10 text-text-light hover:border-gold/40 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/sign-in"
                onClick={closeMenu}
                className="block w-full text-center px-6 py-3 rounded-full text-sm font-medium border border-white/10 text-text-light hover:border-gold/40 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
