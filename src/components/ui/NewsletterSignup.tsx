"use client";

import { useState, type FormEvent } from "react";

type Variant = "inline" | "stacked";

interface NewsletterSignupProps {
  variant?: Variant;
  source?: string;
  heading?: string;
  description?: string;
  className?: string;
}

export function NewsletterSignup({
  variant = "stacked",
  source = "website",
  heading = "Stay in the loop",
  description = "Practical tips on AI, web design, and growing your small business. No spam, unsubscribe anytime.",
  className = "",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong.");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-primary font-medium">You are subscribed!</p>
        <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
          We will send you our best content. No spam, ever.
        </p>
      </div>
    );
  }

  const isInline = variant === "inline";

  return (
    <div className={className}>
      {heading && (
        <h3
          className="text-sm font-display tracking-wider uppercase mb-2"
          style={{ color: "var(--color-on-surface)" }}
        >
          {heading}
        </h3>
      )}
      {description && (
        <p
          className="text-sm mb-4"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          {description}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className={
          isInline
            ? "flex gap-2 items-start"
            : "flex flex-col gap-3"
        }
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={status === "loading"}
          className={[
            "rounded-lg bg-surface border border-surface-border px-4 py-2.5 text-sm text-foreground",
            "placeholder:text-foreground-dim",
            "transition-colors duration-200",
            "focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isInline ? "flex-1 min-w-0" : "w-full",
          ].join(" ")}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={[
            "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
            "transition-all duration-200 cursor-pointer",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            "disabled:opacity-50 disabled:pointer-events-none",
            "bg-primary text-background hover:bg-primary-light active:bg-primary-dark",
            "px-5 py-2.5 text-sm",
            isInline ? "shrink-0" : "w-full",
          ].join(" ")}
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {status === "error" && (
        <p className="text-xs text-red-400 mt-2">{errorMessage}</p>
      )}
    </div>
  );
}

export default NewsletterSignup;
