export const POWER_VERBS = [
  'Achieved',
  'Analyzed',
  'Architected',
  'Automated',
  'Built',
  'Coordinated',
  'Created',
  'Delivered',
  'Deployed',
  'Designed',
  'Developed',
  'Directed',
  'Engineered',
  'Executed',
  'Facilitated',
  'Formulated',
  'Implemented',
  'Improved',
  'Increased',
  'Launched',
  'Led',
  'Negotiated',
  'Optimized',
  'Reduced',
  'Researched',
  'Resolved',
  'Scaled',
  'Spearheaded',
  'Streamlined',
  'Trained',
] as const;

export const WEAK_VERB_MAP: Record<string, string> = {
  'worked on': 'Architected and built',
  'worked with': 'Collaborated cross-functionally with',
  'helped with': 'Coordinated and accelerated',
  'helped': 'Collaborated to deliver',
  'was involved in': 'Spearheaded key initiatives across',
  'involved in': 'Engineered and launched',
  'responsible for managing': 'Directed and optimized',
  'responsible for': 'Directed and executed',
  'participated in': 'Collaborated on and delivered',
  'assisted with': 'Supported and streamlined',
  'assisted': 'Executed and facilitated',
  'handled': 'Managed and optimized',
  'did': 'Executed and delivered',
  'tasked with': 'Led the execution of',
  'contributed to': 'Engineered and scaled',
  'made': 'Designed and implemented',
  'looked after': 'Maintained high reliability for',
  'tested': 'Executed comprehensive automated testing for',
  'wrote': 'Authored and deployed production-grade',
  'maintained': 'Maintained 99.9% uptime and optimized performance of',
  'created dashboards': 'Developed executive KPI dashboards',
  'worked on machine learning models': 'Trained and deployed predictive machine learning models',
};

export interface VerbAnalysis {
  firstWord: string;
  isPowerVerb: boolean;
  isWeakStarter: boolean;
  replacementSuggestion?: string;
  matchedWeakPhrase?: string;
}

export function analyzeBulletVerb(text: string): VerbAnalysis {
  const cleaned = text.trim().replace(/^[•\-\*\d.]+\s*/, '');
  const lower = cleaned.toLowerCase();

  // Check weak phrase map
  for (const [weak, replacement] of Object.entries(WEAK_VERB_MAP)) {
    if (lower.startsWith(weak)) {
      return {
        firstWord: weak,
        isPowerVerb: false,
        isWeakStarter: true,
        matchedWeakPhrase: weak,
        replacementSuggestion: replacement,
      };
    }
  }

  const match = cleaned.match(/^([A-Za-z]+)/);
  if (!match) {
    return {
      firstWord: '',
      isPowerVerb: false,
      isWeakStarter: false,
    };
  }

  const firstWord = match[1];
  const isPower = POWER_VERBS.some((v) => v.toLowerCase() === firstWord.toLowerCase());

  return {
    firstWord,
    isPowerVerb: isPower,
    isWeakStarter: !isPower && (firstWord.toLowerCase() === 'worked' || firstWord.toLowerCase() === 'helped' || firstWord.toLowerCase() === 'was'),
    replacementSuggestion: isPower ? undefined : getAlternativeVerb(firstWord),
  };
}

export function detectRepetitiveVerbs(bullets: string[]): {
  hasRepetition: boolean;
  repeatedVerbs: { verb: string; count: number }[];
  warningMessage?: string;
} {
  const verbCounts: Record<string, number> = {};

  bullets.forEach((b) => {
    const analysis = analyzeBulletVerb(b);
    if (analysis.firstWord) {
      const v = analysis.firstWord.toLowerCase();
      verbCounts[v] = (verbCounts[v] || 0) + 1;
    }
  });

  const repeated: { verb: string; count: number }[] = [];
  for (const [v, count] of Object.entries(verbCounts)) {
    if (count >= 3 || (bullets.length <= 4 && count >= 2)) {
      const proper = v.charAt(0).toUpperCase() + v.slice(1);
      repeated.push({ verb: proper, count });
    }
  }

  if (repeated.length > 0) {
    const names = repeated.map((r) => `"${r.verb}" (${r.count}x)`).join(', ');
    return {
      hasRepetition: true,
      repeatedVerbs: repeated,
      warningMessage: `⚠ Repetitive bullet openings detected: ${names}. Diversify with verbs like Spearheaded, Architected, Automated, or Optimized.`,
    };
  }

  return {
    hasRepetition: false,
    repeatedVerbs: [],
  };
}

export function getAlternativeVerb(verb: string): string {
  const alternatives: Record<string, string[]> = {
    develop: ['Architected', 'Engineered', 'Built', 'Implemented', 'Authored'],
    create: ['Designed', 'Formulated', 'Pioneered', 'Initiated', 'Originated'],
    manage: ['Directed', 'Orchestrated', 'Guided', 'Spearheaded', 'Governed'],
    improve: ['Optimized', 'Streamlined', 'Elevated', 'Accelerated', 'Enhanced'],
    analyze: ['Investigated', 'Evaluated', 'Audited', 'Synthesized', 'Parsed'],
    help: ['Collaborated', 'Facilitated', 'Reinforced', 'Supported', 'Partnered'],
  };

  const vLower = verb.toLowerCase();
  for (const [k, list] of Object.entries(alternatives)) {
    if (vLower.startsWith(k)) {
      return list[Math.floor(Math.random() * list.length)];
    }
  }

  return POWER_VERBS[Math.floor(Math.random() * POWER_VERBS.length)];
}
