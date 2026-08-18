import { NextRequest, NextResponse } from 'next/server';
import { connectDB, isMockDB } from '@/lib/db';
import Hackathon from '@/models/Hackathon';
import { getUserFromRequest } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const body = await req.json();
    const { hackathonId, teamName, members, projectIdea } = body;

    if (!hackathonId || !teamName) {
      return NextResponse.json(
        { success: false, error: 'Hackathon ID and Team Name are required' },
        { status: 400 }
      );
    }

    await connectDB();

    if (isMockDB()) {
      const hackathon = mockStore.hackathons.find(
        (h) => h._id === hackathonId || (h as any).id === hackathonId
      );

      if (!hackathon) {
        return NextResponse.json({ success: false, error: 'Hackathon not found' }, { status: 404 });
      }

      hackathon.participantsCount = (hackathon.participantsCount || 0) + (members ? members.split(',').length + 1 : 1);
      hackathon.teamsCount = (hackathon.teamsCount || 0) + 1;

      return NextResponse.json({
        success: true,
        message: 'Team successfully registered for hackathon!',
        registration: {
          hackathonId,
          teamName,
          leader: user ? user.name : 'Candidate',
          members: members || '',
          registeredAt: new Date().toISOString(),
        },
      });
    }

    const updated = await Hackathon.findByIdAndUpdate(
      hackathonId,
      {
        $inc: {
          teamsCount: 1,
          participantsCount: members ? members.split(',').length + 1 : 1,
        },
      },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Hackathon not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Team successfully registered for hackathon!',
      hackathon: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
