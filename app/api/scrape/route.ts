import { NextRequest, NextResponse } from 'next/server';
import { ScraperService } from '@/services/scraperService';
import { connectDB, isMockDB } from '@/lib/db';
import Job from '@/models/Job';
import HrContact from '@/models/HrContact';
import Hackathon from '@/models/Hackathon';
import { mockStore } from '@/lib/mockStore';
import { isAdminUser } from '@/lib/auth';
import { scraperState, addScraperLog } from '@/lib/scraperState';

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
      scraperState: {
        isEnabled: scraperState.isEnabled,
        lastRunAt: scraperState.lastRunAt,
        lastRunType: scraperState.lastRunType,
        lastResult: scraperState.lastResult,
        recentLogs: scraperState.logs.slice(0, 15),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. STRICT SECURITY GATE: Only Administrator or Admin API key holder
    if (!isAdminUser(req)) {
      addScraperLog('error', 'Blocked unauthorized scrape trigger attempt (403 Forbidden).');
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Administrator privileges required to execute platform scrapers.',
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { type = 'jobs', keyword, location, company, city, industry, limit } = body;

    // 2. CHECK IF SCRAPER ENGINE IS ACTIVATED BY ADMIN
    if (!scraperState.isEnabled) {
      addScraperLog('warn', `Scraper trigger for '${type}' rejected: Engine is PAUSED.`);
      return NextResponse.json(
        {
          success: false,
          error: 'The Scraper Engine is currently PAUSED by Administrator. Activate it from the Admin Console to proceed.',
        },
        { status: 403 }
      );
    }

    addScraperLog('info', `Admin initiated '${type}' scraper run (limit: ${limit || 'default'})...`);

    if (type === 'jobs') {
      const result = await ScraperService.scrapeJobs({ keyword, location, limit: Number(limit) || 8 });
      
      scraperState.lastRunAt = new Date().toISOString();
      scraperState.lastRunType = 'jobs';
      scraperState.lastResult = {
        scrapedCount: result.scrapedCount,
        importedCount: result.importedCount,
        message: `Scraped ${result.scrapedCount} jobs, imported ${result.importedCount} new positions.`,
      };

      addScraperLog('success', `Job scraper finished: ${result.scrapedCount} fetched, ${result.importedCount} new jobs imported.`);

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

      scraperState.lastRunAt = new Date().toISOString();
      scraperState.lastRunType = 'hr';
      scraperState.lastResult = {
        scrapedCount: result.scrapedCount,
        importedCount: result.importedCount,
        message: `Scraped ${result.scrapedCount} HR contacts, imported ${result.importedCount} new recruiters.`,
      };

      addScraperLog('success', `HR scraper finished: ${result.scrapedCount} fetched, ${result.importedCount} new recruiters imported.`);

      return NextResponse.json({
        ...result,
        message: `Successfully scraped ${result.scrapedCount} verified recruiter profiles (${result.importedCount} new contacts added to directory)!`,
      });
    }

    if (type === 'hackathons') {
      const result = await ScraperService.scrapeHackathons({ limit: Number(limit) || 4 });

      scraperState.lastRunAt = new Date().toISOString();
      scraperState.lastRunType = 'hackathons';
      scraperState.lastResult = {
        scrapedCount: result.scrapedCount,
        importedCount: result.importedCount,
        message: `Scraped ${result.scrapedCount} hackathons, imported ${result.importedCount} new events.`,
      };

      addScraperLog('success', `Hackathon scraper finished: ${result.scrapedCount} fetched, ${result.importedCount} new events imported.`);

      return NextResponse.json({
        ...result,
        message: `Successfully scraped ${result.scrapedCount} live & upcoming hackathons (${result.importedCount} new events added)!`,
      });
    }

    addScraperLog('warn', `Scraper called with unsupported type: '${type}'`);
    return NextResponse.json(
      { success: false, error: "Invalid scrape type. Supported types: 'jobs', 'hr', 'hackathons'" },
      { status: 400 }
    );
  } catch (error: any) {
    addScraperLog('error', `Scraper encountered fatal error: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
