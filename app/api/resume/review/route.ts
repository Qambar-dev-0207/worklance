import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const POWER_VERBS = [
  'Achieved', 'Delivered', 'Researched', 'Improved', 'Managed',
  'Created', 'Streamlined', 'Implemented', 'Designed', 'Increased',
  'Reduced', 'Launched', 'Developed', 'Negotiated', 'Analyzed',
  'Trained', 'Facilitated', 'Revamped', 'Coordinated', 'Spearheaded',
  'Executed', 'Built', 'Solved', 'Led', 'Directed'
];

export async function POST(req: NextRequest) {
  try {
    const { fullName, targetTitle, email, phone, location, linkedIn, summary, experience, projects, skills, education } = await req.json();

    const skillList = typeof skills === 'string' ? skills.split(',').map((s) => s.trim()).filter(Boolean) : skills || [];
    
    let allBullets: string[] = [];
    if (Array.isArray(experience)) {
      experience.forEach((exp: any) => {
        if (Array.isArray(exp.points)) allBullets.push(...exp.points);
      });
    }
    if (Array.isArray(projects)) {
      projects.forEach((proj: any) => {
        if (proj.description) allBullets.push(proj.description);
      });
    }

    const totalBullets = Math.max(allBullets.length, 1);
    
    // Check Power Verbs
    const powerVerbBullets = allBullets.filter((b) => {
      const firstWord = (b.trim().split(/\s+/)[0] || '').toLowerCase();
      return POWER_VERBS.some((pv) => pv.toLowerCase() === firstWord);
    }).length;
    const powerVerbRatio = powerVerbBullets / totalBullets;

    // Check Metrics
    const metricRegex = /\b(\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?[KMBkmb]?|\d+x|\d+\+?\s*(?:users|clients|customers|requests|transactions|queries|days|weeks|months|engineers|members|hours|features|services)|#\d+|\b\d{2,}\b)/i;
    const metricBullets = allBullets.filter((b) => metricRegex.test(b)).length;
    const metricRatio = metricBullets / totalBullets;

    // Calculate score
    let score = 50;
    if (fullName && targetTitle) score += 10;
    if (email && phone && linkedIn) score += 10;
    if (summary && summary.length > 80) score += 10;
    if (skillList.length >= 8) score += 10;
    if (powerVerbRatio >= 0.7) score += 10;
    else if (powerVerbRatio >= 0.4) score += 5;
    if (metricRatio >= 0.6) score += 10;
    else if (metricRatio >= 0.3) score += 5;

    score = Math.min(Math.max(score, 45), 98);

    const suggestions: string[] = [];

    if (powerVerbRatio < 0.8) {
      suggestions.push(
        'Upgrade bullet starters with power action verbs (Spearheaded, Architected, Engineered, Streamlined, Launched, Solved).'
      );
    }

    if (metricRatio < 0.7) {
      suggestions.push(
        'Back achievements with numbers! Use the formula: [What you did] + [Why it mattered] + [What changed because of it] (e.g., "reduced latency by 35%", "scaled to 500k users").'
      );
    }

    if (!summary || summary.length < 80) {
      suggestions.push(
        'Target your Professional Summary directly to the role with key career achievements so recruiters are hooked within 6 seconds.'
      );
    }

    if (skillList.length < 8) {
      suggestions.push(
        'Expand technical skills to 8-12 industry-relevant keywords to ensure high algorithmic keyword matching in corporate ATS engines.'
      );
    }

    if (!linkedIn || !phone || !location) {
      suggestions.push(
        'Ensure verified LinkedIn URL, professional phone number, and location are prominently placed in the contact header.'
      );
    }

    if (suggestions.length === 0) {
      suggestions.push(
        'Outstanding resume structure! All bullets utilize power action verbs and quantifiable metrics.'
      );
    }

    return NextResponse.json({
      success: true,
      review: {
        score,
        rating: score >= 88 ? 'Elite ATS Ready (Top 5%)' : score >= 75 ? 'Good ATS Match' : 'Needs Optimization',
        keywordCount: skillList.length,
        powerVerbsUsed: powerVerbBullets,
        metricsCount: metricBullets,
        totalBullets,
        suggestions,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
