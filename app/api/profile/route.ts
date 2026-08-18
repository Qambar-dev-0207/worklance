import { NextRequest, NextResponse } from 'next/server';
import { connectDB, isMockDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';

export async function GET(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    if (isMockDB()) {
      const user = mockStore.users.find((u) => u._id === authUser.userId || (u as any).id === authUser.userId);
      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }
      const { password, ...safeUser } = user;
      return NextResponse.json({ success: true, user: safeUser });
    }

    const user = await User.findById(authUser.userId).select('-password');
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { name, title, company, bio, skills, resumeUrl } = body;

    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
      ? skills.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    if (isMockDB()) {
      const userIndex = mockStore.users.findIndex(
        (u) => u._id === authUser.userId || (u as any).id === authUser.userId
      );
      if (userIndex === -1) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      const existing = mockStore.users[userIndex];
      const updated = {
        ...existing,
        ...(name ? { name } : {}),
        ...(title !== undefined ? { title } : {}),
        ...(company !== undefined ? { company } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(parsedSkills !== undefined ? { skills: parsedSkills } : {}),
        ...(resumeUrl !== undefined ? { resumeUrl } : {}),
      };
      mockStore.users[userIndex] = updated;

      const { password, ...safeUser } = updated;
      return NextResponse.json({ success: true, user: safeUser });
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (title !== undefined) updates.title = title;
    if (company !== undefined) updates.company = company;
    if (bio !== undefined) updates.bio = bio;
    if (parsedSkills !== undefined) updates.skills = parsedSkills;
    if (resumeUrl !== undefined) updates.resumeUrl = resumeUrl;

    const updatedUser = await User.findByIdAndUpdate(authUser.userId, updates, { returnDocument: 'after' }).select('-password');
    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
