"use client";

import { useActionState } from "react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { GlassButton } from "@/components/ui/glass-button";
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
  { value: "web_starter", label: "Web Design - Starter" },
  { value: "web_professional", label: "Web Design - Professional" },
  { value: "web_ecommerce", label: "Web Design - E-Commerce" },
  { value: "seo_audit", label: "Free SEO Audit" },
  { value: "seo_cleanup", label: "SEO Cleanup" },
  { value: "general", label: "General Inquiry" },
];

const budgetOptions = [
  { value: "", label: "Select budget range" },
  { value: "under-5k", label: "Under $5,000" },
  { value: "5k-10k", label: "$5,000 - $10,000" },
  { value: "10k-25k", label: "$10,000 - $25,000" },
  { value: "25k-50k", label: "$25,000 - $50,000" },
  { value: "50k-plus", label: "$50,000+" },
];

const inputClasses =
  "w-full rounded-lg bg-surface border border-surface-border px-4 py-3 text-foreground placeholder:text-foreground-dim transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

const initialState: ContactFormState = { success: false, message: "" };

export function ContactForm({ heading, subtitle, defaultService }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    initialState
  );

  if (state.success) {
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
        <div className="mb-12 animate-fade-up">
          <Heading level={2} gradient>
            {heading}
          </Heading>
          {subtitle && (
            <Text variant="lead" className="mt-4">
              {subtitle}
            </Text>
          )}
        </div>

        <form
          action={formAction}
          noValidate
          className="space-y-6 animate-fade-up delay-100"
        >
          {/* Server-side error message */}
          {state.message && !state.success && (
            <p className="text-sm text-red-400">{state.message}</p>
          )}

          {/* Name + Email row */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="cf-name" className="sr-only">
                Name
              </label>
              <input
                id="cf-name"
                name="name"
                type="text"
                placeholder="Name"
                required
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="cf-email" className="sr-only">
                Email
              </label>
              <input
                id="cf-email"
                name="email"
                type="email"
                placeholder="Email"
                required
                className={inputClasses}
              />
            </div>
          </div>

          {/* Company + Service row */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="cf-company" className="sr-only">
                Company
              </label>
              <input
                id="cf-company"
                name="company"
                type="text"
                placeholder="Company (optional)"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="cf-service" className="sr-only">
                Service
              </label>
              <select
                id="cf-service"
                name="service"
                defaultValue={defaultService || ""}
                className={`${inputClasses} text-foreground-dim [&:not([value=""])]:text-foreground`}
              >
                {serviceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget row */}
          <div>
            <label htmlFor="cf-budget" className="sr-only">
              Budget range
            </label>
            <select
              id="cf-budget"
              name="budget"
              defaultValue=""
              className={`${inputClasses} text-foreground-dim [&:not([value=""])]:text-foreground`}
            >
              {budgetOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="cf-message" className="sr-only">
              Message
            </label>
            <textarea
              id="cf-message"
              name="message"
              rows={5}
              placeholder="Tell us about your project"
              required
              className={`${inputClasses} resize-none`}
            />
          </div>

          <GlassButton
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            disabled={isPending}
          >
            {isPending ? "Sending..." : "Send Message"}
          </GlassButton>
        </form>
      </Container>
    </section>
  );
}

export default ContactForm;
