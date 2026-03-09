"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Chrome } from "lucide-react";

interface LoginFormProps {
  onSubmit: (email: string, password: string, remember: boolean) => void;
  onGoogleSignIn?: () => void;
  signUpHref?: string;
}

interface FormInputProps {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  children?: React.ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({
  icon,
  type,
  placeholder,
  value,
  onChange,
  required,
  children,
}) => {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
      />
      {children}
    </div>
  );
};

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: () => void;
  id: string;
}> = ({ checked, onChange, id }) => {
  return (
    <div className="relative inline-block w-10 h-5 cursor-pointer">
      <input
        type="checkbox"
        id={id}
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      <div
        className={`absolute inset-0 rounded-full transition-colors duration-200 ease-in-out ${
          checked ? "bg-primary" : "bg-white/20"
        }`}
      >
        <div
          className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </div>
    </div>
  );
};

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onGoogleSignIn,
  signUpHref = "/contact",
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    onSubmit(email, password, remember);
    setIsSubmitting(false);
  };

  return (
    <div className="p-8 sm:p-10 rounded-2xl backdrop-blur-md bg-background/60 border border-primary/10 shadow-2xl shadow-black/40 max-w-md w-full mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
            <span className="text-background font-bold text-sm">O</span>
          </div>
          <span className="text-xl font-semibold text-foreground tracking-tight">
            OphidianAI
          </span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-1">
          Welcome back
        </h2>
        <p className="text-foreground-muted text-sm">
          Sign in to your account to continue
        </p>
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={onGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 py-3 bg-white/5 border border-white/10 rounded-lg text-foreground hover:bg-white/10 transition-colors mb-6 cursor-pointer"
      >
        <Chrome size={18} />
        <span className="text-sm font-medium">Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="border-t border-white/10 absolute w-full" />
        <div className="bg-transparent px-4 relative text-foreground-dim text-xs uppercase tracking-wider">
          or sign in with email
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          icon={<Mail className="text-foreground-dim" size={18} />}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <FormInput
          icon={<Lock className="text-foreground-dim" size={18} />}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        >
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-dim hover:text-foreground focus:outline-none transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </FormInput>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              onClick={() => setRemember(!remember)}
              className="cursor-pointer"
            >
              <ToggleSwitch
                checked={remember}
                onChange={() => setRemember(!remember)}
                id="remember-me"
              />
            </div>
            <label
              htmlFor="remember-me"
              className="text-sm text-foreground-muted cursor-pointer hover:text-foreground transition-colors"
              onClick={() => setRemember(!remember)}
            >
              Remember me
            </label>
          </div>
          <a
            href="#"
            className="text-sm text-foreground-muted hover:text-primary transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-background font-semibold transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-primary/20 hover:shadow-primary/40 cursor-pointer"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-dim">
        Don&apos;t have an account?{" "}
        <a
          href={signUpHref}
          className="font-medium text-foreground hover:text-primary transition-colors"
        >
          Create Account
        </a>
      </p>
    </div>
  );
};
