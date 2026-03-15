import Image from "next/image";

export function Manifesto() {
  return (
    <section className="bg-sage py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden">
                <Image src="/images/gallery/forest-mist.jpg" alt="Forest atmosphere" width={410} height={628} className="w-full h-auto object-cover" />
              </div>
              <div className="rounded-lg overflow-hidden">
                <Image src="/images/gallery/moss.jpg" alt="Natural texture" width={300} height={300} className="w-full h-auto object-cover" />
              </div>
            </div>
            <div className="space-y-4 pt-12">
              <div className="rounded-lg overflow-hidden">
                <Image src="/images/gallery/marble.jpg" alt="Organic forms" width={300} height={416} className="w-full h-auto object-cover" />
              </div>
              <div className="rounded-lg overflow-hidden">
                <Image src="/images/gallery/leaves.jpg" alt="Natural detail" width={410} height={588} className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <p className="text-xl md:text-2xl text-text-dark leading-relaxed font-light">
              We believe technology should feel as natural as the world it was inspired by.
              OphidianAI builds intelligent systems that work with the organic rhythms of your
              business — not against them.
            </p>
            <p className="text-lg text-text-dark/70 leading-relaxed">
              Our approach connects the precision of artificial intelligence with the adaptability
              of nature. Every website, every automation, every integration is crafted to grow
              with you — not just serve you today.
            </p>
            <div className="w-16 h-px bg-gold" />
            <p className="text-lg text-text-dark/70 leading-relaxed">
              We want your experience working with us to feel effortless — personal,
              transparent, and with no unnecessary complexity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
