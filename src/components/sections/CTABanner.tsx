import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { GlassButton } from "@/components/ui/glass-button";

export type CTABannerProps = {
  headline: string;
  subtitle?: string;
  cta: { label: string; href: string };
};

export function CTABanner({ headline, subtitle, cta }: CTABannerProps) {
  return (
    <section className="py-20 md:py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5" />
      <div className="absolute inset-0 -z-10 border-y border-primary/10" />

      <Container width="default">
        <div className="flex flex-col items-center text-center animate-fade-up">
          <Heading level={2} gradient className="mb-4">
            {headline}
          </Heading>

          {subtitle && (
            <Text variant="lead" className="mb-8 max-w-xl">
              {subtitle}
            </Text>
          )}

          <GlassButton size="lg" href={cta.href}>
            {cta.label}
          </GlassButton>
        </div>
      </Container>
    </section>
  );
}

export default CTABanner;
