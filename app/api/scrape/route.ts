import { NextRequest, NextResponse } from 'next/server';
import { ScraperService } from '@/services/scraperService';
import { connectDB, isMockDB } from '@/lib/db';
import Job from '@/models/Job';
import HrContact from '@/models/HrContact';
import Hackathon from '@/models/Hackathon';
import { mockStore } from '@/lib/mockStore';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    let jobCount = 0;
    let hrCount = 0;
    let hackathonCount = 0;

    if (isMockDB()) {
      jobCount = mockStore.jobs.length;
      hrCount = mockStore.hrContacts.length;
      hackathonCount = mockStore.hackathons.length;
    } else {
      jobCount = await Job.countDocuments();
      hrCount = await HrContact.countDocuments();
      hackathonCount = await Hackathon.countDocuments();
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalJobs: jobCount,
        totalHrContacts: hrCount,
        totalHackathons: hackathonCount,
        supportedScrapers: ['jobs', 'hr', 'hackathons'],
        sources: [
          'Arbeitnow Global Developer Feed',
          'Verified Tech Recruiter Directory (Google, Razorpay, Microsoft, Zepto, Swiggy, Flipkart)',
          'Top Global Hackathons & Competitions',
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { type = 'jobs', keyword, location, company, city, industry, limit } = body;

    if (type === 'jobs') {
      const result = await ScraperService.scrapeJobs({ keyword, location, limit: Number(limit) || 8 });
      return NextResponse.json({
        ...result,
        message: `Successfully scraped ${result.scrapedCount} live developer jobs (${result.importedCount} new jobs imported)!`,
      });
    }

    if (type === 'hr') {
      const result = await ScraperService.scrapeHrProfiles({
        company,
        city,
        industry,
        limit: Number(limit) || 6,
      });
      return NextResponse.json({
        ...result,
        message: `Successfully scraped ${result.scrapedCount} verified recruiter profiles (${result.importedCount} new contacts added to directory)!`,
      });
    }

    if (type === 'hackathons') {
      const result = await ScraperService.scrapeHackathons({ limit: Number(limit) || 4 });
      return NextResponse.json({
        ...result,
        message: `Successfully scraped ${result.scrapedCount} live & upcoming hackathons (${result.importedCount} new events added)!`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid scrape type. Supported types: 'jobs', 'hr', 'hackathons'" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
