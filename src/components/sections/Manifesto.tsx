import Image from "next/image";

export function Manifesto() {
  return (
    <section className="py-24 md:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Asymmetric editorial layout — text bleeds off-grid, images overlap */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 items-start">
          {/* Images — staggered, overlapping with tonal depth */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4 relative">
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden shadow-ambient">
                <Image src="/images/gallery/forest-mist.jpg" alt="Forest atmosphere" width={410} height={628} className="w-full h-auto object-cover" />
              </div>
              <div className="rounded-lg overflow-hidden shadow-ambient">
                <Image src="/images/gallery/moss.jpg" alt="Natural texture" width={300} height={300} className="w-full h-auto object-cover" />
              </div>
            </div>
            <div className="space-y-4 pt-16 md:pt-24">
              <div className="rounded-lg overflow-hidden shadow-ambient md:-ml-8 relative z-10">
                <Image src="/images/gallery/marble.jpg" alt="Organic forms" width={300} height={416} className="w-full h-auto object-cover" />
              </div>
              <div className="rounded-lg overflow-hidden shadow-ambient">
                <Image src="/images/gallery/leaves.jpg" alt="Natural detail" width={410} height={588} className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>
          {/* Text — offset right, breaking the grid */}
          <div className="md:col-span-6 md:col-start-7 space-y-8 md:pt-16">
            <p className="text-xl md:text-2xl lg:text-3xl font-display leading-relaxed font-light" style={{ color: "var(--color-on-surface)", letterSpacing: "-0.02em" }}>
              We believe technology should feel as natural as the world it was inspired by.
              OphidianAI builds intelligent systems that work with the organic rhythms of your
              business — not against them.
            </p>
            <p className="text-lg leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
              Our approach connects the precision of artificial intelligence with the adaptability
              of nature. Every website, every automation, every integration is crafted to grow
              with you — not just serve you today.
            </p>
            <div style={{ height: "2.75rem" }} />
            <p className="text-lg leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
              We want your experience working with us to feel effortless — personal,
              transparent, and with no unnecessary complexity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
