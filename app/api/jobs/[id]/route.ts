import { NextRequest, NextResponse } from 'next/server';
import { JobService } from '@/services/jobService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const job = await JobService.getJobById(params.id);

    if (!job) {
      return NextResponse.json({ success: false, error: 'Job posting not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
