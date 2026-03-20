import type { Metadata } from 'next';
import { WebsiteCheckup } from '@/components/scan/WebsiteCheckup';

export const metadata: Metadata = {
  title: 'Is Your Website Costing You Customers? | Free Website Checkup | OphidianAI',
  description:
    'Get a free website checkup in under 30 seconds. See your speed score, SEO grade, mobile performance, and exactly how much revenue your site is losing — with a step-by-step fix list.',
  keywords: [
    'free website checkup',
    'website score',
    'website performance audit',
    'free SEO audit',
    'website speed test',
    'is my website costing me customers',
    'website revenue leak',
    'mobile friendly test',
    'website grader',
  ],
  alternates: {
    canonical: '/tools/website-checkup',
  },
  openGraph: {
    title: 'Free Website Checkup — See Your Score in 30 Seconds',
    description:
      'Instantly see how your website scores on speed, SEO, mobile, and trust — and get a free report showing how to fix it.',
    url: 'https://ophidianai.com/tools/website-checkup',
  },
};

export default function WebsiteCheckupPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-start">
      <WebsiteCheckup />
    </main>
  );
}
