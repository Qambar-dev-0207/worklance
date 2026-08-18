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
      const targetJob = mockStore.jobs.find((j) => j._id === jobId || j.id === jobId);
      if (!targetJob) {
        return NextResponse.json({ success: false, error: 'Job posting not found' }, { status: 404 });
      }

      if (targetJob.postedBy === user.userId) {
        return NextResponse.json({ success: false, error: 'You cannot apply to your own job posting' }, { status: 400 });
      }

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
      targetJob.applicantCount = (targetJob.applicantCount || 0) + 1;

      return NextResponse.json({ success: true, application: newApp }, { status: 201 });
    }

    const targetJob = await Job.findById(jobId);
    if (!targetJob) {
      return NextResponse.json({ success: false, error: 'Job posting not found' }, { status: 404 });
    }

    if (targetJob.postedBy.toString() === user.userId) {
      return NextResponse.json({ success: false, error: 'You cannot apply to your own job posting' }, { status: 400 });
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
      status: 'Applied',
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
      if (jobId) {
        const targetJob = mockStore.jobs.find((j) => j._id === jobId || j.id === jobId);
        if (!targetJob) {
          return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
        }

        // Privacy check: only the job poster or admin can inspect all applicant details
        if (user.role !== 'admin' && targetJob.postedBy !== user.userId) {
          return NextResponse.json({ success: false, error: 'Forbidden: You do not own this job posting' }, { status: 403 });
        }

        const apps = mockStore.applications.filter((a) => a.jobId === jobId);
        return NextResponse.json({ success: true, count: apps.length, applications: apps });
      }

      // If recruiter, return applications for all jobs posted by this recruiter
      if (user.role === 'recruiter') {
        const myJobs = mockStore.jobs.filter((j) => j.postedBy === user.userId);
        const myJobIds = myJobs.map((j) => j._id || j.id);
        const apps = mockStore.applications
          .filter((a) => myJobIds.includes(a.jobId))
          .map((app) => {
            const job = mockStore.jobs.find((j) => j._id === app.jobId || j.id === app.jobId);
            return { ...app, jobId: job || app.jobId };
          });

        return NextResponse.json({ success: true, count: apps.length, applications: apps, isRecruiterPipeline: true });
      }

      // Default: seeker applications
      const apps = mockStore.applications
        .filter((a) => a.applicantId === user.userId)
        .map((app) => {
          const job = mockStore.jobs.find((j) => j._id === app.jobId || j.id === app.jobId);
          return { ...app, jobId: job || app.jobId };
        });

      return NextResponse.json({ success: true, count: apps.length, applications: apps });
    }

    if (jobId) {
      const targetJob = await Job.findById(jobId);
      if (!targetJob) {
        return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
      }

      if (user.role !== 'admin' && targetJob.postedBy.toString() !== user.userId) {
        return NextResponse.json({ success: false, error: 'Forbidden: You do not own this job posting' }, { status: 403 });
      }

      const applications = await Application.find({ jobId }).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, count: applications.length, applications });
    }

    if (user.role === 'recruiter') {
      const myJobs = await Job.find({ postedBy: user.userId }).select('_id');
      const myJobIds = myJobs.map((j) => j._id);
      const applications = await Application.find({ jobId: { $in: myJobIds } })
        .populate('jobId')
        .sort({ createdAt: -1 });

      return NextResponse.json({ success: true, count: applications.length, applications, isRecruiterPipeline: true });
    }

    const applications = await Application.find({ applicantId: user.userId })
      .populate('jobId')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, count: applications.length, applications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { applicationId, status } = await req.json();

    const validStatuses = ['Applied', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected'];
    if (!applicationId || !status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Valid applicationId and status (Applied, Shortlisted, Interviewing, Offered, Rejected) are required' },
        { status: 400 }
      );
    }

    if (isMockDB()) {
      const appIndex = mockStore.applications.findIndex((a) => a._id === applicationId);
      if (appIndex === -1) {
        return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
      }

      const targetApp = mockStore.applications[appIndex];
      const targetJob = mockStore.jobs.find((j) => j._id === targetApp.jobId || j.id === targetApp.jobId);

      // Verify caller is the recruiter who posted the job or admin
      if (user.role !== 'admin' && (!targetJob || targetJob.postedBy !== user.userId)) {
        return NextResponse.json({ success: false, error: 'Forbidden: You are not authorized to update this applicant status' }, { status: 403 });
      }

      mockStore.applications[appIndex].status = status;
      return NextResponse.json({ success: true, application: mockStore.applications[appIndex] });
    }

    const targetApp = await Application.findById(applicationId);
    if (!targetApp) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    const targetJob = await Job.findById(targetApp.jobId);
    if (user.role !== 'admin' && (!targetJob || targetJob.postedBy.toString() !== user.userId)) {
      return NextResponse.json({ success: false, error: 'Forbidden: You are not authorized to update this applicant status' }, { status: 403 });
    }

    targetApp.status = status;
    await targetApp.save();

    return NextResponse.json({ success: true, application: targetApp });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get('id');

    if (!applicationId) {
      return NextResponse.json({ success: false, error: 'Application ID is required' }, { status: 400 });
    }

    if (isMockDB()) {
      const appIndex = mockStore.applications.findIndex(
        (a) => a._id === applicationId && (a.applicantId === user.userId || user.role === 'admin')
      );
      if (appIndex === -1) {
        return NextResponse.json({ success: false, error: 'Application not found or unauthorized' }, { status: 404 });
      }

      const targetApp = mockStore.applications[appIndex];
      const targetJob = mockStore.jobs.find((j) => j._id === targetApp.jobId || j.id === targetApp.jobId);
      if (targetJob && (targetJob.applicantCount || 0) > 0) {
        targetJob.applicantCount -= 1;
      }

      mockStore.applications.splice(appIndex, 1);
      return NextResponse.json({ success: true, message: 'Application withdrawn successfully' });
    }

    const app = await Application.findOne({
      _id: applicationId,
      ...(user.role !== 'admin' ? { applicantId: user.userId } : {}),
    });

    if (!app) {
      return NextResponse.json({ success: false, error: 'Application not found or unauthorized' }, { status: 404 });
    }

    await Application.findByIdAndDelete(applicationId);
    await Job.findByIdAndUpdate(app.jobId, { $inc: { applicantCount: -1 } });

    return NextResponse.json({ success: true, message: 'Application withdrawn successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

