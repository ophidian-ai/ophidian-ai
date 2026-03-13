"use client";

import { useEffect, useState } from "react";
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
import { getPortfolioProjects, type PortfolioProject } from "@/lib/portfolio";
import { ArrowRight, ExternalLink } from "lucide-react";

export default function PortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPortfolioProjects().then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  return (
    <PageWrapper>
      <div className="grain">
        {/* Header */}
        <section className="py-24 md:py-32">
          <Container width="default">
            <div className="mb-16 max-w-3xl">
              <Badge variant="default" className="mb-4">Portfolio</Badge>
              <Heading level={1} gradient className="mb-4">Our Work</Heading>
              <Text variant="body" className="text-lg">
                Real projects built for real businesses. Each case study breaks down the challenge, solution, and results.
              </Text>
            </div>

            {/* Project Cards */}
            {loading ? (
              <div className="grid md:grid-cols-2 gap-8">
                {[1, 2].map((i) => (
                  <div key={i} className="glass rounded-2xl border border-primary/10 overflow-hidden animate-pulse">
                    <div className="aspect-video bg-surface-hover/50" />
                    <div className="p-6 space-y-3">
                      <div className="h-6 w-48 bg-surface-hover/50 rounded" />
                      <div className="h-4 w-64 bg-surface-hover/30 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {projects.map((project) => (
                  <Link key={project.id} href={`/portfolio/${project.slug}`} className="group block h-full">
                    <GlowCard className="glass rounded-2xl border border-primary/10 overflow-hidden transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/5 h-full flex flex-col">
                      <div className="relative aspect-video bg-surface border-b border-primary/10 overflow-hidden">
                        <Image
                          src={project.hero_image}
                          alt={project.hero_image_alt}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ objectPosition: project.hero_image_pos }}
                        />
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                              {project.title}
                            </h2>
                            <Text variant="small">{project.subtitle}</Text>
                          </div>
                          <ArrowRight className="h-5 w-5 text-foreground-muted group-hover:text-primary transition-all group-hover:translate-x-1 flex-shrink-0 mt-1" />
                        </div>
                        {project.description && (
                          <Text variant="body" className="mt-3 line-clamp-2 text-sm">{project.description}</Text>
                        )}
                        {/* Metric pills */}
                        {project.metrics.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {project.metrics.slice(0, 4).map((m, i) => (
                              <span key={i} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                                {m.value} {m.label}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-auto pt-4">
                          {project.external_url ? (
                            <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                              <ExternalLink className="h-3 w-3" />
                              Live site available
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                              <ArrowRight className="h-3 w-3" />
                              View case study
                            </div>
                          )}
                        </div>
                      </div>
                    </GlowCard>
                  </Link>
                ))}
              </div>
            )}
          </Container>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <Container width="narrow">
            <div className="text-center animate-fade-up">
              <Heading level={3} gradient className="mb-4">More projects coming soon</Heading>
              <Text variant="body" className="mb-8">
                OphidianAI is actively building our portfolio. We are currently taking on new clients -- if you have a project in mind, we would love to hear about it.
              </Text>
              <GlassButton size="lg" href="/contact">Start a Project</GlassButton>
            </div>
          </Container>
        </section>

        <CTABanner
          headline="Ready to build something great?"
          subtitle="Let's talk about your project. No contracts, no pressure -- just a conversation about what you need."
          cta={{ label: "Get in Touch", href: "/contact" }}
        />
      </div>
    </PageWrapper>
  );
}
