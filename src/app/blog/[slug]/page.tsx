import { notFound } from "next/navigation";
import Link from "next/link";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { NewsletterSignup } from "@/components/ui/NewsletterSignup";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <PageWrapper>
      <div className="grain">
        <section className="pt-32 pb-24 md:pt-40 md:pb-32">
          <Container width="narrow">
            <Link
              href="/blog"
              className="inline-flex items-center text-sm text-foreground-dim hover:text-primary transition-colors mb-8"
            >
              &larr; Back to Blog
            </Link>

            <article className="animate-fade-up">
              <header className="mb-12">
                <Text variant="label" className="mb-4">
                  {formattedDate}
                </Text>

                <Heading level={1} className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  {post.title}
                </Heading>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="muted">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </header>

              <MarkdownContent content={post.content} />
            </article>

            {/* Newsletter signup at end of post */}
            <div className="mt-16 pt-12 border-t border-surface-border">
              <div className="glass rounded-xl p-8 text-center">
                <h3 className="text-xl font-display font-bold mb-2" style={{ color: "var(--color-on-surface)" }}>
                  Enjoyed this article?
                </h3>
                <p className="text-sm mb-6" style={{ color: "var(--color-on-surface-variant)" }}>
                  Get more practical tips on websites, AI, and growing your small business delivered to your inbox.
                </p>
                <div className="max-w-md mx-auto">
                  <NewsletterSignup
                    variant="inline"
                    source="blog_post"
                    heading=""
                    description=""
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </PageWrapper>
  );
}
