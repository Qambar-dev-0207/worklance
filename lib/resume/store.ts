import { create } from 'zustand';
import {
  ResumeData,
  PersonalInfo,
  ResumeSettings,
  SectionKey,
  EducationItem,
  SkillCategory,
  ExperienceItem,
  ProjectItem,
  SimpleSectionItem,
  PageSize,
  FontFamily,
  TemplateId,
} from '@/types/resume';
import { SOHAN_SETHI_RESUME } from './defaultData';
import { improveBulletPoint } from './bulletImprover';
import { calculateAutoFitSettings } from './autoFit';
import { tailorResumeToJobDescription } from './jdMatcher';
import { detectMetrics } from './metricEngine';
import { analyzeBulletVerb } from './verbEngine';

const STORAGE_KEY = 'worklance_ats_resume_store_v2';

interface ResumeStoreState {
  resume: ResumeData;
  variants: ResumeData[];
  activeVariantId: string;
  zoomLevel: number;
  measuredPageHeight: number;
  contentHeightPx: number;
  isAutoFitting: boolean;

  // Actions
  setZoomLevel: (zoom: number) => void;
  setContentHeightPx: (height: number) => void;
  updatePersonal: (personal: Partial<PersonalInfo>) => void;
  updateSummary: (summary: string, show?: boolean) => void;
  updateSettings: (settings: Partial<ResumeSettings>) => void;
  setTemplate: (template: TemplateId) => void;
  setFontFamily: (font: FontFamily) => void;
  setPageSize: (size: PageSize) => void;

  // Section Ordering & Visibility
  reorderSections: (newOrder: SectionKey[]) => void;
  moveSection: (direction: 'up' | 'down', key: SectionKey) => void;
  toggleSectionVisibility: (key: SectionKey, visible?: boolean) => void;

  // Education CRUD
  addEducation: (item?: Partial<EducationItem>) => void;
  updateEducation: (id: string, item: Partial<EducationItem>) => void;
  removeEducation: (id: string) => void;

  // Skills CRUD
  addSkillCategory: (cat?: Partial<SkillCategory>) => void;
  updateSkillCategory: (id: string, cat: Partial<SkillCategory>) => void;
  removeSkillCategory: (id: string) => void;

  // Experience CRUD
  addExperience: (item?: Partial<ExperienceItem>) => void;
  updateExperience: (id: string, item: Partial<ExperienceItem>) => void;
  removeExperience: (id: string) => void;
  addExperienceBullet: (expId: string, text?: string) => void;
  updateExperienceBullet: (expId: string, bulletId: string, text: string) => void;
  removeExperienceBullet: (expId: string, bulletId: string) => void;
  improveExperienceBullet: (expId: string, bulletId: string) => void;

  // Projects CRUD
  addProject: (item?: Partial<ProjectItem>) => void;
  updateProject: (id: string, item: Partial<ProjectItem>) => void;
  removeProject: (id: string) => void;
  addProjectBullet: (projId: string, text?: string) => void;
  updateProjectBullet: (projId: string, bulletId: string, text: string) => void;
  removeProjectBullet: (projId: string, bulletId: string) => void;
  improveProjectBullet: (projId: string, bulletId: string) => void;

  // Simple sections (leadership, certifications, achievements, publications, extracurricular)
  addSimpleItem: (section: SectionKey, text?: string) => void;
  updateSimpleItem: (section: SectionKey, id: string, text: string) => void;
  removeSimpleItem: (section: SectionKey, id: string) => void;

  // Intelligent Engines
  autoFitToOnePage: (overflowPercentage: number) => void;
  applyJdTailoring: (jdAnalysis: any, targetCompany?: string) => void;
  loadResumeData: (data: ResumeData) => void;
  resetToDefaultReference: () => void;

  // Variants & Version Control
  createVariant: (name: string, targetRole?: string, targetCompany?: string) => void;
  switchVariant: (variantId: string) => void;
  deleteVariant: (variantId: string) => void;
  renameVariant: (variantId: string, newName: string) => void;
}

