import { ResumeSettings } from '@/types/resume';

export interface PageHeightCalculation {
  pageHeightPx: number; // e.g. 1123px for A4 @ 96dpi, 1056px for Letter
  contentHeightPx: number;
  fillPercentage: number; // e.g. 88% or 114%
  pageCount: number;
  isOverflowing: boolean;
  overflowPercentage: number; // e.g. 14%
  densityStatus: 'low' | 'optimal' | 'dense' | 'overflow';
  recommendation: string;
}

export function evaluateResumeDensity(
  contentHeightPx: number,
  pageSize: 'a4' | 'letter' = 'a4'
): PageHeightCalculation {
  // At 96 DPI:
  // A4: 210mm x 297mm = 794px x 1123px
  // US Letter: 8.5in x 11in = 816px x 1056px
  const pageHeightPx = pageSize === 'a4' ? 1123 : 1056;

  const fillPercentage = Math.round((contentHeightPx / pageHeightPx) * 100);
  const isOverflowing = contentHeightPx > pageHeightPx;
  const overflowPercentage = isOverflowing ? Math.round(((contentHeightPx - pageHeightPx) / pageHeightPx) * 100) : 0;
  const pageCount = isOverflowing ? Math.ceil(contentHeightPx / pageHeightPx) : 1;

  let densityStatus: 'low' | 'optimal' | 'dense' | 'overflow' = 'optimal';
  let recommendation = '✓ Good information density. Fits cleanly on 1 page.';

  if (fillPercentage < 65) {
    densityStatus = 'low';
    recommendation = 'Resume has sparse content. Add relevant coursework, projects, or additional achievements.';
  } else if (fillPercentage <= 98) {
    densityStatus = 'optimal';
    recommendation = '✓ Optimal 1-page recruiter density. Fits perfectly with clean margins.';
  } else if (fillPercentage <= 104) {
    densityStatus = 'dense';
    recommendation = 'Slightly tight near bottom margin. Consider Auto-Fit to ensure zero spillover.';
  } else {
    densityStatus = 'overflow';
    recommendation = `⚠ Resume is ${overflowPercentage}% over 1 page. Recommended: Apply 1-Click Auto-Fit or trim 1-2 lower-impact bullets.`;
  }

  return {
    pageHeightPx,
    contentHeightPx,
    fillPercentage,
    pageCount,
    isOverflowing,
    overflowPercentage,
    densityStatus,
    recommendation,
  };
}

export function calculateAutoFitSettings(
  currentSettings: ResumeSettings,
  overflowPercentage: number
): ResumeSettings {
  const adjusted = { ...currentSettings };

  if (overflowPercentage <= 0) {
    return adjusted;
  }

  // Tier 1: Micro-reduce section spacing (e.g. 8px -> 5px)
  if (overflowPercentage <= 6) {
    adjusted.sectionSpacing = Math.max(adjusted.sectionSpacing - 2, 4);
    adjusted.entrySpacing = Math.max(adjusted.entrySpacing - 1, 3);
    adjusted.bulletSpacing = 1.5;
    return adjusted;
  }

  // Tier 2: Micro-reduce section spacing + margins (e.g. 0.5in -> 0.45in)
  if (overflowPercentage <= 12) {
    adjusted.sectionSpacing = 5;
    adjusted.entrySpacing = 4;
    adjusted.bulletSpacing = 1;
    adjusted.lineHeight = Math.max(adjusted.lineHeight - 0.05, 1.26);
    adjusted.marginVertical = Math.max(adjusted.marginVertical - 0.05, 0.42);
    return adjusted;
  }

  // Tier 3: Reduce spacing, line-height, and tiny font adjustment (never below 9.2pt)
  adjusted.sectionSpacing = 4;
  adjusted.entrySpacing = 3;
  adjusted.bulletSpacing = 1;
  adjusted.lineHeight = 1.25;
  adjusted.marginVertical = 0.42;
  adjusted.marginHorizontal = 0.5;
  adjusted.fontSize = Math.max(adjusted.fontSize - 0.5, 9.25);
  adjusted.headingSize = Math.max(adjusted.headingSize - 0.5, 10.75);

  return adjusted;
}
