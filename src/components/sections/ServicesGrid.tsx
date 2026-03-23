import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const PRIMARY_SERVICES = [
  { num: "01", title: "AI-Powered Websites", image: "/images/gallery/forest-mist.jpg", wide: true, href: "/services" },
  { num: "02", title: "SEO Services", image: "/images/gallery/mountains.jpg", wide: false, href: "/services/seo-automation" },
  { num: "03", title: "Social Media Management", image: "/images/gallery/ferns.jpg", wide: false, href: "/services/content-generation" },
  { num: "04", title: "AI Integrations", image: "/images/gallery/snake.jpg", wide: false, href: "/services/ai-chatbot" },
  { num: "05", title: "Consulting", image: "/images/gallery/marble.jpg", wide: false, href: "/contact" },
];

const SECONDARY_SERVICES = [
  { num: "06", title: "Website Maintenance", href: "/services" },
  { num: "07", title: "Content Writing", href: "/services/content-generation" },
  { num: "08", title: "Analytics & Reporting", href: "/services" },
  { num: "09", title: "Workflow Automation", href: "/services/crm-automation" },
  { num: "10", title: "Brand Strategy", href: "/services" },
];

export function ServicesGrid() {
  const wide = PRIMARY_SERVICES.filter((s) => s.wide);
  const cards = PRIMARY_SERVICES.filter((s) => !s.wide);

  return (
    <section id="services" className="py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-display mb-10 sm:mb-16" style={{ color: "var(--color-on-surface)" }}>Services</h2>
        {wide.map((service) => (
          <Link key={service.num} href={service.href} className="block relative overflow-hidden rounded-lg mb-6 cursor-pointer group">
            <div className="aspect-[2/1] sm:aspect-[3/1] overflow-hidden">
              <Image src={service.image} alt={service.title} width={1290} height={300} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            </div>
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
            <div className="absolute top-6 left-6 text-lg font-display" style={{ color: "var(--color-on-surface)" }}>{service.num}</div>
            <div className="absolute top-6 right-6">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:bg-gold transition-colors">
                <ArrowUpRight className="w-5 h-5 text-white group-hover:text-forest-deep" />
              </div>
            </div>
            <h3 className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-xl sm:text-2xl md:text-3xl font-display text-white">{service.title}</h3>
          </Link>
        ))}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12">
          {cards.map((service) => (
            <Link key={service.num} href={service.href} className="relative overflow-hidden rounded-lg cursor-pointer group aspect-[3/4]">
              <Image src={service.image} alt={service.title} width={600} height={820} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
              <div className="absolute top-4 left-4 text-sm font-display" style={{ color: "var(--color-on-surface)" }}>{service.num}</div>
              <div className="absolute top-4 right-4">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:bg-gold transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-white group-hover:text-forest-deep" />
                </div>
              </div>
              <h3 className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-sm sm:text-lg font-display text-white">{service.title}</h3>
            </Link>
          ))}
        </div>
        <div className="space-y-0">
          {SECONDARY_SERVICES.map((service) => (
            <Link key={service.num} href={service.href} className="flex items-center justify-between py-5 cursor-pointer group rounded-lg px-4 transition-colors hover:bg-[var(--color-surface-container-high)]">
              <div className="flex items-center gap-4 sm:gap-8">
                <span className="text-sm font-mono" style={{ color: "var(--color-on-surface-variant)" }}>{service.num}</span>
                <h3 className="text-lg md:text-xl font-display transition-colors" style={{ color: "var(--color-on-surface)" }}>{service.title}</h3>
              </div>
              <div className="w-8 h-8 rounded-full ghost-border flex items-center justify-center group-hover:border-transparent transition-colors" style={{ ["--tw-border-opacity" as string]: 1 }}>
                <ArrowUpRight className="w-4 h-4 transition-colors" style={{ color: "var(--color-on-surface-variant)" }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