const bulletVerbs = /^(?:building|architected|implemented|built|developed|engineered|deployed|created|reduced|raised|automated|designed|spearheaded|led|managed|optimized|integrated|conducted|established|produced|organized|evaluated|visualized|accelerated|delivered|pioneered|constructed|trained|fine-tuned|orchestrated|collaborated|authored|published|maintained|resolved|facilitated|transformed|scaled|leveraged|utilized|applied|achieved|increased|decreased|eliminated|saved|generated|formulated|executed|configured|secured|researched|analyzed|gathered|tested|programmed|devised|launched|supervised|directed|negotiated|administered|audited|monitored|improved|enhanced|upgraded|streamlined|centralized|revamped|expanded|overhauled|boosted|cut|spearheading|responsible|assisted|helped|participated|contributed|worked)\b/i;

const monthName = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
const yearDigits = '(?:19|20)\\d{2}';
const projectDateRegex = new RegExp(
  `(${monthName}\\.?\\s*${yearDigits}\\s*[-–—to\\s]+\\s*(?:Present|Current|Pursuing|${monthName}\\.?\\s*${yearDigits}|${yearDigits})|` +
  `${monthName}\\.?\\s*${yearDigits}|` +
  `${yearDigits}\\s*[-–—to\\s]+\\s*(?:Present|Current|${yearDigits})|` +
  `\\b${yearDigits}\\b)`,
  'i'
);

function parseProjectHeaderString(rawLine: string) {
  let line = rawLine.trim();
  let date = '';
  const dateMatch = line.match(projectDateRegex);
  if (dateMatch) {
    date = dateMatch[0].trim();
    line = line.replace(dateMatch[0], '').trim();
  }
  line = line.replace(/Link(?:\s*20\d\d)?/gi, '').trim();
  line = line.replace(/\|\s*Python,\s*AI\s*/gi, '').trim();
  line = line.replace(/\|\s*GitHub\s*/gi, '').trim();
  line = line.replace(/[|\s–—-]+$/, '').trim();

  let link = '';
  let linkText = '';
  const urlMatch = line.match(/(https?:\/\/[^\s|)]+|github\.com\/[^\s|)]+)/i);
  if (urlMatch) {
    link = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`;
    linkText = link.includes('github') ? 'GitHub' : 'Live Demo';
    line = line.replace(urlMatch[0], '').trim();
  }

  let name = '';
  let tech = '';

  if (line.includes('|')) {
    const parts = line.split('|').map((p) => p.trim()).filter(Boolean);
    name = parts[0] || '';
    tech = parts.slice(1).join(' · ');
  } else if (line.includes('·') || line.includes('•')) {
    const dotChar = line.includes('·') ? '·' : '•';
    const tokens = line.split(dotChar).map((t) => t.trim());
    const firstPart = tokens[0];
    const restTech = tokens.slice(1);

    if (firstPart.includes('—') || firstPart.includes('–')) {
      const dash = firstPart.includes('—') ? '—' : '–';
      const [projTitle, subAndFirstTech] = firstPart.split(dash).map((s) => s.trim());
      const words = (subAndFirstTech || '').split(' ');
      if (words.length > 1) {
        const firstTech = words[words.length - 1];
        const subTitle = words.slice(0, words.length - 1).join(' ');
        name = `${projTitle} — ${subTitle}`;
        tech = [firstTech, ...restTech].join(' · ');
      } else {
        name = `${projTitle} — ${subAndFirstTech}`;
        tech = restTech.join(' · ');
      }
    } else {
      name = firstPart;
      tech = restTech.join(' · ');
    }
  } else if (line.includes('—') || line.includes('–')) {
    const dash = line.includes('—') ? '—' : '–';
    const parts = line.split(dash).map((p) => p.trim());
    name = parts[0];
    tech = parts.slice(1).join(' · ');
  } else {
    name = line;
  }

  return { name: name.trim(), tech: tech.trim(), link, linkText, date };
}

export function healResumeProjects(projects: ProjectItem[]): ProjectItem[] {
  if (!projects || !Array.isArray(projects)) return [];
  const result: ProjectItem[] = [];

  for (const proj of projects) {
    let current: ProjectItem = {
      ...proj,
      bullets: [],
    };
    let currentBullets: ProjectItem['bullets'] = [];

    for (const b of proj.bullets || []) {
      const text = (b.text || '').trim();
      const clean = text.replace(/^[•\-\*\d.]+\s*/, '').trim();

      // Check if bullet is a GitHub/Demo link
      const linkMatch = clean.match(/(?:(?:github|link|demo|repo|code):\s*)?(https?:\/\/[^\s|)]+|github\.com\/[^\s|)]+)/i);
      if (/^(?:(?:github|link|demo|repo|code):\s*|https?:\/\/|github\.com\/)/i.test(clean) && linkMatch) {
        const url = linkMatch[1].startsWith('http') ? linkMatch[1] : `https://${linkMatch[1]}`;
        current.link = url;
        current.linkText = url.includes('github') ? 'GitHub' : 'Live Demo';
        continue;
      }

      const isVerb = bulletVerbs.test(clean);
      const hasDashOrPipe = clean.includes('—') || clean.includes('–') || clean.includes('|');
      const hasTechDots = clean.includes('·');
      const hasDate = projectDateRegex.test(clean);

      const isHeader = !isVerb && (
        (hasDashOrPipe && (hasTechDots || hasDate || clean.length < 130)) ||
        (hasTechDots && (hasDashOrPipe || hasDate))
      ) && clean.length < 160;

      if (isHeader) {
        // Save current project with its accumulated bullets
        current.bullets = currentBullets;
        result.push(current);

        // Start new project from this bullet
        const parsed = parseProjectHeaderString(clean);
        current = {
          id: `proj-${Date.now()}-${result.length}`,
          name: parsed.name,
          tech: parsed.tech,
          date: parsed.date,
          link: parsed.link,
          linkText: parsed.linkText,
          bullets: [],
        };
        currentBullets = [];
      } else {
        currentBullets.push(b);
      }
    }

    current.bullets = currentBullets;
    result.push(current);
  }

  return result;
}

