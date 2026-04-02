"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Work", href: "/work" },
  { label: "Approach", href: "/approach" },
  { label: "Pricing", href: "/pricing" },
];

const CHECKUP_LINK = { label: "Free Website Checkup", href: "/tools/website-checkup" };

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Scroll detection for nav background transition
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // Keyboard: Escape closes
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all"
      style={{
        background: scrolled ? "rgba(247, 239, 230, 0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(8px)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--color-border)"
          : "1px solid transparent",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ height: "64px", padding: "0 10px" }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          className="no-underline flex items-center"
          aria-label="OphidianAI — home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/logomark.png"
            alt="OphidianAI"
            height={42}
            style={{ height: "42px", width: "auto", display: "block" }}
          />
        </Link>

        {/* Right side: user icon + menu button */}
        <div className="flex items-center gap-3">
          {/* Client sign-in */}
          <Link
            href="/sign-in"
            aria-label="Sign in to your account"
            className="flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ flexShrink: 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/user-icon.png"
              alt="Sign in"
              style={{ height: "36px", width: "auto", display: "block" }}
            />
          </Link>

        {/* Menu button */}
        <div className="relative">
          <button
            ref={triggerRef}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-haspopup="true"
            aria-controls="nav-dropdown"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 transition-opacity hover:opacity-80"
            style={{
              background: "var(--color-dark)",
              color: "var(--color-cream)",
              width: "76px",
              height: "36px",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.01em",
            }}
          >
            <span>Menu</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              style={{
                transform: open ? "rotate(45deg)" : "none",
                transition: "transform var(--duration-fast) var(--ease-out)",
              }}
            >
              <path
                d="M2 4h10M2 7h10M2 10h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Dropdown card */}
          {open && (
            <div
              id="nav-dropdown"
              ref={dropdownRef}
              role="menu"
              className="dropdown-enter absolute right-0 mt-2"
              style={{
                width: "240px",
                background: "var(--color-dark)",
                borderRadius: "var(--radius-xl)",
                padding: "24px",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <nav>
                <ul className="flex flex-col gap-4 list-none p-0 m-0">
                  {NAV_LINKS.map(({ label, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        role="menuitem"
                        onClick={() => setOpen(false)}
                        className="block no-underline transition-colors"
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "18px",
                          fontWeight: 400,
                          color: "var(--color-cream)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.color =
                            "var(--color-terracotta)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.color =
                            "var(--color-cream)";
                        }}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href={CHECKUP_LINK.href}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className="block no-underline transition-colors"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--color-terracotta)",
                        letterSpacing: "0.01em",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.opacity = "0.75";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
                      }}
                    >
                      {CHECKUP_LINK.label} →
                    </Link>
                  </li>
                </ul>
              </nav>
              <div
                style={{
                  borderTop: "1px solid rgba(247,239,230,0.12)",
                  marginTop: "20px",
                  paddingTop: "16px",
                }}
              >
                <button
                  onClick={() => {
                    setOpen(false);
                    // Dispatch custom event — ChatbotPanel listens for this
                    window.dispatchEvent(new CustomEvent("ophidian:open-chat"));
                  }}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--color-terracotta)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Let&apos;s talk →
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </header>
  );
}
