"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const TABS = [
  { label: "Websites", title: "AI-Powered Website", price: "From $2,500", features: ["Custom design tailored to your brand", "Mobile-first responsive development", "SEO foundation and analytics setup", "Content management system", "Performance optimization", "30 days post-launch support"] },
  { label: "SEO", title: "SEO Services", price: "From $200/mo", features: ["Technical SEO audit and fixes", "On-page optimization", "Google Business Profile setup", "Monthly performance reports", "Keyword research and strategy", "Local SEO optimization"] },
  { label: "Social Media", title: "Social Media Management", price: "From $250/mo", features: ["Content calendar and strategy", "AI-assisted post creation", "Multi-platform publishing", "Community management", "Monthly analytics reports", "Brand voice development"] },
  { label: "AI Services", title: "AI Integrations", price: "Custom", features: ["Workflow automation design", "Chatbot and voice agent setup", "CRM integration", "Custom AI tool development", "Training and documentation", "Ongoing maintenance and updates"] },
];

export function PricingTabs() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="pricing" className="bg-sage py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-8">
        <h2 className="text-3xl md:text-5xl font-display text-text-dark mb-4">Invest in your growth</h2>
        <p className="text-lg text-text-dark/60 mb-16 max-w-2xl">Clear, transparent pricing. Every project starts with a discovery conversation to understand your needs and define the right scope.</p>
        <div className="flex flex-wrap gap-2 mb-12">
          {TABS.map((tab, i) => (
            <button key={tab.label} onClick={() => setActiveTab(i)} className={cn("px-6 py-2.5 rounded-full text-sm font-medium transition-colors", i === activeTab ? "bg-forest text-text-light" : "bg-forest/10 text-text-dark hover:bg-forest/20")}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="bg-sage-light rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div>
              <h3 className="text-2xl font-display text-text-dark mb-2">{TABS[activeTab].title}</h3>
              <p className="text-3xl font-semibold text-venom">{TABS[activeTab].price}</p>
            </div>
          </div>
          <ul className="mt-8 space-y-4">
            {TABS[activeTab].features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-text-dark/80">
                <Check className="w-5 h-5 text-venom flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-text-dark/50 mt-8 text-center">Prices vary depending on scope and complexity.</p>
      </div>
    </section>
  );
}