const companyKeywords = /\b(?:Inc\.?|LLC|Ltd\.?|Technologies|Solutions|Corp\.?|Corporation|University|College|Lab|Robotics|Labs|Studio|Group|Company|Co\.)\b/i;

export function healResumeExperiences(experiences: ExperienceItem[]): ExperienceItem[] {
  if (!experiences || !Array.isArray(experiences)) return [];
  const result: ExperienceItem[] = [];

  for (const exp of experiences) {
    let current: ExperienceItem = { ...exp, bullets: [] };
    let currentBullets: ExperienceItem['bullets'] = [];

    for (const b of exp.bullets || []) {
      const text = (b.text || '').trim();
      const clean = text.replace(/^[•\-\*\d.]+\s*/, '').trim();

      const isVerb = bulletVerbs.test(clean);
      const isCompany = companyKeywords.test(clean) || (!isVerb && clean.length < 50 && !clean.endsWith('.'));

      if (isCompany && !isVerb) {
        if (!current.company || current.company.toLowerCase() === current.role.toLowerCase()) {
          current.company = clean;
          continue;
        } else if (currentBullets.length > 0) {
          current.bullets = currentBullets;
          result.push(current);
          current = {
            id: `exp-${Date.now()}-${result.length}`,
            company: clean,
            role: 'AI Engineer Intern',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            bullets: [],
          };
          currentBullets = [];
          continue;
        }
      }
      currentBullets.push(b);
    }
    current.bullets = currentBullets;
    result.push(current);
  }
  return result;
}

export function normalizeResumeData(data: ResumeData): ResumeData {
  if (!data) return data;
  return {
    ...data,
    projects: healResumeProjects(data.projects || []),
    experience: healResumeExperiences(data.experience || []),
  };
}

function loadInitialState(): { resume: ResumeData; variants: ResumeData[]; activeVariantId: string } {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.resume && Array.isArray(parsed.variants) && parsed.variants.length > 0) {
          const healedResume = normalizeResumeData(parsed.resume);
          const healedVariants = parsed.variants.map((v: ResumeData) => normalizeResumeData(v));
          return {
            resume: healedResume,
            variants: healedVariants,
            activeVariantId: parsed.activeVariantId || healedResume.id,
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached resume store:', e);
    }
  }

  return {
    resume: SOHAN_SETHI_RESUME,
    variants: [SOHAN_SETHI_RESUME],
    activeVariantId: SOHAN_SETHI_RESUME.id,
  };
}

