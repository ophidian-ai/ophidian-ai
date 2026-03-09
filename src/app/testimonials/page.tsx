"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { CTABanner } from "@/components/sections/CTABanner";
import {
  TestimonialsColumn,
  type Testimonial,
} from "@/components/ui/testimonials-columns";
import { motion } from "motion/react";

const testimonials: Testimonial[] = [
  {
    text: "OphidianAI transformed our online presence completely. The website they built drives real results and our customers love it.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Sarah Mitchell",
    role: "Small Business Owner",
  },
  {
    text: "The AI integration streamlined our customer support. Response times dropped by 80% and satisfaction scores went through the roof.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "James Rodriguez",
    role: "Operations Manager",
  },
  {
    text: "Working with Eric was seamless. He understood our vision immediately and delivered a site that exceeded our expectations.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Emily Chen",
    role: "Marketing Director",
  },
  {
    text: "The automated workflows OphidianAI built saved us 20+ hours a week. That's time we now spend growing the business.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "David Park",
    role: "CEO",
  },
  {
    text: "Finally, a tech partner who speaks our language. No jargon, just results. Our e-commerce conversion rate doubled.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Lisa Thompson",
    role: "E-commerce Manager",
  },
  {
    text: "The AI chatbot handles 70% of our support tickets now. It's like having an extra team member that never sleeps.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Amanda Foster",
    role: "Customer Success Lead",
  },
  {
    text: "OphidianAI built exactly what we needed -- no bloat, no unnecessary features. Clean, fast, and effective.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Michael Rivera",
    role: "Product Manager",
  },
  {
    text: "They delivered a solution that scaled with us. As we grew, the system grew too. Best investment we made this year.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Rachel Kim",
    role: "COO",
  },
  {
    text: "The analytics dashboard OphidianAI built gives us real-time insights we never had before. Game changer for our strategy.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Chris Anderson",
    role: "Data Analyst",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export default function TestimonialsPage() {
  return (
    <PageWrapper>
      <div className="grain">
        <section className="mt-10 mb-20 relative">
          <div className="container z-10 mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
            >
              <div className="flex justify-center">
                <div className="border border-primary/20 py-1 px-4 rounded-lg text-primary text-sm">
                  Testimonials
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-foreground">
                Trusted by{" "}
                <span className="gradient-text">growing businesses</span>
              </h2>
              <p className="text-center mt-5 text-foreground-muted">
                See what our clients have to say about working with OphidianAI.
              </p>
            </motion.div>

            <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
              <TestimonialsColumn testimonials={firstColumn} duration={15} />
              <TestimonialsColumn
                testimonials={secondColumn}
                className="hidden md:block"
                duration={19}
              />
              <TestimonialsColumn
                testimonials={thirdColumn}
                className="hidden lg:block"
                duration={17}
              />
            </div>
          </div>
        </section>

        <CTABanner
          headline="Ready to join them?"
          subtitle="Let's talk about how OphidianAI can help your business grow."
          cta={{ label: "Get in Touch", href: "/contact" }}
        />
      </div>
    </PageWrapper>
  );
}
