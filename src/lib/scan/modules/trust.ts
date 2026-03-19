import { ModuleResult, Finding, scoreToGrade } from '../types';

export async function analyzeTrust(url: string, html: string): Promise<ModuleResult> {
  const findings: Finding[] = [];
  const lower = html.toLowerCase();

  // 1. SSL check
  if (!url.startsWith('https://')) {
    findings.push({
      id: 'trust-no-ssl',
      module: 'trust',
      severity: 'critical',
      title: 'No SSL Certificate',
      description:
        'This site is served over HTTP, not HTTPS. Browsers flag it as "Not Secure," which erodes visitor trust and causes many users to leave before converting.',
      revenue_impact: 0,
      benchmark: 'All top-performing local business sites use HTTPS.',
      quick_win: true,
    });
  }

  // 2. Contact info visibility
  const phonePattern = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const addressPattern =
    /\b\d{1,5}\s+\w[\w\s]{2,}\b(street|st|avenue|ave|boulevard|blvd|road|rd|drive|dr|lane|ln|way|court|ct|place|pl|suite|ste)\b/i;
  const stateAbbr = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\s+\d{5}/;

  const hasPhone = phonePattern.test(html);
  const hasEmail = emailPattern.test(html);
  const hasAddress = addressPattern.test(html) || stateAbbr.test(html);

  if (!hasPhone && !hasEmail && !hasAddress) {
    findings.push({
      id: 'trust-no-contact-info',
      module: 'trust',
      severity: 'moderate',
      title: 'No Contact Information Visible',
      description:
        'No phone number, email address, or physical address was detected on this page. Visitors who cannot quickly find contact details are far less likely to reach out or trust the business.',
      revenue_impact: 0,
      benchmark: 'Most local business sites display a phone number or email prominently.',
      quick_win: false,
    });
  }

  // 3. Google Business Profile indicators
  const gbpPatterns = [
    /google\.com\/maps/i,
    /maps\.google\.com/i,
    /maps\.app\.goo\.gl/i,
    /goo\.gl\/maps/i,
    /data-.*maps/i,
    /<iframe[^>]+google\.com\/maps/i,
    /place_id=/i,
    /cid=\d/i,
  ];
  const hasGBP = gbpPatterns.some((pattern) => pattern.test(html));

  if (!hasGBP) {
    findings.push({
      id: 'trust-no-gbp',
      module: 'trust',
      severity: 'moderate',
      title: 'No Google Business Profile Link',
      description:
        'No link to a Google Business Profile or embedded Google Maps was found. Connecting the website to a GBP improves local search visibility and gives visitors an easy way to verify the business.',
      revenue_impact: 0,
      benchmark: 'Businesses with linked GBP profiles receive significantly more local search clicks.',
      quick_win: true,
    });
  }

  // 4. Social proof
  const socialProofKeywords = [
    'review',
    'testimonial',
    'rating',
    'stars',
    'rated',
    'feedback',
    'trust',
    'certified',
    'accredited',
    'award',
    'badge',
  ];
  const socialMediaPatterns = [
    /facebook\.com/i,
    /instagram\.com/i,
    /twitter\.com/i,
    /x\.com/i,
    /linkedin\.com/i,
    /youtube\.com/i,
    /tiktok\.com/i,
    /yelp\.com/i,
  ];

  const hasSocialProofKeyword = socialProofKeywords.some((kw) => lower.includes(kw));
  const hasSocialMediaLink = socialMediaPatterns.some((pattern) => pattern.test(html));

  if (!hasSocialProofKeyword && !hasSocialMediaLink) {
    findings.push({
      id: 'trust-no-social-proof',
      module: 'trust',
      severity: 'minor',
      title: 'No Social Proof on Website',
      description:
        'No reviews, testimonials, ratings, trust badges, or social media links were detected. Social proof is one of the strongest conversion drivers -- its absence leaves visitors with no external validation of the business.',
      revenue_impact: 0,
      benchmark: 'High-converting local business sites prominently feature customer reviews or social links.',
      quick_win: false,
    });
  }

  // Scoring
  const deductions: Record<string, number> = { critical: 25, moderate: 15, minor: 5 };
  const raw = findings.reduce((acc, f) => acc - deductions[f.severity], 100);
  const score = Math.max(0, raw);

  return {
    score,
    grade: scoreToGrade(score),
    status: 'ok',
    error: null,
    findings,
  };
}