function persistState(resume: ResumeData, variants: ResumeData[], activeVariantId: string) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          resume,
          variants,
          activeVariantId,
        })
      );
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }
}

const initial = loadInitialState();

export const useResumeStore = create<ResumeStoreState>((set, get) => ({
  resume: initial.resume,
  variants: initial.variants,
  activeVariantId: initial.activeVariantId,
  zoomLevel: 100,
  measuredPageHeight: 1123,
  contentHeightPx: 980,
  isAutoFitting: false,

  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
  setContentHeightPx: (contentHeightPx) => set({ contentHeightPx }),

  updatePersonal: (personalUpdates) => {
    const { resume, variants, activeVariantId } = get();
    const updated: ResumeData = {
      ...resume,
      personal: { ...resume.personal, ...personalUpdates },
      lastModified: Date.now(),
    };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  updateSummary: (summary, show) => {
    const { resume, variants, activeVariantId } = get();
    const updated: ResumeData = {
      ...resume,
      summary,
      showSummary: show !== undefined ? show : resume.showSummary,
      lastModified: Date.now(),
    };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  updateSettings: (settingsUpdates) => {
    const { resume, variants, activeVariantId } = get();
    const updated: ResumeData = {
      ...resume,
      settings: { ...resume.settings, ...settingsUpdates },
      lastModified: Date.now(),
    };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  setTemplate: (template) => {
    const { updateSettings } = get();
    if (template === 'classic') {
      updateSettings({ template, fontFamily: 'Times New Roman' });
    } else if (template === 'modern') {
      updateSettings({ template, fontFamily: 'Inter' });
    } else {
      updateSettings({ template, fontFamily: 'Arial' });
    }
  },

  setFontFamily: (fontFamily) => {
    get().updateSettings({ fontFamily });
  },

  setPageSize: (pageSize) => {
    get().updateSettings({ pageSize });
  },

  reorderSections: (newOrder) => {
    const { resume, variants, activeVariantId } = get();
    const updated: ResumeData = {
      ...resume,
      sectionOrder: newOrder,
      lastModified: Date.now(),
    };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  moveSection: (direction, key) => {
    const { resume, reorderSections } = get();
    const order = [...resume.sectionOrder];
    const index = order.indexOf(key);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = order[index - 1];
      order[index - 1] = order[index];
      order[index] = temp;
      reorderSections(order);
    } else if (direction === 'down' && index < order.length - 1) {
      const temp = order[index + 1];
      order[index + 1] = order[index];
      order[index] = temp;
      reorderSections(order);
    }
  },

  toggleSectionVisibility: (key, visible) => {
    const { resume, variants, activeVariantId } = get();
    const current = resume.sectionVisibility ? resume.sectionVisibility[key] : true;
    const nextVal = visible !== undefined ? visible : !current;

    const updated: ResumeData = {
      ...resume,
      sectionVisibility: {
        ...resume.sectionVisibility,
        [key]: nextVal,
      },
      lastModified: Date.now(),
    };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  // EDUCATION
  addEducation: (item) => {
    const { resume, variants, activeVariantId } = get();
    const newItem: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: item?.institution || 'University Name',
      degree: item?.degree || 'Degree Program',
      location: item?.location || 'City, State',
      graduationDate: item?.graduationDate || '2024',
      coursework: item?.coursework || '',
      gpa: item?.gpa || '',
    };
    const updated: ResumeData = {
      ...resume,
      education: [...resume.education, newItem],
      lastModified: Date.now(),
    };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  updateEducation: (id, item) => {
    const { resume, variants, activeVariantId } = get();
    const updatedEdu = resume.education.map((e) => (e.id === id ? { ...e, ...item } : e));
    const updated: ResumeData = { ...resume, education: updatedEdu, lastModified: Date.now() };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  removeEducation: (id) => {
    const { resume, variants, activeVariantId } = get();
    const updatedEdu = resume.education.filter((e) => e.id !== id);
    const updated: ResumeData = { ...resume, education: updatedEdu, lastModified: Date.now() };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  // SKILLS
  addSkillCategory: (cat) => {
    const { resume, variants, activeVariantId } = get();
    const newCat: SkillCategory = {
      id: `skill-${Date.now()}`,
      categoryName: cat?.categoryName || 'Technical Domain',
      skillsList: cat?.skillsList || 'Skill 1, Skill 2, Skill 3',
    };
    const updated: ResumeData = {
      ...resume,
      skills: [...resume.skills, newCat],
      lastModified: Date.now(),
    };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  updateSkillCategory: (id, cat) => {
    const { resume, variants, activeVariantId } = get();
    const updatedSkills = resume.skills.map((s) => (s.id === id ? { ...s, ...cat } : s));
    const updated: ResumeData = { ...resume, skills: updatedSkills, lastModified: Date.now() };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  removeSkillCategory: (id) => {
    const { resume, variants, activeVariantId } = get();
    const updatedSkills = resume.skills.filter((s) => s.id !== id);
    const updated: ResumeData = { ...resume, skills: updatedSkills, lastModified: Date.now() };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  // EXPERIENCE
  addExperience: (item) => {
    const { resume, variants, activeVariantId } = get();
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: item?.company || 'Company Name',
      role: item?.role || 'Job Title',
      location: item?.location || 'City, State',
      startDate: item?.startDate || 'Jan 2023',
      endDate: item?.endDate || 'Present',
      current: true,
      bullets: [
        {
          id: `b-${Date.now()}-1`,
          text: 'Architected and implemented production systems, improving operational efficiency by 30%.',
          metrics: ['30%'],
          powerVerb: 'Architected',
        },
      ],
    };
    const updated: ResumeData = {
      ...resume,
      experience: [...resume.experience, newExp],
      lastModified: Date.now(),
    };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  updateExperience: (id, item) => {
    const { resume, variants, activeVariantId } = get();
    const updatedExp = resume.experience.map((e) => (e.id === id ? { ...e, ...item } : e));
    const updated: ResumeData = { ...resume, experience: updatedExp, lastModified: Date.now() };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  removeExperience: (id) => {
    const { resume, variants, activeVariantId } = get();
    const updatedExp = resume.experience.filter((e) => e.id !== id);
    const updated: ResumeData = { ...resume, experience: updatedExp, lastModified: Date.now() };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  addExperienceBullet: (expId, text) => {
    const { resume, variants, activeVariantId } = get();
    const newBullet = {
      id: `b-${Date.now()}`,
      text: text || 'Developed high-performance features, boosting quarterly output.',
      metrics: [],
      powerVerb: 'Developed',
    };
    const updatedExp = resume.experience.map((exp) => {
      if (exp.id === expId) {
        return { ...exp, bullets: [...exp.bullets, newBullet] };
      }
      return exp;
    });
    const updated: ResumeData = { ...resume, experience: updatedExp, lastModified: Date.now() };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  updateExperienceBullet: (expId, bulletId, text) => {
    const { resume, variants, activeVariantId } = get();
    const metricRes = detectMetrics(text);
    const verbRes = analyzeBulletVerb(text);

    const updatedExp = resume.experience.map((exp) => {
      if (exp.id === expId) {
        return {
          ...exp,
          bullets: exp.bullets.map((b) =>
            b.id === bulletId
              ? {
                  ...b,
                  text,
                  metrics: metricRes.detectedMetrics,
                  powerVerb: verbRes.firstWord,
                  isWeak: verbRes.isWeakStarter,
                }
              : b
          ),
        };
      }
      return exp;
    });
    const updated: ResumeData = { ...resume, experience: updatedExp, lastModified: Date.now() };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  removeExperienceBullet: (expId, bulletId) => {
    const { resume, variants, activeVariantId } = get();
    const updatedExp = resume.experience.map((exp) => {
      if (exp.id === expId) {
        return { ...exp, bullets: exp.bullets.filter((b) => b.id !== bulletId) };
      }
      return exp;
    });
    const updated: ResumeData = { ...resume, experience: updatedExp, lastModified: Date.now() };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  improveExperienceBullet: (expId, bulletId) => {
    const { resume, updateExperienceBullet } = get();
    const exp = resume.experience.find((e) => e.id === expId);
    const bullet = exp?.bullets.find((b) => b.id === bulletId);
    if (!bullet) return;

    const res = improveBulletPoint(bullet.text, exp?.role);
    updateExperienceBullet(expId, bulletId, res.improved);
  },

  // PROJECTS
  addProject: (item) => {
    const { resume, variants, activeVariantId } = get();
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: item?.name || 'Project Name',
      tech: item?.tech || 'Python, SQL',
      link: item?.link || '',
      linkText: item?.linkText || 'Link',
      date: item?.date || '2024',
      bullets: [
        {
          id: `pb-${Date.now()}-1`,
          text: 'Engineered end-to-end predictive pipeline achieving 94% classification accuracy.',
          metrics: ['94%'],
          powerVerb: 'Engineered',
        },
      ],
    };
    const updated: ResumeData = { ...resume, projects: [...resume.projects, newProj], lastModified: Date.now() };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  updateProject: (id, item) => {
    const { resume, variants, activeVariantId } = get();
    const updatedProj = resume.projects.map((p) => (p.id === id ? { ...p, ...item } : p));
    const updated: ResumeData = { ...resume, projects: updatedProj, lastModified: Date.now() };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  removeProject: (id) => {
    const { resume, variants, activeVariantId } = get();
    const updatedProj = resume.projects.filter((p) => p.id !== id);
    const updated: ResumeData = { ...resume, projects: updatedProj, lastModified: Date.now() };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  addProjectBullet: (projId, text) => {
    const { resume, variants, activeVariantId } = get();
    const newBullet = {
      id: `pb-${Date.now()}`,
      text: text || 'Implemented scalable system architecture.',
      metrics: [],
      powerVerb: 'Implemented',
    };
    const updatedProj = resume.projects.map((p) => {
      if (p.id === projId) {
        return { ...p, bullets: [...p.bullets, newBullet] };
      }
      return p;
    });
    const updated: ResumeData = { ...resume, projects: updatedProj, lastModified: Date.now() };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  updateProjectBullet: (projId, bulletId, text) => {
    const { resume, variants, activeVariantId } = get();
    const metricRes = detectMetrics(text);
    const verbRes = analyzeBulletVerb(text);

    const updatedProj = resume.projects.map((p) => {
      if (p.id === projId) {
        return {
          ...p,
          bullets: p.bullets.map((b) =>
            b.id === bulletId
              ? {
                  ...b,
                  text,
                  metrics: metricRes.detectedMetrics,
                  powerVerb: verbRes.firstWord,
                  isWeak: verbRes.isWeakStarter,
                }
              : b
          ),
        };
      }
      return p;
    });
    const updated: ResumeData = { ...resume, projects: updatedProj, lastModified: Date.now() };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  removeProjectBullet: (projId, bulletId) => {
    const { resume, variants, activeVariantId } = get();
    const updatedProj = resume.projects.map((p) => {
      if (p.id === projId) {
        return { ...p, bullets: p.bullets.filter((b) => b.id !== bulletId) };
      }
      return p;
    });
    const updated: ResumeData = { ...resume, projects: updatedProj, lastModified: Date.now() };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  improveProjectBullet: (projId, bulletId) => {
    const { resume, updateProjectBullet } = get();
    const proj = resume.projects.find((p) => p.id === projId);
    const bullet = proj?.bullets.find((b) => b.id === bulletId);
    if (!bullet) return;

    const res = improveBulletPoint(bullet.text, proj?.name);
    updateProjectBullet(projId, bulletId, res.improved);
  },

  // SIMPLE SECTIONS
  addSimpleItem: (section, text) => {
    const { resume, variants, activeVariantId } = get();
    const list = (resume[section as keyof ResumeData] as SimpleSectionItem[]) || [];
    const newItem: SimpleSectionItem = {
      id: `${section}-${Date.now()}`,
      text: text || 'Recipient of academic honors and technical recognition.',
    };
    const updated: ResumeData = {
      ...resume,
      [section]: [...list, newItem],
      lastModified: Date.now(),
    };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  updateSimpleItem: (section, id, text) => {
    const { resume, variants, activeVariantId } = get();
    const list = (resume[section as keyof ResumeData] as SimpleSectionItem[]) || [];
    const updatedList = list.map((item) => (item.id === id ? { ...item, text } : item));
    const updated: ResumeData = {
      ...resume,
      [section]: updatedList,
      lastModified: Date.now(),
    };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  removeSimpleItem: (section, id) => {
    const { resume, variants, activeVariantId } = get();
    const list = (resume[section as keyof ResumeData] as SimpleSectionItem[]) || [];
    const updatedList = list.filter((item) => item.id !== id);
    const updated: ResumeData = {
      ...resume,
      [section]: updatedList,
      lastModified: Date.now(),
    };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? updated : v));
    set({ resume: updated, variants: updatedVariants });
    persistState(updated, updatedVariants, activeVariantId);
  },

  // AUTO-FIT
  autoFitToOnePage: (overflowPercentage) => {
    const { resume, updateSettings } = get();
    const autoSettings = calculateAutoFitSettings(resume.settings, overflowPercentage);
    updateSettings(autoSettings);
  },

  // JD TAILORING
  applyJdTailoring: (jdAnalysis, targetCompany) => {
    const { resume, variants, activeVariantId } = get();
    const tailored = tailorResumeToJobDescription(resume, jdAnalysis, targetCompany);
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? tailored : v));
    set({ resume: tailored, variants: updatedVariants });
    persistState(tailored, updatedVariants, activeVariantId);
  },

  loadResumeData: (data) => {
    const { variants, activeVariantId } = get();
    const normalized = normalizeResumeData(data);
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? normalized : v));
    set({ resume: normalized, variants: updatedVariants });
    persistState(normalized, updatedVariants, activeVariantId);
  },

  resetToDefaultReference: () => {
    const { variants, activeVariantId } = get();
    const resetResume = { ...SOHAN_SETHI_RESUME, id: activeVariantId, lastModified: Date.now() };
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? resetResume : v));
    set({ resume: resetResume, variants: updatedVariants });
    persistState(resetResume, updatedVariants, activeVariantId);
  },

  // VARIANTS
  createVariant: (name, targetRole, targetCompany) => {
    const { resume, variants } = get();
    const newVariant: ResumeData = {
      ...JSON.parse(JSON.stringify(resume)),
      id: `resume-var-${Date.now()}`,
      versionName: name,
      targetJobRole: targetRole || resume.personal.targetTitle,
      targetCompany: targetCompany || '',
      lastModified: Date.now(),
    };
    const nextVariants = [...variants, newVariant];
    set({ resume: newVariant, variants: nextVariants, activeVariantId: newVariant.id });
    persistState(newVariant, nextVariants, newVariant.id);
  },

  switchVariant: (variantId) => {
    const { variants } = get();
    const target = variants.find((v) => v.id === variantId);
    if (target) {
      set({ resume: target, activeVariantId: target.id });
      persistState(target, variants, target.id);
    }
  },

  deleteVariant: (variantId) => {
    const { variants, activeVariantId } = get();
    if (variants.length <= 1) {
      alert('Cannot delete the last remaining resume variant.');
      return;
    }
    const filtered = variants.filter((v) => v.id !== variantId);
    const nextActive = activeVariantId === variantId ? filtered[0].id : activeVariantId;
    const nextResume = filtered.find((v) => v.id === nextActive) || filtered[0];

    set({ resume: nextResume, variants: filtered, activeVariantId: nextActive });
    persistState(nextResume, filtered, nextActive);
  },

  renameVariant: (variantId, newName) => {
    const { resume, variants, activeVariantId } = get();
    const updatedVariants = variants.map((v) => (v.id === variantId ? { ...v, versionName: newName } : v));
    const nextResume = activeVariantId === variantId ? { ...resume, versionName: newName } : resume;

    set({ resume: nextResume, variants: updatedVariants });
    persistState(nextResume, updatedVariants, activeVariantId);
  },
}));
