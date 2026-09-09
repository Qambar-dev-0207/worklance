// Centralized in-memory runtime telemetry & state for platform scrapers

export interface ScraperStatus {
  isEnabled: boolean;
  lastRunAt: string | null;
  lastRunType: string | null;
  lastResult: {
    scrapedCount: number;
    importedCount: number;
    message?: string;
  } | null;
  logs: Array<{
    id: string;
    timestamp: string;
    type: 'info' | 'success' | 'warn' | 'error';
    message: string;
  }>;
}

// Global runtime state preserved across Next.js API calls in Node environment
const globalForScraper = global as unknown as { scraperState: ScraperStatus };

export const scraperState: ScraperStatus = globalForScraper.scraperState || {
  isEnabled: true,
  lastRunAt: null,
  lastRunType: null,
  lastResult: null,
  logs: [
    {
      id: 'log_init',
      timestamp: new Date().toISOString(),
      type: 'info',
      message: 'Scraper engine initialized with security guards active.',
    },
  ],
};

if (process.env.NODE_ENV !== 'production') {
  globalForScraper.scraperState = scraperState;
}

export function addScraperLog(type: 'info' | 'success' | 'warn' | 'error', message: string) {
  scraperState.logs.unshift({
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    type,
    message,
  });

  // Keep last 60 logs
  if (scraperState.logs.length > 60) {
    scraperState.logs.pop();
  }
}
