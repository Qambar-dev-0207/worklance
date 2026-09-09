import { ResumeData } from '@/types/resume';
import { extractTechnologies } from './bulletImprover';

export interface SummaryParams {
  targetRole?: string;
  targetCompany?: string;
  keySkills?: string[];
  strongestAchievement?: string;
  resumeData?: ResumeData;
}

export function generateProfessionalSummary(params: SummaryParams): string {
  const role = params.targetRole || params.resumeData?.personal.targetTitle || 'Business Analyst';
  const company = params.targetCompany || '';

  // Extract skills from resume or params
  let skillsList: string[] = params.keySkills || [];
  if (skillsList.length === 0 && params.resumeData) {
    const rawSkills = params.resumeData.skills.map((s) => s.skillsList).join(', ');
    skillsList = extractTechnologies(rawSkills);
    if (skillsList.length === 0) {
      skillsList = ['Python', 'SQL', 'Data Analytics', 'KPI Reporting'];
    }
  }

  const primarySkills = skillsList.slice(0, 4).join(', ');
  const secondarySkills = skillsList.slice(4, 7).join(', ') || 'cross-functional collaboration';

  // Find strongest achievement bullet
  let topAchievement = params.strongestAchievement;
  if (!topAchievement && params.resumeData) {
    for (const exp of params.resumeData.experience) {
      for (const b of exp.bullets) {
        if (b.metrics && b.metrics.length > 0) {
          topAchievement = b.text.replace(/\.$/, '');
          break;
        }
      }
      if (topAchievement) break;
    }
  }

  if (!topAchievement) {
    topAchievement = 'boosting operational throughput by 45% through automated data workflows';
  } else {
    topAchievement = topAchievement.charAt(0).toLowerCase() + topAchievement.slice(1);
  }

  const companyContext = company ? ` at ${company}` : '';

  // Formula:
  // [Target Role] with proven expertise specializing in [primary skills].
  // Demonstrated track record in [secondary skills] with measurable impact through [top achievement].
  return `Targeted for ${role}${companyContext}: Results-oriented professional specializing in ${primarySkills}. Proven capability across ${secondarySkills}, with demonstrated business impact through ${topAchievement}.`;
}
