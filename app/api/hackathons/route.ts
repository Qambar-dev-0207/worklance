import { NextRequest, NextResponse } from 'next/server';
import { connectDB, isMockDB } from '@/lib/db';
import Hackathon from '@/models/Hackathon';
import { getUserFromRequest } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    if (isMockDB()) {
      let filtered = [...mockStore.hackathons];
      if (status && status !== 'All') {
        filtered = filtered.filter((h) => h.status === status);
      }
      return NextResponse.json({ success: true, count: filtered.length, hackathons: filtered });
    }

    const query: any = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    const hackathons = await Hackathon.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: hackathons.length, hackathons });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    if (isMockDB()) {
      const newHackathon = {
        _id: 'hack_' + Date.now(),
        title: body.title,
        organizer: body.organizer || user.name,
        organizerBadge: (body.organizer || user.name).slice(0, 2).toUpperCase(),
        description: body.description,
        prizePool: body.prizePool,
        status: body.status || 'Upcoming',
        teamSize: body.teamSize || 'Up to 4',
        tags: body.tags || [],
        duration: body.duration || '48 hrs',
        participantsCount: 0,
        teamsCount: 0,
        deadline: body.deadline || 'Registration Open',
        createdAt: new Date().toISOString(),
      };

      mockStore.hackathons.unshift(newHackathon as any);
      return NextResponse.json({ success: true, hackathon: newHackathon }, { status: 201 });
    }

    const newHackathon = await Hackathon.create({
      title: body.title,
      organizer: body.organizer || user.name,
      organizerBadge: (body.organizer || user.name).slice(0, 2).toUpperCase(),
      description: body.description,
      prizePool: body.prizePool,
      status: body.status || 'Upcoming',
      teamSize: body.teamSize || 'Up to 4',
      tags: body.tags || [],
      duration: body.duration || '48 hrs',
      deadline: body.deadline || 'Registration Open',
    });

    return NextResponse.json({ success: true, hackathon: newHackathon }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
