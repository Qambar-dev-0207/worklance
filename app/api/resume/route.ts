import { NextRequest, NextResponse } from 'next/server';
import { connectDB, isMockDB } from '@/lib/db';
import User from '@/models/User';
import Resume from '@/models/Resume';
import { getUserFromRequest } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';

export async function GET(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    await connectDB();

    if (isMockDB()) {
      const mockUser = mockStore.users.find(
        (u) => u._id === authUser.userId || (u as any).id === authUser.userId
      );
      const resume = (mockUser as any)?.resumeData || null;
      return NextResponse.json({
        success: true,
        resume,
        source: 'mock',
      });
    }

    // 1. Fetch current active resume from Resume collection
    let activeResume = await Resume.findOne({
      userId: authUser.userId,
      isCurrent: true,
    }).sort({ updatedAt: -1 });

    // 2. Fallback to any recent resume for this user if no current flag
    if (!activeResume) {
      activeResume = await Resume.findOne({ userId: authUser.userId }).sort({ updatedAt: -1 });
    }

    // 3. Fallback to resumeData stored directly on User document
    if (!activeResume) {
      const user = await User.findById(authUser.userId).select('resumeData activeResumeId name email');
      if (user && user.resumeData) {
        return NextResponse.json({
          success: true,
          resume: {
            id: user.activeResumeId || 'user-profile-resume',
            userId: user._id,
            title: user.resumeData?.personal?.targetTitle || 'My Resume',
            resumeData: user.resumeData,
            source: 'builder',
            isCurrent: true,
            updatedAt: new Date(),
          },
        });
      }
      return NextResponse.json({ success: true, resume: null });
    }

    return NextResponse.json({
      success: true,
      resume: activeResume,
    });
  } catch (error: any) {
    console.error('Error fetching resume from database:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in to save your resume to the database.' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const { resumeData, title, source = 'builder', fileName = '', rawText = '', atsScore } = body;

    if (!resumeData || typeof resumeData !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Valid resumeData object is required to save resume.' },
        { status: 400 }
      );
    }

    const calculatedTitle =
      title ||
      resumeData.personal?.targetTitle ||
      `${resumeData.personal?.fullName || 'User'}'s Resume`;

    const scoreNum = typeof atsScore === 'number' ? atsScore : (resumeData as any)?.atsScore || 85;

    if (isMockDB()) {
      // In-memory fallback for local dev
      const userIndex = mockStore.users.findIndex(
        (u) => u._id === authUser.userId || (u as any).id === authUser.userId
      );
      if (userIndex !== -1) {
        (mockStore.users[userIndex] as any).resumeData = resumeData;
      }
      return NextResponse.json({
        success: true,
        message: 'Resume saved to in-memory store',
        resume: {
          _id: 'res_' + Date.now(),
          userId: authUser.userId,
          title: calculatedTitle,
          resumeData,
          source,
          fileName,
          rawText,
          atsScore: scoreNum,
          isCurrent: true,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    // Mark previous current resumes as non-current if creating/updating active
    await Resume.updateMany({ userId: authUser.userId, isCurrent: true }, { $set: { isCurrent: false } });

    // Check if a resume with this same title/source exists to update, or create a new document
    let savedResume = await Resume.findOneAndUpdate(
      { userId: authUser.userId, source },
      {
        $set: {
          title: calculatedTitle,
          resumeData,
          source,
          fileName: fileName || undefined,
          rawText: rawText || undefined,
          atsScore: scoreNum,
          isCurrent: true,
          updatedAt: new Date(),
        },
        $inc: { version: 1 },
      },
      { returnDocument: 'after', upsert: true }
    );

    // Format skills list for user profile
    const skillsList = (resumeData.skills || [])
      .map((s: any) => s.skillsList)
      .join(', ')
      .split(/[,|•]/)
      .map((s: string) => s.trim())
      .filter(Boolean);

    // Format experience for user profile
    const expList = (resumeData.experience || []).map((e: any) => ({
      company: e.company || '',
      role: e.role || '',
      location: e.location || '',
      startDate: e.startDate || '',
      endDate: e.endDate || '',
      current: e.current || false,
      description: (e.bullets || []).map((b: any) => b.text).join(' '),
    }));

    // Format education for user profile
    const eduList = (resumeData.education || []).map((e: any) => {
      const parts = (e.graduationDate || '').split(/[-–—]/);
      return {
        school: e.institution || '',
        degree: e.degree || '',
        grade: e.gpa || '',
        fieldOfStudy: e.coursework || '',
        startYear: parts[0]?.trim() || '',
        endYear: parts[1]?.trim() || e.graduationDate || '',
      };
    });

    // Format projects for user profile
    const projList = (resumeData.projects || []).map((p: any) => ({
      title: p.name || '',
      description: (p.bullets || []).map((b: any) => b.text).join(' '),
      liveUrl: p.link || '',
      techStack: p.tech ? p.tech.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    }));

    // Update User document with full structured resumeData and synchronized profile
    const userUpdates: any = {
      resumeData,
      activeResumeId: savedResume._id,
      atsScore: scoreNum,
    };

    if (resumeData.personal?.fullName) userUpdates.name = resumeData.personal.fullName;
    if (resumeData.personal?.targetTitle) userUpdates.title = resumeData.personal.targetTitle;
    if (resumeData.summary) userUpdates.bio = resumeData.summary;
    if (resumeData.personal?.phone) userUpdates.phone = resumeData.personal.phone;
    if (resumeData.personal?.location) userUpdates.location = resumeData.personal.location;
    if (resumeData.personal?.github) userUpdates.githubUrl = resumeData.personal.github;
    if (resumeData.personal?.linkedIn) userUpdates.linkedinUrl = resumeData.personal.linkedIn;
    if (resumeData.personal?.portfolio) userUpdates.portfolioUrl = resumeData.personal.portfolio;
    if (skillsList.length > 0) userUpdates.skills = skillsList;
    if (expList.length > 0) userUpdates.experience = expList;
    if (eduList.length > 0) userUpdates.education = eduList;
    if (projList.length > 0) userUpdates.projects = projList;

    const updatedUser = await User.findByIdAndUpdate(authUser.userId, { $set: userUpdates }, { returnDocument: 'after' }).select(
      '-password'
    );

    return NextResponse.json({
      success: true,
      message: source === 'upload' ? 'Uploaded resume saved to database successfully' : 'Updated resume saved to database successfully',
      resume: savedResume,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error saving resume to database:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
