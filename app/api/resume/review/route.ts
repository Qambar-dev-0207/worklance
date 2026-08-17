import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { fullName, targetTitle, summary, experience, skills, education } = await req.json();

    if (!summary && !skills) {
      return NextResponse.json(
        { success: false, error: 'Summary or skills are required for review.' },
        { status: 400 }
      );
    }

    const skillList = typeof skills === 'string' ? skills.split(',').map((s) => s.trim()) : skills || [];
    const expCount = Array.isArray(experience) ? experience.length : 1;

    let score = 65;
    if (fullName && targetTitle) score += 10;
    if (summary && summary.length > 100) score += 10;
    if (skillList.length >= 8) score += 10;
    if (expCount >= 2) score += 5;

    score = Math.min(score, 98);

    const suggestions = [
      'Use high-impact action verbs (Architected, Engineered, Optimized, Spearheaded) at the beginning of each bullet point.',
      'Quantify your accomplishments with metrics (e.g. "improved latency by 35%", "scaled to 500k users").',
      'Ensure standard section headers (Professional Summary, Work Experience, Technical Skills, Education) for bot parser compatibility.',
    ];

    if (skillList.length < 6) {
      suggestions.push('Add more industry-relevant tools and frameworks to increase ATS keyword matching.');
    }

    return NextResponse.json({
      success: true,
      review: {
        score,
        rating: score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Optimization',
        keywordCount: skillList.length,
        suggestions,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
