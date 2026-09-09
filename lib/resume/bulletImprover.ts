import { analyzeBulletVerb, POWER_VERBS, WEAK_VERB_MAP } from './verbEngine';
import { detectMetrics } from './metricEngine';

export interface ImprovedBulletResult {
  original: string;
  improved: string;
  powerVerb: string;
  action: string;
  technologies: string[];
  impact: string;
  hasMetric: boolean;
  metricSuggestion?: string;
  alternatives: string[];
}

const COMMON_TECH_TOKENS = [
  'Python', 'SQL', 'R', 'Java', 'C++', 'JavaScript', 'TypeScript', 'React', 'Next.js',
  'Tableau', 'Power BI', 'Excel', 'Looker', 'Alteryx', 'Hadoop', 'Spark', 'Databricks',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server', 'Snowflake',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub', 'Airflow',
  'Machine Learning', 'Random Forest', 'XGBoost', 'TensorFlow', 'PyTorch', 'NLP', 'Scikit-learn',
  'SharePoint', 'Power Automate', 'PowerApps', 'DAX', 'REST API', 'GraphQL', 'Kafka',
];

export function extractTechnologies(text: string): string[] {
  const found: string[] = [];
  COMMON_TECH_TOKENS.forEach((t) => {
    const regex = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      found.push(t);
    }
  });
  return found;
}

export function improveBulletPoint(rawText: string, contextRole?: string): ImprovedBulletResult {
  let text = rawText.trim().replace(/^[•\-\*\d.]+\s*/, '');
  if (!text) {
    return {
      original: rawText,
      improved: 'Architected and deployed scalable production workflows, improving operational throughput.',
      powerVerb: 'Architected',
      action: 'deployed scalable production workflows',
      technologies: [],
      impact: 'improving operational throughput',
      hasMetric: false,
      metricSuggestion: 'Add a metric: e.g. "by 35%", "for 100K+ records", or "saving 12 hours weekly".',
      alternatives: [],
    };
  }

  const metricAnalysis = detectMetrics(text);
  const techFound = extractTechnologies(text);
  const verbAnalysis = analyzeBulletVerb(text);

  let cleanedText = text;

  // 1. Remove filler weak phrases
  for (const [weak, rep] of Object.entries(WEAK_VERB_MAP)) {
    const reg = new RegExp(`^${weak}\\s*`, 'i');
    if (reg.test(cleanedText)) {
      cleanedText = cleanedText.replace(reg, `${rep} `);
      break;
    }
  }

  // 2. Remove filler words like "basically", "successfully", "duties included", "in order to"
  cleanedText = cleanedText
    .replace(/\b(basically|literally|duties included|was tasked to|in order to)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // 3. Ensure sentence starts with a capital power verb
  const firstWordMatch = cleanedText.match(/^([A-Za-z]+)/);
  let leadingVerb = firstWordMatch ? firstWordMatch[1] : 'Developed';

  if (!POWER_VERBS.some((v) => v.toLowerCase() === leadingVerb.toLowerCase())) {
    const chosenVerb = POWER_VERBS[Math.floor(Math.random() * 8)];
    // If it started with lowercase or weak word, transform it
    if (leadingVerb.endsWith('ed') || leadingVerb.endsWith('ing')) {
      cleanedText = `${chosenVerb} ${cleanedText.slice(leadingVerb.length).trim()}`;
      leadingVerb = chosenVerb;
    } else {
      cleanedText = `${chosenVerb} ${cleanedText.charAt(0).toLowerCase() + cleanedText.slice(1)}`;
      leadingVerb = chosenVerb;
    }
  } else {
    // Capitalize first letter
    cleanedText = cleanedText.charAt(0).toUpperCase() + cleanedText.slice(1);
    leadingVerb = cleanedText.match(/^([A-Za-z]+)/)?.[1] || leadingVerb;
  }

  // Ensure proper punctuation
  if (!cleanedText.endsWith('.')) {
    cleanedText += '.';
  }

  // Generate 2 strong alternatives
  const alt1Verb = POWER_VERBS[(POWER_VERBS.indexOf(leadingVerb as any) + 3) % POWER_VERBS.length] || 'Spearheaded';
  const alt2Verb = POWER_VERBS[(POWER_VERBS.indexOf(leadingVerb as any) + 7) % POWER_VERBS.length] || 'Architected';

  const bodyWithoutVerb = cleanedText.replace(/^([A-Za-z]+)\s*/, '');
  const alt1 = `${alt1Verb} ${bodyWithoutVerb}`;
  const alt2 = `${alt2Verb} ${bodyWithoutVerb}`;

  return {
    original: rawText,
    improved: cleanedText,
    powerVerb: leadingVerb,
    action: bodyWithoutVerb.split(',')[0] || bodyWithoutVerb,
    technologies: techFound,
    impact: bodyWithoutVerb.includes(',') ? bodyWithoutVerb.split(',').slice(1).join(',') : '',
    hasMetric: metricAnalysis.hasMetric,
    metricSuggestion: metricAnalysis.hasMetric
      ? undefined
      : '💡 Suggested quantification to add: % efficiency gained, revenue generated, records analyzed, or time saved.',
    alternatives: [alt1, alt2],
  };
}
