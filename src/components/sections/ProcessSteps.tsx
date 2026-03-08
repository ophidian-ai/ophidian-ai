import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export type Step = {
  title: string;
  description: string;
};

export type ProcessStepsProps = {
  heading: string;
  subtitle?: string;
  steps: Step[];
};

export function ProcessSteps({ heading, subtitle, steps }: ProcessStepsProps) {
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

        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent md:left-6" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className={`relative flex gap-6 animate-fade-up delay-${(i + 1) * 100}`}
              >
                {/* Step number badge */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/30 text-primary font-mono font-bold text-sm md:h-12 md:w-12">
                  {String(i + 1).padStart(2, "0")}
                </div>

                <div className="pt-1">
                  <Heading level={4} className="mb-2">
                    {step.title}
                  </Heading>
                  <Text>{step.description}</Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default ProcessSteps;
