import { ResumeData, JobDescriptionAnalysis } from '@/types/resume';
import { generateProfessionalSummary } from './summaryGenerator';

const KNOWN_SKILL_DATABASE = [
  'python', 'sql', 'r', 'java', 'c++', 'c#', 'javascript', 'typescript', 'go', 'rust',
  'tableau', 'power bi', 'excel', 'looker', 'alteryx', 'hadoop', 'spark', 'databricks', 'snowflake',
  'postgresql', 'mysql', 'mongodb', 'oracle', 'sql server', 'redis', 'elasticsearch', 'dynamodb',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'git', 'github', 'terraform', 'airflow',
  'machine learning', 'deep learning', 'nlp', 'computer vision', 'random forest', 'xgboost',
  'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'scipy', 'dax', 'power automate',
  'powerapps', 'sharepoint', 'rest api', 'graphql', 'etl', 'data modeling', 'data warehousing',
  'stakeholder management', 'agile', 'scrum', 'project management', 'business analysis',
  'kpi reporting', 'statistical analysis', 'data mining', 'predictive modeling', 'a/b testing',
];

export function analyzeJobDescription(jdText: string, resumeData: ResumeData): JobDescriptionAnalysis {
  if (!jdText || jdText.trim().length < 15) {
    return {
      matchScore: 85,
      targetRole: resumeData.personal.targetTitle || 'Target Role',
      requiredSkills: ['SQL', 'Python', 'Data Analysis', 'Tableau'],
      preferredSkills: ['AWS', 'Power BI', 'ETL'],
      toolsAndTech: ['Git', 'Docker', 'PostgreSQL'],
      domainTerms: ['KPI Reporting', 'Data Modeling', 'Stakeholder Management'],
      softSkills: ['Problem Solving', 'Communication', 'Cross-functional Collaboration'],
      actionVerbs: ['Analyzed', 'Developed', 'Optimized', 'Spearheaded'],
      matchedKeywords: ['SQL', 'Python', 'Data Analysis', 'Tableau'],
      missingKeywords: ['AWS', 'ETL'],
    };
  }

  const jdLower = jdText.toLowerCase();

  // 1. Detect target role from first few lines of JD
  const roleMatch = jdText.match(/(?:title|role|position|seeking a|looking for an?)\s*:\s*([^\n,.]+)/i)
    || jdText.match(/^([A-Z][A-Za-z0-9\s/–-]{4,40})(?:\s*[-–|]|\s*at|\n)/);
  const targetRole = roleMatch ? roleMatch[1].trim() : resumeData.personal.targetTitle || 'Target Specialist';

  // 2. Extract skills from JD
  const extractedSkills: string[] = [];
  for (const skill of KNOWN_SKILL_DATABASE) {
    const reg = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (reg.test(jdLower)) {
      // Capitalize properly
      extractedSkills.push(formatSkillName(skill));
    }
  }

  // 3. Compile all text from candidate resume
  const resumeString = [
    resumeData.personal.targetTitle,
    resumeData.summary,
    resumeData.skills.map((s) => s.skillsList).join(' '),
    resumeData.experience.map((e) => `${e.role} ${e.company} ${e.bullets.map((b) => b.text).join(' ')}`).join(' '),
    resumeData.projects.map((p) => `${p.name} ${p.tech} ${p.bullets.map((b) => b.text).join(' ')}`).join(' '),
    resumeData.education.map((ed) => `${ed.degree} ${ed.coursework || ''}`).join(' '),
  ].join(' ').toLowerCase();

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  extractedSkills.forEach((skill) => {
    const reg = new RegExp(`\\b${skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (reg.test(resumeString)) {
      matchedKeywords.push(skill);
    } else {
      missingKeywords.push(skill);
    }
  });

  // Calculate ATS match percentage
  const total = Math.max(matchedKeywords.length + missingKeywords.length, 6);
  const ratio = matchedKeywords.length / total;
  const matchScore = Math.min(Math.max(Math.round(55 + ratio * 42), 60), 98);

  const toolsAndTech = matchedKeywords.slice(0, 8);
  const requiredSkills = matchedKeywords.slice(0, 5);
  const preferredSkills = missingKeywords.slice(0, 4);

  return {
    matchScore,
    targetRole,
    requiredSkills,
    preferredSkills,
    toolsAndTech,
    domainTerms: ['Data Pipelines', 'Predictive Modeling', 'Operational KPIs', 'Data Governance'],
    softSkills: ['Stakeholder Communication', 'Cross-Functional Teamwork', 'Agile Delivery'],
    actionVerbs: ['Architected', 'Engineered', 'Automated', 'Optimized'],
    matchedKeywords,
    missingKeywords,
  };
}

export function tailorResumeToJobDescription(
  resumeData: ResumeData,
  jdAnalysis: JobDescriptionAnalysis,
  targetCompany?: string
): ResumeData {
  const cloned: ResumeData = JSON.parse(JSON.stringify(resumeData));

  // 1. Update Target Title
  cloned.personal.targetTitle = jdAnalysis.targetRole;
  cloned.targetJobRole = jdAnalysis.targetRole;
  if (targetCompany) {
    cloned.targetCompany = targetCompany;
  }

  // 2. Generate and enable Tailored Summary
  cloned.showSummary = true;
  cloned.summary = generateProfessionalSummary({
    targetRole: jdAnalysis.targetRole,
    targetCompany: targetCompany || cloned.targetCompany,
    keySkills: jdAnalysis.matchedKeywords.slice(0, 5),
    resumeData: cloned,
  });

  // 3. Reorder Skills: prioritize matched skills at the front of each category
  cloned.skills = cloned.skills.map((cat) => {
    const items = cat.skillsList.split(',').map((s) => s.trim());
    items.sort((a, b) => {
      const aMatch = jdAnalysis.matchedKeywords.some((mk) => mk.toLowerCase() === a.toLowerCase());
      const bMatch = jdAnalysis.matchedKeywords.some((mk) => mk.toLowerCase() === b.toLowerCase());
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
    return {
      ...cat,
      skillsList: items.join(', '),
    };
  });

  // 4. Reorder Projects: Prioritize projects with matching technologies
  cloned.projects.sort((a, b) => {
    const aMatches = jdAnalysis.matchedKeywords.filter((k) => a.tech.toLowerCase().includes(k.toLowerCase())).length;
    const bMatches = jdAnalysis.matchedKeywords.filter((k) => b.tech.toLowerCase().includes(k.toLowerCase())).length;
    return bMatches - aMatches;
  });

  cloned.lastModified = Date.now();
  return cloned;
}

function formatSkillName(raw: string): string {
  const map: Record<string, string> = {
    sql: 'SQL',
    aws: 'AWS',
    gcp: 'GCP',
    nlp: 'NLP',
    etl: 'ETL',
    dax: 'DAX',
    kpi: 'KPI',
    rest: 'REST API',
    mongodb: 'MongoDB',
    postgresql: 'PostgreSQL',
    mysql: 'MySQL',
    powerbi: 'Power BI',
    'power bi': 'Power BI',
  };

  const lower = raw.toLowerCase();
  if (map[lower]) return map[lower];

  return raw
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
