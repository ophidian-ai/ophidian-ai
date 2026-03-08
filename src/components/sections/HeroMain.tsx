import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";

export type HeroMainProps = {
  headline: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export function HeroMain({
  headline,
  subtitle,
  primaryCta,
  secondaryCta,
}: HeroMainProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 h-80 w-80 rounded-full bg-accent/3 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/3 blur-[128px]" />
      </div>

      <Container width="default">
        <div className="max-w-3xl animate-fade-up">
          <Heading level={1} gradient className="mb-6">
            {headline}
          </Heading>

          <Text variant="lead" className="mb-10 max-w-2xl">
            {subtitle}
          </Text>

          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="lg" href={primaryCta.href}>
              {primaryCta.label}
            </Button>

            {secondaryCta && (
              <Button variant="secondary" size="lg" href={secondaryCta.href}>
                {secondaryCta.label}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default HeroMain;
