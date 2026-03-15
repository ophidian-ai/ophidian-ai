"use client"

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const SQRT_5000 = Math.sqrt(5000);

const testimonials = [
  { tempId: 0, testimonial: "OphidianAI rebuilt our website in under two weeks. The result was completely different from anything I'd seen in our industry.", by: "Sarah M., Owner at Westside Wellness", imgSrc: "https://i.pravatar.cc/150?img=1" },
  { tempId: 1, testimonial: "I was skeptical about AI-built websites until I saw the work. Eric delivered something that looked like it cost three times what we paid.", by: "James R., Operations at Ridge Line Services", imgSrc: "https://i.pravatar.cc/150?img=2" },
  { tempId: 2, testimonial: "The automation workflow they built saves about 6 hours a week. That's time I actually get back now.", by: "Emily C., Marketing Director at Elevate Commerce", imgSrc: "https://i.pravatar.cc/150?img=3" },
  { tempId: 3, testimonial: "OphidianAI's approach to web design is unlike anything else. They actually understand what small businesses need.", by: "Marie L., CFO at FuturePlanning", imgSrc: "https://i.pravatar.cc/150?img=4" },
  { tempId: 4, testimonial: "If I could give 11 stars, I'd give 12.", by: "Andre K., Head of Design at CreativeSolutions", imgSrc: "https://i.pravatar.cc/150?img=5" },
  { tempId: 5, testimonial: "SO HAPPY WE FOUND YOU GUYS! I'd bet you've saved me 100 hours so far.", by: "Jeremy P., Product Manager at TimeWise", imgSrc: "https://i.pravatar.cc/150?img=6" },
  { tempId: 6, testimonial: "Took some convincing, but now that we're working with OphidianAI, we're never going back.", by: "Pam W., Marketing Director at BrandBuilders", imgSrc: "https://i.pravatar.cc/150?img=7" },
  { tempId: 7, testimonial: "The ROI from our new website is EASILY 100X. We went from invisible to first page of Google.", by: "Daniel S., Owner at AnalyticsPro", imgSrc: "https://i.pravatar.cc/150?img=8" },
  { tempId: 8, testimonial: "It's just the best. Period.", by: "Fernando G., UX Designer at UserFirst", imgSrc: "https://i.pravatar.cc/150?img=9" },
  { tempId: 9, testimonial: "I switched 5 years ago and never looked back.", by: "Andy T., DevOps Engineer at CloudMasters", imgSrc: "https://i.pravatar.cc/150?img=10" },
  { tempId: 10, testimonial: "I've been searching for an agency like OphidianAI for YEARS. So glad I finally found one!", by: "Pete V., Sales Director at RevenueRockets", imgSrc: "https://i.pravatar.cc/150?img=11" },
  { tempId: 11, testimonial: "It's so simple working with them. They understood our vision in 10 minutes.", by: "Marina K., HR Manager at TalentForge", imgSrc: "https://i.pravatar.cc/150?img=12" },
];

interface TestimonialCardProps {
  position: number;
  testimonial: typeof testimonials[0];
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ position, testimonial, handleMove, cardSize }) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out",
        isCenter
          ? "z-10 bg-venom text-forest-deep border-venom"
          : "z-0 bg-forest-deep text-text-light border-border-subtle hover:border-venom/50"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `translate(-50%, -50%) translateX(${(cardSize / 1.5) * position}px) translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px) rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)`,
        boxShadow: isCenter ? "0px 8px 0px 4px rgba(255,255,255,0.1)" : "0px 0px 0px 0px transparent"
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-border-subtle"
        style={{ right: -2, top: 48, width: SQRT_5000, height: 2 }}
      />
      <img
        src={testimonial.imgSrc}
        alt={`${testimonial.by.split(',')[0]}`}
        className="mb-4 h-14 w-12 bg-forest object-cover object-top"
        style={{ boxShadow: "3px 3px 0px var(--color-forest)" }}
      />
      <h3 className={cn("text-base sm:text-xl font-medium", isCenter ? "text-forest-deep" : "text-text-light")}>
        &ldquo;{testimonial.testimonial}&rdquo;
      </h3>
      <p className={cn("absolute bottom-8 left-8 right-8 mt-2 text-sm italic", isCenter ? "text-forest-deep/80" : "text-text-muted")}>
        - {testimonial.by}
      </p>
    </div>
  );
};

export const StaggerTestimonials: React.FC = () => {
  const [cardSize, setCardSize] = useState(365);
  const [testimonialsList, setTestimonialsList] = useState(testimonials);

  const handleMove = (steps: number) => {
    const newList = [...testimonialsList];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setTestimonialsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 290);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 600 }}>
      {testimonialsList.map((testimonial, index) => {
        const position = testimonialsList.length % 2
          ? index - (testimonialsList.length + 1) / 2
          : index - testimonialsList.length / 2;
        return (
          <TestimonialCard key={testimonial.tempId} testimonial={testimonial} handleMove={handleMove} position={position} cardSize={cardSize} />
        );
      })}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button onClick={() => handleMove(-1)} className="flex h-14 w-14 items-center justify-center text-2xl transition-colors bg-forest border-2 border-border-subtle hover:bg-venom hover:text-forest-deep" aria-label="Previous testimonial">
          <ChevronLeft />
        </button>
        <button onClick={() => handleMove(1)} className="flex h-14 w-14 items-center justify-center text-2xl transition-colors bg-forest border-2 border-border-subtle hover:bg-venom hover:text-forest-deep" aria-label="Next testimonial">
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};
