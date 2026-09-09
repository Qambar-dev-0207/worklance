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

function loadInitialState(): { resume: ResumeData; variants: ResumeData[]; activeVariantId: string } {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.resume && Array.isArray(parsed.variants) && parsed.variants.length > 0) {
          return {
            resume: parsed.resume,
            variants: parsed.variants,
            activeVariantId: parsed.activeVariantId || parsed.resume.id,
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
    const updatedVariants = variants.map((v) => (v.id === activeVariantId ? data : v));
    set({ resume: data, variants: updatedVariants });
    persistState(data, updatedVariants, activeVariantId);
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
