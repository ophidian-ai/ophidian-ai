"use client";

import { useState, useTransition } from "react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import {
  submitContactForm,
  type ContactFormState,
} from "@/app/actions/contact";

export type ContactFormProps = {
  heading: string;
  subtitle?: string;
  defaultService?: string;
};

const serviceOptions = [
  { value: "", label: "Select a service" },
  { value: "web_starter", label: "Web Design — Starter" },
  { value: "web_professional", label: "Web Design — Professional" },
  { value: "web_ecommerce", label: "Web Design — E-Commerce" },
  { value: "seo_audit", label: "Free SEO Audit" },
  { value: "seo_cleanup", label: "SEO Cleanup" },
  { value: "general", label: "General Inquiry" },
];

const budgetOptions = [
  { value: "", label: "Select budget range" },
  { value: "under-5k", label: "Under $5,000" },
  { value: "5k-10k", label: "$5,000 — $10,000" },
  { value: "10k-25k", label: "$10,000 — $25,000" },
  { value: "25k-50k", label: "$25,000 — $50,000" },
  { value: "50k-plus", label: "$50,000+" },
];

const inputClasses =
  "w-full bg-transparent border-b border-white/15 pb-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-colors duration-200";

const selectClasses =
  "w-full bg-transparent border-b border-white/15 pb-3 text-foreground/70 focus:outline-none focus:border-primary transition-colors duration-200 appearance-none";

type FormData = {
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  message: string;
};

const initialFormData: FormData = {
  name: "",
  email: "",
  company: "",
  service: "",
  budget: "",
  message: "",
};

const initialState: ContactFormState = { success: false, message: "" };

export function ContactForm({ heading, subtitle, defaultService }: ContactFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    service: defaultService || "",
  });
  const [result, setResult] = useState<ContactFormState>(initialState);
  const [isPending, startTransition] = useTransition();

  function update(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
    startTransition(async () => {
      const res = await submitContactForm(initialState, fd);
      setResult(res);
    });
  }

  if (result.success) {
    return (
      <section className="py-24 md:py-32">
        <Container width="narrow">
          <div className="text-center animate-fade-up">
            <Heading level={2} gradient className="mb-4">
              Message sent.
            </Heading>
            <Text variant="lead">
              We&apos;ll be in touch shortly.
            </Text>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32">
      <Container width="narrow">
        <div className="animate-fade-up">
          {/* Step indicator */}
          <p className="text-xs font-mono text-foreground/40 mb-8 tracking-widest">
            {step}/2 Steps
          </p>

          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-8">
              <div>
                <Heading level={2} gradient>
                  {heading}
                </Heading>
                {subtitle && (
                  <Text variant="lead" className="mt-4">
                    {subtitle}
                  </Text>
                )}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="cf-name" className="sr-only">Your Name</label>
                <input
                  id="cf-name"
                  type="text"
                  placeholder="Your Name"
                  required
                  value={formData.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={inputClasses}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="cf-email" className="sr-only">Email</label>
                <input
                  id="cf-email"
                  type="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={inputClasses}
                />
              </div>

              {/* Company */}
              <div>
                <label htmlFor="cf-company" className="sr-only">Company Name</label>
                <input
                  id="cf-company"
                  type="text"
                  placeholder="Company Name (Optional)"
                  value={formData.company}
                  onChange={(e) => update("company", e.target.value)}
                  className={inputClasses}
                />
              </div>

              <button
                type="submit"
                className="text-sm font-medium text-foreground border-b border-foreground/30 pb-0.5 hover:border-primary hover:text-primary transition-colors duration-200"
              >
                Next step →
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <Heading level={2} gradient>
                  Tell us about the project
                </Heading>
              </div>

              {/* Service */}
              <div>
                <label htmlFor="cf-service" className="sr-only">Service</label>
                <select
                  id="cf-service"
                  value={formData.service}
                  onChange={(e) => update("service", e.target.value)}
                  className={selectClasses}
                >
                  {serviceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-background">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div>
                <label htmlFor="cf-budget" className="sr-only">Budget Range</label>
                <select
                  id="cf-budget"
                  value={formData.budget}
                  onChange={(e) => update("budget", e.target.value)}
                  className={selectClasses}
                >
                  {budgetOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-background">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="cf-message" className="sr-only">Tell us about your project</label>
                <textarea
                  id="cf-message"
                  rows={4}
                  placeholder="Tell us about your project"
                  required
                  value={formData.message}
                  onChange={(e) => update("message", e.target.value)}
                  className={`${inputClasses} resize-none`}
                />
              </div>

              {result.message && !result.success && (
                <p className="text-sm text-red-400">{result.message}</p>
              )}

              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-foreground/40 hover:text-foreground transition-colors duration-200"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="text-sm font-medium text-foreground border-b border-foreground/30 pb-0.5 hover:border-primary hover:text-primary transition-colors duration-200 disabled:opacity-50"
                >
                  {isPending ? "Sending..." : "Send message →"}
                </button>
              </div>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}

export default ContactForm;
