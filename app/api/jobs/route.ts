import { NextRequest, NextResponse } from 'next/server';
import { JobService } from '@/services/jobService';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword') || undefined;
    const location = searchParams.get('location') || undefined;
    const type = searchParams.get('type') || undefined;

    const jobs = await JobService.getJobs({ keyword, location, type });
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

    const body = await req.json();
    const { title, company, location, type, salary, description, requirements, tags } = body;

    if (!title || !company || !location || !salary || !description) {
      return NextResponse.json({ success: false, error: 'Missing required job fields' }, { status: 400 });
    }

    const newJob = await JobService.createJob({
      title,
      company,
      location,
      type,
      salary,
      description,
      requirements,
      tags,
      postedBy: user.userId,
    });

    return NextResponse.json({ success: true, job: newJob }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
