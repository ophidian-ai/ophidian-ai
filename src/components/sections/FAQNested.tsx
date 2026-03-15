"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

const FAQ_GROUPS = [
  { title: "Services & Pricing", questions: [
    { q: "What services does OphidianAI offer?", a: "We build AI-powered websites, provide SEO services, manage social media, and develop custom AI integrations and automations for small businesses." },
    { q: "How much does a website cost?", a: "Website projects start at $2,500 and vary based on scope, features, and complexity. Every project begins with a free discovery conversation." },
    { q: "Do you offer monthly plans?", a: "Yes. SEO starts at $200/mo and social media management starts at $250/mo. We also offer website maintenance retainers." },
  ]},
  { title: "Process & Timeline", questions: [
    { q: "How long does a website project take?", a: "Most websites are delivered in 2-4 weeks. Complex projects with custom AI integrations may take longer." },
    { q: "What does the process look like?", a: "We follow a 6-step process: Discovery, Strategy, Design, Build, Launch, and Grow. You're involved at every stage." },
    { q: "Do I own my website when it's done?", a: "Yes. You own 100% of your code, content, domain, and assets. No lock-in, no proprietary systems." },
  ]},
  { title: "About OphidianAI", questions: [
    { q: "Where is OphidianAI located?", a: "We're based in Columbus, Indiana. We work with clients locally and remotely." },
    { q: "Who is behind OphidianAI?", a: "OphidianAI was founded by Eric Lefler. We use AI-assisted workflows to deliver enterprise-quality work at small business prices." },
    { q: "What makes you different from other agencies?", a: "We combine human creativity with AI efficiency. This means faster delivery, lower costs, and results that compete with agencies charging 5x more." },
  ]},
];

export function FAQNested() {
  const [openGroup, setOpenGroup] = useState<number | null>(0);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <section id="faq" className="bg-sage py-24 md:py-32">
      <div className="max-w-[1000px] mx-auto px-8">
        <h2 className="text-3xl md:text-5xl font-display text-text-dark mb-16">Before you start, you might want to know more.</h2>
        <div className="space-y-2">
          {FAQ_GROUPS.map((group, gi) => (
            <div key={group.title} className="border-b border-forest/10">
              <button onClick={() => setOpenGroup(openGroup === gi ? null : gi)} className="w-full flex items-center justify-between py-6 text-left">
                <h3 className="text-xl font-display text-text-dark">{group.title}</h3>
                {openGroup === gi ? <Minus className="w-5 h-5 text-text-dark/40" /> : <Plus className="w-5 h-5 text-text-dark/40" />}
              </button>
              <div className={cn("overflow-hidden transition-all duration-300", openGroup === gi ? "max-h-[2000px] pb-4" : "max-h-0")}>
                {group.questions.map((item) => {
                  const key = `${gi}-${item.q}`;
                  const isOpen = openQuestion === key;
                  return (
                    <div key={key} className="border-t border-forest/5">
                      <button onClick={() => setOpenQuestion(isOpen ? null : key)} className="w-full flex items-center justify-between py-4 pl-6 text-left">
                        <span className="text-text-dark/80">{item.q}</span>
                        <Plus className={cn("w-4 h-4 text-text-dark/30 transition-transform flex-shrink-0 ml-4", isOpen && "rotate-45")} />
                      </button>
                      <div className={cn("overflow-hidden transition-all duration-200", isOpen ? "max-h-[500px] pb-4" : "max-h-0")}>
                        <p className="pl-6 pr-12 text-text-dark/60 leading-relaxed">{item.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
