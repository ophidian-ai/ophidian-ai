"use client";

import type React from "react";
import { useState, useRef } from "react";

interface OTPVerificationProps {
  email?: string;
  onVerify?: (code: string) => void;
  onResend?: () => void;
}

export function OTPVerification({
  email = "you@example.com",
  onVerify,
  onResend,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 4) return;

    setIsLoading(true);
    if (onVerify) {
      onVerify(otpCode);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const handleResend = () => {
    if (onResend) {
      onResend();
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-background to-accent/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/90 to-background/95" />
        </div>

        <div className="relative z-10 p-8 py-14">
          <div className="text-center mb-8">
            <div className="w-8 h-8 mx-auto mb-6 text-primary">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-full h-full"
              >
                <path d="M13 0L4 14h6l-2 10 9-14h-6l2-10z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-3">
              Enter verification code
            </h1>
            <p className="text-foreground-muted text-sm leading-relaxed">
              We emailed you a verification code to
              <br />
              <span className="text-primary">{email}</span>
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            {otp.map((digit, index) => (
              <div key={index} className="relative">
                <input
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-xl font-medium bg-surface/50 border-primary/20 text-foreground placeholder-foreground-dim focus:bg-surface focus:border-primary/40 focus:outline-none transition-all duration-200 border shadow-lg rounded-2xl"
                  placeholder=""
                />
              </div>
            ))}
          </div>

          <div className="text-center mb-8">
            <span className="text-foreground-muted text-sm">
              Didn&apos;t get the code?{" "}
            </span>
            <button
              onClick={handleResend}
              className="text-primary hover:text-primary-light text-sm font-medium transition-colors duration-200"
            >
              Resend
            </button>
          </div>

          <button
            onClick={handleVerify}
            disabled={isLoading || otp.join("").length !== 4}
            className="w-full py-3 rounded-xl bg-primary text-background font-semibold transition-all duration-200 hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>

          <div className="text-center mt-6">
            <p className="text-foreground-dim text-xs leading-relaxed">
              By continuing, you agree to our{" "}
              <button className="text-foreground-muted hover:text-foreground underline transition-colors">
                Terms of Service
              </button>{" "}
              &{" "}
              <button className="text-foreground-muted hover:text-foreground underline transition-colors">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
