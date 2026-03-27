"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CTABanner } from "@/components/sections/CTABanner";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { GlassButton } from "@/components/ui/glass-button";
import { GlowCard } from "@/components/ui/spotlight-card";
import { getPortfolioProject, type PortfolioProject } from "@/lib/portfolio";
import {
  Globe,
  ShoppingCart,
  Smartphone,
  Palette,
  Database,
  CreditCard,
  Calendar,
  Search,
  Zap,
  CheckCircle,
  Video,
  Facebook,
  MapPin,
  ArrowLeft,
  ExternalLink,
  Wrench,
  Shield,
  Users,
  Monitor,
  ClipboardList,
  Truck,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Globe,
  ShoppingCart,
  Smartphone,
  Palette,
  Database,
  CreditCard,
  Calendar,
  Search,
  Zap,
  CheckCircle,
  Video,
  Facebook,
  MapPin,
  ExternalLink,
  Wrench,
  Shield,
  Users,
  Monitor,
  ClipboardList,
  Truck,
};

export default function PortfolioProjectPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPortfolioProject(slug).then((data) => {
      setProject(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="grain">
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse text-foreground-muted">Loading...</div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!project) {
    return (
      <PageWrapper>
        <div className="grain">
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <Heading level={1} gradient>Project Not Found</Heading>
            <Text variant="body">This project doesn&apos;t exist or has been removed.</Text>
            <GlassButton href="/portfolio">Back to Portfolio</GlassButton>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="grain">
        {/* Hero */}
        <section className="py-24 md:py-32">
          <Container width="default">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              All Projects
            </Link>

            <div className="mb-12 max-w-3xl">
              <Badge variant="default" className="mb-4">Case Study</Badge>
              <Heading level={1} gradient className="mb-4">{project.title}</Heading>
              <Text variant="body" className="text-lg">{project.description}</Text>
              {project.external_url && (
                <a
                  href={project.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary hover:text-accent transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Live Site
                </a>
              )}
            </div>

            {/* Hero screenshot */}
            <GlowCard className="glass rounded-2xl overflow-hidden border border-primary/10 animate-fade-up">
              <div className="relative aspect-video bg-surface border-b border-primary/10 overflow-hidden">
                <Image
                  src={project.hero_image}
                  alt={project.hero_image_alt}
                  fill
                  className="object-cover"
                  style={{ objectPosition: project.hero_image_pos }}
                  priority
                />
              </div>
            </GlowCard>

            {/* Metrics */}
            {project.metrics.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                {project.metrics.map((item, i) => (
                  <GlowCard key={i} className="rounded-xl bg-surface-hover/50 border border-primary/5 p-5 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{item.value}</div>
                    <Text variant="small">{item.label}</Text>
                  </GlowCard>
                ))}
              </div>
            )}
          </Container>
        </section>

        {/* Challenge / Solution */}
        {(project.challenge || project.solution) && (
          <section className="py-16 md:py-24">
            <Container width="default">
              <div className="grid md:grid-cols-2 gap-12">
                {project.challenge && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Search className="h-5 w-5 text-primary" />
                      <Heading level={3} className="text-xl font-bold text-foreground">The Challenge</Heading>
                    </div>
                    <Text variant="body" className="text-foreground-muted">{project.challenge}</Text>
                  </div>
                )}
                {project.solution && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="h-5 w-5 text-accent" />
                      <Heading level={3} className="text-xl font-bold text-foreground">The Solution</Heading>
                    </div>
                    <Text variant="body" className="text-foreground-muted">{project.solution}</Text>
                  </div>
                )}
              </div>
            </Container>
          </section>
        )}

        {/* Features */}
        {project.features.length > 0 && (
          <section className="py-16 md:py-24">
            <Container width="default">
              <div className="mb-10">
                <Heading level={2} gradient className="mb-2">Key Features</Heading>
                <Text variant="body">What we built for {project.title}.</Text>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.features.map((feature) => {
                  const Icon = iconMap[feature.icon] || CheckCircle;
                  return (
                    <GlowCard key={feature.title} className="glass rounded-xl border border-primary/10 p-6">
                      <Icon className="h-8 w-8 text-primary mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                      <Text variant="small">{feature.desc}</Text>
                    </GlowCard>
                  );
                })}
              </div>
            </Container>
          </section>
        )}

        {/* Tech Stack */}
        {project.tech_stack.length > 0 && (
          <section className="py-16 md:py-24">
            <Container width="default">
              <div className="mb-10">
                <Heading level={2} gradient className="mb-2">Tech Stack</Heading>
                <Text variant="body">Purpose-built with modern, reliable tools.</Text>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.tech_stack.map((tech) => (
                  <div key={tech.name} className="flex items-center gap-4 rounded-xl bg-surface-hover/30 border border-primary/5 p-4">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-foreground text-sm">{tech.name}</div>
                      <div className="text-xs text-foreground-dim">{tech.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Timeline */}
        {project.timeline.length > 0 && (
          <section className="py-16 md:py-24">
            <Container width="narrow">
              <div className="mb-10 text-center">
                <Heading level={2} gradient className="mb-2">Project Timeline</Heading>
                <Text variant="body">
                  From discovery to launch in {project.timeline.length} phases.
                </Text>
              </div>
              <div className="space-y-6">
                {project.timeline.map((step, i) => (
                  <div key={step.phase} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
                        {i + 1}
                      </div>
                      {i < project.timeline.length - 1 && (
                        <div className="w-px flex-1 bg-primary/10 mt-2" />
                      )}
                    </div>
                    <div className="pb-8">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">{step.phase}</h3>
                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{step.duration}</span>
                      </div>
                      <Text variant="small">{step.desc}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Results */}
        {project.results.length > 0 && (
          <section className="py-16 md:py-24">
            <Container width="default">
              <div className="glass rounded-2xl border border-primary/10 p-8 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="h-6 w-6 text-primary" />
                  <Heading level={2} gradient>Results</Heading>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {project.results.slice(0, Math.ceil(project.results.length / 2)).map((result, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <Text variant="body" className="text-foreground-muted">{result}</Text>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {project.results.slice(Math.ceil(project.results.length / 2)).map((result, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <Text variant="body" className="text-foreground-muted">{result}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Container>
          </section>
        )}

        <CTABanner
          headline="Ready to build something great?"
          subtitle="Let's talk about your project. No contracts, no pressure -- just a conversation about what you need."
          cta={{ label: "Get in Touch", href: "/contact" }}
        />
      </div>
    </PageWrapper>
  );
}
