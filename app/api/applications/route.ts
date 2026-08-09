import { NextRequest, NextResponse } from 'next/server';
import { connectDB, isMockDB } from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';
import { getUserFromRequest } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Please log in to apply for this job' }, { status: 401 });
    }

    await connectDB();
    const { jobId, coverLetter, resumeUrl } = await req.json();

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
    }

    if (isMockDB()) {
      const existing = mockStore.applications.find((a) => a.jobId === jobId && a.applicantId === user.userId);
      if (existing) {
        return NextResponse.json({ success: false, error: 'You have already applied for this job!' }, { status: 400 });
      }

      const newApp = {
        _id: 'app_' + Date.now(),
        jobId,
        applicantId: user.userId,
        applicantName: user.name,
        applicantEmail: user.email,
        coverLetter: coverLetter || '',
        resumeUrl: resumeUrl || '',
        status: 'Applied',
        createdAt: new Date().toISOString(),
      };

      mockStore.applications.unshift(newApp as any);

      // Increment job applicant count
      const targetJob = mockStore.jobs.find((j) => j._id === jobId || j.id === jobId);
      if (targetJob) targetJob.applicantCount += 1;

      return NextResponse.json({ success: true, application: newApp }, { status: 201 });
    }

    const existingApp = await Application.findOne({ jobId, applicantId: user.userId });
    if (existingApp) {
      return NextResponse.json({ success: false, error: 'You have already applied for this job!' }, { status: 400 });
    }

    const newApp = await Application.create({
      jobId,
      applicantId: user.userId,
      applicantName: user.name,
      applicantEmail: user.email,
      coverLetter: coverLetter || '',
      resumeUrl: resumeUrl || '',
    });

    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    return NextResponse.json({ success: true, application: newApp }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (isMockDB()) {
      let filtered = [...mockStore.applications];
      if (jobId) {
        filtered = filtered.filter((a) => a.jobId === jobId);
      } else {
      let applicationsList: any[] = filtered.filter((a) => a.applicantId === user.userId);
      applicationsList = applicationsList.map((app) => {
        const job = mockStore.jobs.find((j) => j._id === app.jobId || j.id === app.jobId);
        return { ...app, jobId: job || app.jobId };
      });
      return NextResponse.json({ success: true, count: applicationsList.length, applications: applicationsList });
      }

      return NextResponse.json({ success: true, count: filtered.length, applications: filtered });
    }

    let applications;
    if (jobId) {
      applications = await Application.find({ jobId }).sort({ createdAt: -1 });
    } else {
      applications = await Application.find({ applicantId: user.userId }).populate('jobId').sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, count: applications.length, applications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
