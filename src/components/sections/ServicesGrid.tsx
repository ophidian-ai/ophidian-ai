import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const PRIMARY_SERVICES = [
  { num: "01", title: "AI-Powered Websites", image: "/images/gallery/forest-mist.jpg", wide: true },
  { num: "02", title: "SEO Services", image: "/images/gallery/mountains.jpg", wide: false },
  { num: "03", title: "Social Media Management", image: "/images/gallery/ferns.jpg", wide: false },
  { num: "04", title: "AI Integrations", image: "/images/gallery/snake.jpg", wide: false },
  { num: "05", title: "Consulting", image: "/images/gallery/marble.jpg", wide: false },
];

const SECONDARY_SERVICES = [
  { num: "06", title: "Website Maintenance" },
  { num: "07", title: "Content Writing" },
  { num: "08", title: "Analytics & Reporting" },
  { num: "09", title: "Workflow Automation" },
  { num: "10", title: "Brand Strategy" },
];

export function ServicesGrid() {
  const wide = PRIMARY_SERVICES.filter((s) => s.wide);
  const cards = PRIMARY_SERVICES.filter((s) => !s.wide);

  return (
    <section id="services" className="bg-sage py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-8">
        <h2 className="text-3xl md:text-5xl font-display text-text-dark mb-16">Services</h2>
        {wide.map((service) => (
          <div key={service.num} className="relative overflow-hidden rounded-lg mb-6 cursor-pointer group">
            <div className="aspect-[3/1] overflow-hidden">
              <Image src={service.image} alt={service.title} width={1290} height={300} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            </div>
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
            <div className="absolute top-6 left-6 text-sage text-lg font-display">{service.num}</div>
            <div className="absolute top-6 right-6">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:bg-gold transition-colors">
                <ArrowUpRight className="w-5 h-5 text-white group-hover:text-forest-deep" />
              </div>
            </div>
            <h3 className="absolute bottom-6 left-6 text-2xl md:text-3xl font-display text-white">{service.title}</h3>
          </div>
        ))}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {cards.map((service) => (
            <div key={service.num} className="relative overflow-hidden rounded-lg cursor-pointer group aspect-[3/4]">
              <Image src={service.image} alt={service.title} width={600} height={820} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
              <div className="absolute top-4 left-4 text-sage text-sm font-display">{service.num}</div>
              <div className="absolute top-4 right-4">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:bg-gold transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-white group-hover:text-forest-deep" />
                </div>
              </div>
              <h3 className="absolute bottom-4 left-4 right-4 text-lg font-display text-white">{service.title}</h3>
            </div>
          ))}
        </div>
        <div className="border-t border-forest/10">
          {SECONDARY_SERVICES.map((service) => (
            <div key={service.num} className="flex items-center justify-between py-5 border-b border-forest/10 cursor-pointer group">
              <div className="flex items-center gap-8">
                <span className="text-sm text-text-dark/40 font-mono">{service.num}</span>
                <h3 className="text-lg md:text-xl font-display text-text-dark group-hover:text-gold transition-colors">{service.title}</h3>
              </div>
              <div className="w-8 h-8 rounded-full border border-forest/20 flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-colors">
                <ArrowUpRight className="w-4 h-4 text-text-dark/40 group-hover:text-forest-deep" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
