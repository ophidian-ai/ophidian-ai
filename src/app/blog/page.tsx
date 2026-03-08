import Link from "next/link";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { HeroSimple } from "@/components/sections/HeroSimple";
import { CTABanner } from "@/components/sections/CTABanner";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getAllPosts } from "@/lib/blog";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <PageWrapper>
      <div className="grain">
        <HeroSimple
          title="Blog"
          subtitle="Insights on AI, automation, and building smarter businesses."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Blog", href: "/blog" },
          ]}
        />

        <section className="py-24 md:py-32">
          <Container width="default">
            {posts.length === 0 ? (
              <div className="text-center animate-fade-up">
                <Text variant="lead">
                  We are working on our first posts. Check back soon for
                  practical guides, industry insights, and automation strategies.
                </Text>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => {
                  const formattedDate = new Date(post.date).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  );

                  return (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group"
                    >
                      <Card className="flex flex-col h-full">
                        {/* Image placeholder */}
                        <div className="aspect-video rounded-lg bg-surface-elevated mb-4 flex items-center justify-center">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1}
                            className="h-10 w-10 text-foreground-dim/30"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                            />
                          </svg>
                        </div>

                        <Text variant="label" className="mb-2">
                          {formattedDate}
                        </Text>

                        <Heading level={3} className="text-lg mb-2">
                          {post.title}
                        </Heading>

                        <Text variant="small" className="mb-4 flex-1">
                          {post.description}
                        </Text>

                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="muted">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <span className="text-sm text-foreground-dim group-hover:text-primary transition-colors">
                          Read more &rarr;
                        </span>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </Container>
        </section>

        <CTABanner
          headline="Have a question about AI or automation?"
          subtitle="Get in touch and let us talk about how we can help your business."
          cta={{ label: "Contact Us", href: "/contact" }}
        />
      </div>
    </PageWrapper>
  );
}
