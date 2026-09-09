export type PageSize = 'a4' | 'letter';

export type FontFamily = 'Times New Roman' | 'Georgia' | 'Arial' | 'Helvetica' | 'Inter';

export type TemplateId = 'classic' | 'modern' | 'technical';

export type DateFormatStyle = 'MMM YYYY – MMM YYYY' | 'MMMM YYYY – MMMM YYYY' | 'YYYY – YYYY';

export interface ResumeSettings {
  pageSize: PageSize;
  fontFamily: FontFamily;
  fontSize: number; // in pt (default 10)
  headingSize: number; // in pt (default 11.5)
  nameSize: number; // in pt (default 20)
  lineHeight: number; // multiplier (default 1.35)
  sectionSpacing: number; // in px (default 8)
  entrySpacing: number; // in px (default 6)
  bulletSpacing: number; // in px (default 2)
  marginVertical: number; // in inches (0.45 - 0.55)
  marginHorizontal: number; // in inches (0.55 - 0.65)
  template: TemplateId;
  dateFormat: DateFormatStyle;
  showSectionDividers: boolean;
  uppercaseHeadings: boolean;
}

export interface PersonalInfo {
  fullName: string;
  targetTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  github: string;
  portfolio: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  location: string;
  graduationDate: string;
  gpa?: string;
  coursework?: string;
  honors?: string;
}

export interface SkillCategory {
  id: string;
  categoryName: string; // e.g. "Analysis & Visualization Tools", "Programming Languages"
  skillsList: string; // comma-separated or text: "Power BI, Tableau, Excel, Looker"
}

export interface ResumeBullet {
  id: string;
  text: string;
  metrics?: string[];
  powerVerb?: string;
  isWeak?: boolean;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  bullets: ResumeBullet[];
}

export interface ProjectItem {
  id: string;
  name: string;
  tech: string; // e.g. "RStudio, Data Mining" or "Python, SQL, Tableau"
  link?: string;
  linkText?: string;
  date: string;
  bullets: ResumeBullet[];
}

export interface SimpleSectionItem {
  id: string;
  text: string;
  date?: string;
  organization?: string;
}

export type SectionKey =
  | 'summary'
  | 'education'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'leadership'
  | 'certifications'
  | 'publications'
  | 'achievements'
  | 'extracurricular';

export interface ResumeData {
  id: string;
  versionName: string; // e.g. "Master Resume", "Data Analyst - Chicago"
  targetJobRole?: string;
  targetCompany?: string;
  lastModified: number;
  personal: PersonalInfo;
  showSummary: boolean;
  summary: string;
  education: EducationItem[];
  skills: SkillCategory[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  leadership: SimpleSectionItem[];
  certifications: SimpleSectionItem[];
  publications: SimpleSectionItem[];
  achievements: SimpleSectionItem[];
  extracurricular: SimpleSectionItem[];
  sectionOrder: SectionKey[];
  sectionVisibility: Record<SectionKey, boolean>;
  settings: ResumeSettings;
}

export interface AtsDiagnosticScore {
  overallScore: number;
  atsCompatibility: number;
  keywordMatch: number;
  achievementStrength: number;
  quantification: number;
  readability: number;
  formatting: number;
  relevance: number;
  conciseness: number;
  metricsDetectedCount: number;
  powerVerbsCount: number;
  repetitiveVerbs: string[];
  suggestions: string[];
}

export interface JobDescriptionAnalysis {
  matchScore: number;
  targetRole: string;
  requiredSkills: string[];
  preferredSkills: string[];
  toolsAndTech: string[];
  domainTerms: string[];
  softSkills: string[];
  actionVerbs: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
}

export interface AtsValidationCheck {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  fixSuggestion?: string;
}
