import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export type HeroSimpleProps = {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href: string }[];
};

export function HeroSimple({ title, subtitle, breadcrumbs }: HeroSimpleProps) {
  return (
    <section className="py-20 md:py-24">
      <Container width="default">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-foreground-dim">
              {breadcrumbs.map((crumb, i) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  {i > 0 && (
                    <span className="text-foreground-dim" aria-hidden="true">
                      /
                    </span>
                  )}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="text-foreground-muted">{crumb.label}</span>
                  ) : (
                    <a
                      href={crumb.href}
                      className="hover:text-primary transition-colors"
                    >
                      {crumb.label}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="animate-fade-up">
          <Heading level={1} gradient>
            {title}
          </Heading>

          {subtitle && (
            <Text variant="lead" className="mt-4 max-w-2xl">
              {subtitle}
            </Text>
          )}
        </div>
      </Container>
    </section>
  );
}

export default HeroSimple;
