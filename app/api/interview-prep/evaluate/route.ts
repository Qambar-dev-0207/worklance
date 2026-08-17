import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { questionId, questionText, round, answer, tags } = await req.json();

    if (!answer || answer.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please provide a more detailed response to evaluate.' },
        { status: 400 }
      );
    }

    const lowerAns = answer.toLowerCase();
    const tagList: string[] = tags || [];
    
    // Check keywords matching
    const matchedTags = tagList.filter((t) => lowerAns.includes(t.toLowerCase()));
    const matchRatio = tagList.length > 0 ? matchedTags.length / tagList.length : 0.6;

    // Calculate score
    let baseScore = Math.floor(60 + matchRatio * 30 + Math.min(answer.length / 25, 10));
    baseScore = Math.min(Math.max(baseScore, 55), 98);

    // Formulate constructive suggestions
    const missingTags = tagList.filter((t) => !lowerAns.includes(t.toLowerCase()));
    let advice = '';
    
    if (round === 'HR Round' || round === 'Behavioral') {
      const hasStar = lowerAns.includes('situation') || lowerAns.includes('result') || lowerAns.includes('team') || lowerAns.includes('learned');
      advice = hasStar
        ? 'Great behavioral structure! You demonstrated clear context and outcome.'
        : 'Tip: Consider formatting your behavioral answers with the STAR method (Situation, Task, Action, Result) for maximum recruiter impact.';
    } else if (round === 'System Design') {
      const hasScalability = lowerAns.includes('cache') || lowerAns.includes('latency') || lowerAns.includes('scale') || lowerAns.includes('redis');
      advice = hasScalability
        ? 'Strong architectural considerations regarding caching and throughput.'
        : 'Tip: Mention trade-offs (CAP theorem, caching layer with Redis, database sharding) to elevate this to a Senior/Lead response.';
    } else {
      advice = missingTags.length > 0
        ? `Consider incorporating key domain concepts: ${missingTags.slice(0, 3).join(', ')}.`
        : 'Solid technical depth and accurate terminology.';
    }

    return NextResponse.json({
      success: true,
      evaluation: {
        score: baseScore,
        matchedKeywords: matchedTags,
        missingKeywords: missingTags,
        feedback: `Score: ${baseScore}% — ${advice}`,
        tips: 'Keep practicing! Concise delivery with quantifiable achievements gives the strongest impression in interviews.',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
