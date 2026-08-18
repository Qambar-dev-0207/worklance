import { NextRequest, NextResponse } from 'next/server';
import { JobService } from '@/services/jobService';
import { getUserFromRequest, isRecruiterOrAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword') || undefined;
    const location = searchParams.get('location') || undefined;
    const type = searchParams.get('type') || undefined;
    const postedBy = searchParams.get('postedBy') || undefined;

    const jobs = await JobService.getJobs({ keyword, location, type, postedBy });
    return NextResponse.json({ success: true, count: jobs.length, jobs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please login to post a job.' }, { status: 401 });
    }

    if (!isRecruiterOrAdmin(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Only recruiters and talent acquisition leads are authorized to post jobs.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      company,
      companyAbout,
      companyIndustry,
      companySize,
      companyWebsite,
      location,
      type,
      salary,
      description,
      responsibilities,
      requirements,
      benefits,
      tags,
    } = body;

    if (!title || !company || !location || !salary || !description) {
      return NextResponse.json({ success: false, error: 'Missing required job fields' }, { status: 400 });
    }

    const newJob = await JobService.createJob({
      title,
      company,
      companyAbout,
      companyIndustry,
      companySize,
      companyWebsite,
      location,
      type,
      salary,
      description,
      responsibilities,
      requirements,
      benefits,
      tags,
      postedBy: user.userId,
    });

    return NextResponse.json({ success: true, job: newJob }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
