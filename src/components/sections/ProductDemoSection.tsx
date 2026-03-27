import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export interface ProductDemoSectionProps {
  eyebrow: string;
  headline: string;
  description: string;
  mockup: ReactNode;
  /** If true, mockup appears on the right (default). If false, on the left. */
  reversed?: boolean;
}

export function ProductDemoSection({
  eyebrow,
  headline,
  description,
  mockup,
  reversed = false,
}: ProductDemoSectionProps) {
  return (
    <section className="py-20 md:py-24">
      <Container width="default">
        <div className="mb-10 text-center">
          <Heading level={2} gradient>
            {eyebrow}
          </Heading>
        </div>
        <div
          className={`flex flex-col ${
            reversed ? "lg:flex-row-reverse" : "lg:flex-row"
          } items-center gap-12 lg:gap-20`}
        >
          {/* Mockup side */}
          <div className="w-full lg:w-5/12 flex-shrink-0">
            <div
              style={{
                filter: "drop-shadow(0 16px 48px rgba(5,23,11,0.35))",
              }}
            >
              {mockup}
            </div>
          </div>

          {/* Description side */}
          <div className="w-full lg:w-7/12 space-y-4">
            <Heading level={3} gradient>
              {headline}
            </Heading>
            <Text variant="body" className="max-w-lg">
              {description}
            </Text>
          </div>
        </div>
      </Container>
    </section>
  );
}
