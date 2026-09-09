export interface MetricDetectionResult {
  hasMetric: boolean;
  detectedMetrics: string[];
  segments: { text: string; isMetric: boolean }[];
  suggestion?: string;
}

// Regex patterns to detect numbers, metrics, currency, percentages, scale
const METRIC_PATTERNS = [
  // Percentages: 45%, 96.5%, 30 percent
  /\b\d+(?:\.\d+)?%\b/gi,
  /\b\d+(?:\.\d+)?\s*(?:percent|percentage points?)\b/gi,

  // Currency: $20M, $20 Million, ₹50L, $2M, €100K, £10K
  /[$€£₹]\s*\d+(?:,\d+)*(?:\.\d+)?\s*(?:[KMBkmb]|million|billion|trillion|lakh|crore)?\b/gi,
  /\b\d+(?:,\d+)*(?:\.\d+)?\s*(?:dollars|usd|inr|eur)\b/gi,

  // Numbers with units/scale: 100,000 borrowers, 3.9M flight records, 25+ clients, 1.3M patients, 500k daily transactions
  /\b\d+(?:,\d+)*(?:\.\d+)?\s*[KMBkmb]?\+?\s*(?:users|clients|customers|borrowers|patients|records|transactions|accounts|queries|requests|subscribers|followers|downloads|students|engineers|teams|startups|datasets|dashboards|servers|nodes|microservices|pipelines|features|models|endpoints)\b/gi,

  // Multipliers: 2x, 10x, 3-fold
  /\b\d+(?:\.\d+)?x\b/gi,
  /\b\d+\s*-?\s*fold\b/gi,

  // Time & Latency: 45ms, 120ms, 15+ hours, 28 days, 3 weeks
  /\b\d+(?:\.\d+)?\s*(?:ms|milliseconds?|seconds?|mins?|minutes?|hours?|days?|weeks?|months?)\b/gi,

  // Specific high-impact indicators: 99.9% uptime, 96% accuracy, 45% efficiency
  /\b(?:accuracy|precision|recall|f1-score|latency|throughput|uptime|efficiency|cycle-time|sla)\s*(?:of|by|at)?\s*\d+(?:\.\d+)?%?\b/gi,

  // Standalone high numbers: 100,000 or 10,000+
  /\b\d{1,3}(?:,\d{3})+\+?\b/g,
];

export function detectMetrics(text: string): MetricDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      hasMetric: false,
      detectedMetrics: [],
      segments: [{ text: '', isMetric: false }],
      suggestion: '💡 Quantify this achievement with measurable evidence (%, $, time, volume).',
    };
  }

  const matches: { start: number; end: number; matchText: string }[] = [];

  for (const pattern of METRIC_PATTERNS) {
    // Clone regex with sticky/global flags
    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        matchText: match[0],
      });
    }
  }

  // Sort and eliminate overlaps
  matches.sort((a, b) => a.start - b.start);
  const nonOverlapping: { start: number; end: number; matchText: string }[] = [];
  let lastEnd = 0;

  for (const m of matches) {
    if (m.start >= lastEnd) {
      nonOverlapping.push(m);
      lastEnd = m.end;
    }
  }

  const detectedMetrics = nonOverlapping.map((m) => m.matchText.trim());
  const hasMetric = detectedMetrics.length > 0;

  // Build segments for live highlighting
  const segments: { text: string; isMetric: boolean }[] = [];
  let currentPos = 0;

  for (const m of nonOverlapping) {
    if (m.start > currentPos) {
      segments.push({
        text: text.slice(currentPos, m.start),
        isMetric: false,
      });
    }
    segments.push({
      text: text.slice(m.start, m.end),
      isMetric: true,
    });
    currentPos = m.end;
  }

  if (currentPos < text.length) {
    segments.push({
      text: text.slice(currentPos),
      isMetric: false,
    });
  }

  return {
    hasMetric,
    detectedMetrics,
    segments,
    suggestion: hasMetric
      ? undefined
      : '💡 Quantify this achievement: add numbers, %, revenue, time saved, accuracy, users, or volume.',
  };
}

export const METRIC_IDEAS_BY_DOMAIN: Record<string, string[]> = {
  general: [
    'Percentage improvement (e.g. +35% efficiency, 20% cost reduction)',
    'Scale or volume (e.g. 500K+ records, 100K daily requests)',
    'Time or cycle reduction (e.g. reduced delivery time from 4 weeks to 6 days)',
    'Financial impact (e.g. saved $120K annually, generated $2M pipeline)',
    'Accuracy / Quality metric (e.g. achieved 96% accuracy, 99.9% SLA)',
  ],
  engineering: [
    'Reduced API latency from 450ms to 85ms (81% decrease)',
    'Scaled architecture to support 1M+ active monthly users',
    'Reduced CI/CD build times by 40%, saving 12 developer hours weekly',
    'Achieved 99.95% service uptime across critical microservices',
  ],
  data: [
    'Processed and normalized 3.5M+ records using SQL ETL pipelines',
    'Delivered 18 executive KPI dashboards viewed by 40+ stakeholders',
    'Improved predictive accuracy from 82% to 94% using XGBoost',
    'Automated daily reporting, cutting analyst manual effort by 85%',
  ],
  business: [
    'Generated $1.8M in net new sales pipeline over 2 quarters',
    'Cut customer onboarding drop-off by 24% through workflow optimization',
    'Managed $450K department budget with zero cost overruns',
  ],
};
