import type { Metadata } from 'next';
import { ChecklistContent } from './checklist-content';

export const metadata: Metadata = {
  title: 'Free Website Checklist for Small Businesses',
  description:
    'Is your website helping or hurting your business? Use this 20-point checklist to find out. Covers speed, SEO, mobile, security, and more.',
  openGraph: {
    title: 'Free Website Checklist for Small Businesses',
    description:
      'Is your website helping or hurting your business? 20-point checklist covering speed, SEO, mobile, security, and more.',
  },
};

export default function WebsiteChecklistPage() {
  return <ChecklistContent />;
}
