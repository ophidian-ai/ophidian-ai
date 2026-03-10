"use client"

import { useRouter } from "next/navigation"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { Container } from "@/components/ui/Container"
import { GlassButton } from "@/components/ui/glass-button"
import { CheckCircle } from "lucide-react"

export default function CheckoutSuccessPage() {
  const router = useRouter()

  return (
    <PageWrapper>
      <div className="grain">
        <section className="py-24 md:py-32">
          <Container width="narrow">
            <div className="text-center animate-fade-in">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/20 mb-8">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-3">
                Payment successful
              </h1>
              <p className="text-lg text-foreground-muted mb-4 max-w-md mx-auto">
                Thank you for choosing OphidianAI. We&apos;ll be in touch
                within 24 hours to kick off your project.
              </p>
              <p className="text-sm text-foreground-dim mb-10">
                A confirmation email has been sent to your email address.
              </p>
              <div className="flex items-center justify-center gap-4">
                <GlassButton onClick={() => router.push("/")}>
                  Back to Home
                </GlassButton>
                <GlassButton
                  onClick={() => router.push("/contact")}
                  className="opacity-80"
                >
                  Contact Us
                </GlassButton>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </PageWrapper>
  )
}
