import { NextRequest, NextResponse } from 'next/server';
import { connectDB, isMockDB } from '@/lib/db';
import User from '@/models/User';
import Job from '@/models/Job';
import HrContact from '@/models/HrContact';
import Hackathon from '@/models/Hackathon';
import { mockStore } from '@/lib/mockStore';
import { isAdminUser } from '@/lib/auth';
import { scraperState, addScraperLog } from '@/lib/scraperState';

export async function GET(req: NextRequest) {
  try {
    // 1. STRICT SECURITY CHECK: Only Admin
    if (!isAdminUser(req)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      );
    }

    await connectDB();

    let jobCount = 0;
    let hrCount = 0;
    let hackathonCount = 0;
    let seekerCount = 0;
    let recruiterCount = 0;
    let adminCount = 0;

    if (isMockDB()) {
      jobCount = mockStore.jobs.length;
      hrCount = mockStore.hrContacts.length;
      hackathonCount = mockStore.hackathons.length;
      seekerCount = mockStore.users.filter((u) => u.role === 'seeker').length;
      recruiterCount = mockStore.users.filter((u) => u.role === 'recruiter').length;
      adminCount = mockStore.users.filter((u) => u.role === 'admin').length;
    } else {
      jobCount = await Job.countDocuments();
      hrCount = await HrContact.countDocuments();
      hackathonCount = await Hackathon.countDocuments();
      seekerCount = await User.countDocuments({ role: 'seeker' });
      recruiterCount = await User.countDocuments({ role: 'recruiter' });
      adminCount = await User.countDocuments({ role: 'admin' });
    }

    return NextResponse.json({
      success: true,
      data: {
        database: {
          isMock: isMockDB(),
          status: 'connected',
          target: isMockDB() ? 'In-Memory Mock Database' : 'Production MongoDB Atlas',
        },
        counts: {
          jobs: jobCount,
          hrContacts: hrCount,
          hackathons: hackathonCount,
          users: {
            total: seekerCount + recruiterCount + adminCount,
            seekers: seekerCount,
            recruiters: recruiterCount,
            admins: adminCount,
          },
        },
        scraper: {
          isEnabled: scraperState.isEnabled,
          lastRunAt: scraperState.lastRunAt,
          lastRunType: scraperState.lastRunType,
          lastResult: scraperState.lastResult,
          logs: scraperState.logs,
        },
        system: {
          nodeEnv: process.env.NODE_ENV || 'development',
          serverTime: new Date().toISOString(),
          uptimeSeconds: Math.floor(process.uptime()),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. STRICT SECURITY CHECK: Only Admin
    if (!isAdminUser(req)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      );
    }

    const { action, enabled } = await req.json().catch(() => ({}));

    if (action === 'toggle_scraper') {
      const newState = typeof enabled === 'boolean' ? enabled : !scraperState.isEnabled;
      scraperState.isEnabled = newState;
      addScraperLog(
        newState ? 'success' : 'warn',
        `Admin switched Scraper Engine to: ${newState ? 'ACTIVE (Enabled)' : 'PAUSED (Disabled)'}`
      );

      return NextResponse.json({
        success: true,
        message: `Scraper engine is now ${newState ? 'ACTIVE' : 'PAUSED'}.`,
        isEnabled: scraperState.isEnabled,
      });
    }

    if (action === 'clear_logs') {
      scraperState.logs = [
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toISOString(),
          type: 'info',
          message: 'Scraper logs cleared by Administrator.',
        },
      ];
      return NextResponse.json({ success: true, message: 'Logs cleared successfully.' });
    }

    return NextResponse.json({ success: false, error: 'Unknown administrative action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
