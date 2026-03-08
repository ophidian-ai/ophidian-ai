import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";

export type Feature = {
  icon: ReactNode;
  title: string;
  description: string;
};

export type FeaturesGridProps = {
  heading: string;
  subtitle?: string;
  features: Feature[];
};

export function FeaturesGrid({
  heading,
  subtitle,
  features,
}: FeaturesGridProps) {
  return (
    <section className="py-24 md:py-32">
      <Container width="default">
        <div className="mb-16 max-w-2xl animate-fade-up">
          <Heading level={2} gradient>
            {heading}
          </Heading>
          {subtitle && (
            <Text variant="lead" className="mt-4">
              {subtitle}
            </Text>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, i) => (
            <Card
              key={feature.title}
              variant="feature"
              icon={feature.icon}
              className={`animate-fade-up delay-${(i + 1) * 100}`}
            >
              <Heading level={4} className="mb-2">
                {feature.title}
              </Heading>
              <Text variant="small">{feature.description}</Text>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default FeaturesGrid;
