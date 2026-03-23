"use client";

import Image from "next/image";

const IMAGES = [
  { src: "/images/gallery/forest-mist.jpg", width: 520, height: 416, alt: "Forest mist" },
  { src: "/images/gallery/ferns.jpg", width: 300, height: 474, alt: "Ferns" },
  { src: "/images/gallery/mountains.jpg", width: 520, height: 362, alt: "Mountains" },
  { src: "/images/gallery/moss.jpg", width: 300, height: 300, alt: "Moss texture" },
  { src: "/images/gallery/snake.jpg", width: 410, height: 628, alt: "Serpent" },
  { src: "/images/gallery/marble.jpg", width: 300, height: 416, alt: "Marble" },
  { src: "/images/gallery/fjord.jpg", width: 520, height: 362, alt: "Fjord" },
  { src: "/images/gallery/bark.jpg", width: 300, height: 350, alt: "Bark texture" },
  { src: "/images/gallery/leaves.jpg", width: 410, height: 588, alt: "Leaves" },
];

export function ImageCarousel() {
  const doubled = [...IMAGES, ...IMAGES];

  return (
    <section className="relative py-16 overflow-hidden">
      <div className="group relative">
        <div className="flex gap-4 animate-scroll-x group-hover:[animation-play-state:paused]">
          {doubled.map((img, i) => (
            <div
              key={i}
              className="flex-shrink-0 overflow-hidden rounded-lg"
              style={{ width: Math.round(img.width / 2.2), height: Math.round(img.height / 2.2) }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-4xl mx-auto text-center mt-12 sm:mt-24 px-4 sm:px-8">
        <p className="text-xl sm:text-2xl md:text-4xl font-display italic" style={{ color: "var(--color-on-surface-variant)" }}>
          So that your business thrives at every stage.
        </p>
      </div>
    </section>
  );
}
