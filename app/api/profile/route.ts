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
    const {
      name,
      title,
      company,
      bio,
      skills,
      resumeUrl,
      phone,
      location,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      twitterUrl,
      targetRole,
      expectedSalary,
      experienceYears,
      availability,
      workPreference,
      experience,
      education,
      projects,
      atsScore,
    } = body;

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
        ...(phone !== undefined ? { phone } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(githubUrl !== undefined ? { githubUrl } : {}),
        ...(linkedinUrl !== undefined ? { linkedinUrl } : {}),
        ...(portfolioUrl !== undefined ? { portfolioUrl } : {}),
        ...(twitterUrl !== undefined ? { twitterUrl } : {}),
        ...(targetRole !== undefined ? { targetRole } : {}),
        ...(expectedSalary !== undefined ? { expectedSalary } : {}),
        ...(experienceYears !== undefined ? { experienceYears } : {}),
        ...(availability !== undefined ? { availability } : {}),
        ...(workPreference !== undefined ? { workPreference } : {}),
        ...(experience !== undefined ? { experience } : {}),
        ...(education !== undefined ? { education } : {}),
        ...(projects !== undefined ? { projects } : {}),
        ...(atsScore !== undefined ? { atsScore } : {}),
      };
      mockStore.users[userIndex] = updated as any;

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
    if (phone !== undefined) updates.phone = phone;
    if (location !== undefined) updates.location = location;
    if (githubUrl !== undefined) updates.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) updates.linkedinUrl = linkedinUrl;
    if (portfolioUrl !== undefined) updates.portfolioUrl = portfolioUrl;
    if (twitterUrl !== undefined) updates.twitterUrl = twitterUrl;
    if (targetRole !== undefined) updates.targetRole = targetRole;
    if (expectedSalary !== undefined) updates.expectedSalary = expectedSalary;
    if (experienceYears !== undefined) updates.experienceYears = experienceYears;
    if (availability !== undefined) updates.availability = availability;
    if (workPreference !== undefined) updates.workPreference = workPreference;
    if (experience !== undefined) updates.experience = experience;
    if (education !== undefined) updates.education = education;
    if (projects !== undefined) updates.projects = projects;
    if (atsScore !== undefined) updates.atsScore = atsScore;

    const updatedUser = await User.findByIdAndUpdate(authUser.userId, updates, { returnDocument: 'after' }).select('-password');
    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
