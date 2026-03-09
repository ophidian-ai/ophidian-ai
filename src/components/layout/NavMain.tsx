"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { GlassButton } from "@/components/ui/glass-button";
import { AccountPopover } from "@/components/ui/account-popover";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/projects", label: "Projects" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function NavMain() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authUser, setAuthUser] = useState<{
    name: string;
    email: string;
    avatarUrl?: string;
    initials: string;
  } | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch auth state from Supabase
  useEffect(() => {
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      // Supabase not configured -- skip auth
      return;
    }

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      const name = profile?.full_name || user.email?.split("@")[0] || "User";
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const closeMenu = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-surface-border shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="group flex items-center gap-2 text-xl font-bold tracking-tight transition-colors"
            >
              <Image
                src="/images/logo_icon.png"
                alt="OphidianAI"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent transition-all duration-500 group-hover:from-accent group-hover:to-primary">
                OphidianAI
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden items-center gap-1 md:flex">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="relative px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:text-foreground after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-0 after:-translate-x-1/2 after:bg-primary after:transition-all after:duration-300 hover:after:w-2/3"
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA + Account */}
            <div className="hidden items-center gap-3 md:flex">
              <GlassButton size="sm" href="/contact">
                Get Started
              </GlassButton>
              <AccountPopover user={authUser} />
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:text-foreground md:hidden"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              <div className="flex h-5 w-5 flex-col items-center justify-center gap-1.5">
                <span
                  className={`block h-0.5 w-5 bg-current transition-all duration-300 ${
                    isOpen ? "translate-y-2 rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-current transition-all duration-300 ${
                    isOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-current transition-all duration-300 ${
                    isOpen ? "-translate-y-2 -rotate-45" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 z-35 h-full w-72 transform bg-background-alt/95 backdrop-blur-xl border-l border-surface-border transition-transform duration-300 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-2 px-6 pt-24">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 text-base font-medium text-foreground-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              {label}
            </Link>
          ))}
          <div className="mt-4 border-t border-surface-border pt-4 space-y-3">
            <GlassButton size="default" href="/contact" onClick={closeMenu} className="w-full">
              Get Started
            </GlassButton>
            {authUser ? (
              <GlassButton size="default" href="/dashboard" onClick={closeMenu} className="w-full">
                Dashboard
              </GlassButton>
            ) : (
              <GlassButton size="default" href="/sign-in" onClick={closeMenu} className="w-full">
                Sign In
              </GlassButton>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
