"use client";

import * as React from "react";

interface SignInProps {
  onSignIn?: (email: string, password: string) => void;
  onGoogleSignIn?: () => void;
  signUpHref?: string;
}

const SignIn = ({ onSignIn, onGoogleSignIn, signUpHref = "#" }: SignInProps) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignIn = () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    if (onSignIn) {
      onSignIn(email, password);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden w-full">
      {/* Centered glass card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-surface/60 to-background backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center border border-primary/10">
        {/* Logo */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-6 shadow-lg shadow-primary/10">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-6 h-6 text-primary"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        {/* Title */}
        <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
          OphidianAI
        </h2>
        {/* Form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            <input
              placeholder="Email"
              type="email"
              value={email}
              className="w-full px-5 py-3 rounded-xl bg-surface/50 text-foreground placeholder-foreground-dim text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 border border-primary/10 transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              className="w-full px-5 py-3 rounded-xl bg-surface/50 text-foreground placeholder-foreground-dim text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 border border-primary/10 transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <div className="text-sm text-red-400 text-left">{error}</div>
            )}
          </div>
          <hr className="border-primary/10" />
          <div>
            <button
              onClick={handleSignIn}
              className="w-full bg-primary/20 text-foreground font-medium px-5 py-3 rounded-full shadow hover:bg-primary/30 transition mb-3 text-sm border border-primary/20"
            >
              Sign in
            </button>
            {/* Google Sign In */}
            <button
              onClick={onGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-surface to-surface-hover rounded-full px-5 py-3 font-medium text-foreground shadow hover:brightness-110 transition mb-2 text-sm border border-primary/10"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
            <div className="w-full text-center mt-2">
              <span className="text-xs text-foreground-dim">
                Don&apos;t have an account?{" "}
                <a
                  href={signUpHref}
                  className="underline text-primary/80 hover:text-primary"
                >
                  Sign up, it&apos;s free!
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Social proof */}
      <div className="relative z-10 mt-12 flex flex-col items-center text-center">
        <p className="text-foreground-muted text-sm mb-2">
          Join{" "}
          <span className="font-medium text-foreground">growing businesses</span>{" "}
          who trust OphidianAI.
        </p>
        <div className="flex -space-x-1">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-background object-cover"
          />
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-background object-cover"
          />
          <img
            src="https://randomuser.me/api/portraits/men/54.jpg"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-background object-cover"
          />
          <img
            src="https://randomuser.me/api/portraits/women/68.jpg"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-background object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export { SignIn };
