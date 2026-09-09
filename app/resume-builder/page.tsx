'use client';

import React, { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ResumeSheet from '@/components/resume/ResumeSheet';
import ResumeDensityMeter from '@/components/resume/ResumeDensityMeter';
import AtsDiagnosticModal from '@/components/resume/AtsDiagnosticModal';
import JdMatcherModal from '@/components/resume/JdMatcherModal';
import VersionManagerModal from '@/components/resume/VersionManagerModal';
import ChecklistModal from '@/components/resume/ChecklistModal';
import FormulaGuideModal from '@/components/resume/FormulaGuideModal';
import SectionOrderManager from '@/components/resume/SectionOrderManager';
import AdvancedSettingsControl from '@/components/resume/AdvancedSettingsControl';

// Section Editors
import PersonalInfoEditor from '@/components/resume/editors/PersonalInfoEditor';
import SummaryEditor from '@/components/resume/editors/SummaryEditor';
import EducationEditor from '@/components/resume/editors/EducationEditor';
import SkillsEditor from '@/components/resume/editors/SkillsEditor';
import ExperienceEditor from '@/components/resume/editors/ExperienceEditor';
import ProjectsEditor from '@/components/resume/editors/ProjectsEditor';
import LeadershipEditor from '@/components/resume/editors/LeadershipEditor';
import AdditionalSectionsEditor from '@/components/resume/editors/AdditionalSectionsEditor';

import { useResumeStore } from '@/lib/resume/store';
import { generateDocxResume, downloadBlob } from '@/lib/resume/docxExport';
import { computeAtsDiagnosticScore } from '@/lib/resume/atsValidator';
import { printResumeToPdf } from '@/lib/resume/printPdf';
import { syncResumeToUserProfile } from '@/lib/resume/profileSync';
import {
  Sparkles,
  Printer,
  FileDown,
  Upload,
  Download,
  Target,
  CheckCircle2,
  Lightbulb,
  Zap,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { ResumeData } from '@/types/resume';

export default function ResumeBuilderPage() {
  const {
    resume,
    variants,
    activeVariantId,
    switchVariant,
    loadResumeData,
    resetToDefaultReference,
    setTemplate,
    setFontFamily,
    setPageSize,
    zoomLevel,
    setZoomLevel,
    autoFitToOnePage,
  } = useResumeStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFileInputRef = useRef<HTMLInputElement>(null);

  // Accordion open states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: false,
    education: true,
    skills: true,
    experience: true,
    projects: true,
    leadership: false,
    certifications: false,
    achievements: false,
    ordering: false,
    settings: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Modals
  const [showAtsModal, setShowAtsModal] = useState(false);
  const [showJdModal, setShowJdModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload modal state
  const [uploadTab, setUploadTab] = useState<'file' | 'paste'>('file');
  const [pastedResumeText, setPastedResumeText] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [statusBanner, setStatusBanner] = useState('');
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSyncingProfile, setIsSyncingProfile] = useState(false);

  // Load and listen for authenticated user session
  useEffect(() => {
    const loadUser = () => {
      const uStr = localStorage.getItem('worklance_user');
      if (uStr) {
        try {
          setCurrentUser(JSON.parse(uStr));
        } catch (e) {}
      }
    };
    loadUser();
    window.addEventListener('worklance-user-updated', loadUser);
    window.addEventListener('storage', loadUser);
    return () => {
      window.removeEventListener('worklance-user-updated', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  // Live ATS score
  const atsScore = computeAtsDiagnosticScore(resume);

  // Clean filename for exports
  const cleanFileName = `${(resume.personal.fullName || 'Resume').trim().replace(/[^a-zA-Z0-9]/g, '_')}_Resume`;

  // Profile synchronization handler
  const handleSyncToProfile = async (targetResume?: ResumeData) => {
    const resumeToSync = targetResume || resume;
    const token = typeof window !== 'undefined' ? localStorage.getItem('worklance_token') : null;
    const uStr = typeof window !== 'undefined' ? localStorage.getItem('worklance_user') : null;

    if (!token && !uStr) {
      alert('Please log in first to synchronize your resume with your Worklance profile.');
      window.location.href = '/login?redirect=/resume-builder';
      return;
    }

    try {
      setIsSyncingProfile(true);
      setStatusBanner('⏳ Updating your Worklance profile from resume data...');
      const updatedUser = await syncResumeToUserProfile(resumeToSync, atsScore.overallScore);
      setCurrentUser(updatedUser);
      setStatusBanner(`✓ Worklance profile successfully updated for ${updatedUser.name}!`);
      setTimeout(() => setStatusBanner(''), 4500);
    } catch (err: any) {
      console.error('Profile sync error:', err);
      setStatusBanner(`Sync notice: ${err.message}`);
      setTimeout(() => setStatusBanner(''), 4500);
    } finally {
      setIsSyncingProfile(false);
    }
  };

  // Print PDF handler
  const handlePrint = () => {
    setStatusBanner('Preparing 100% full-scale ATS PDF export...');
    printResumeToPdf('resume-document-root', cleanFileName, resume.settings.pageSize);
    setTimeout(() => setStatusBanner(''), 4000);
  };

  // DOCX Export handler
  const handleDownloadDocx = async () => {
    try {
      setIsExportingDocx(true);
      setStatusBanner('Generating native ATS-optimized Word document (.docx)...');
      const blob = await generateDocxResume(resume);
      downloadBlob(blob, `${cleanFileName}.docx`);
      setStatusBanner('✓ Word document downloaded successfully!');
      setTimeout(() => setStatusBanner(''), 3000);
    } catch (e: any) {
      console.error('Docx generation failed:', e);
      setStatusBanner(`Export failed: ${e.message}`);
      setTimeout(() => setStatusBanner(''), 4000);
    } finally {
      setIsExportingDocx(false);
    }
  };

  // JSON Export handler
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(resume, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${cleanFileName}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setStatusBanner('✓ Resume backup exported as JSON!');
    setTimeout(() => setStatusBanner(''), 3000);
  };

  // JSON Import handler
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.personal && parsed.skills) {
          loadResumeData(parsed);
          setStatusBanner(`✓ Successfully restored resume for ${parsed.personal.fullName}!`);
          setTimeout(() => setStatusBanner(''), 4000);
        } else if (parsed.fullName) {
          // Legacy format fallback
          convertLegacyToStoreFormat(parsed);
        } else {
          alert('Unrecognized resume JSON structure.');
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Convert uploaded parsed resume to store format
  const convertLegacyToStoreFormat = (parsed: any) => {
    const converted: ResumeData = {
      ...resume,
      id: `resume-${Date.now()}`,
      lastModified: Date.now(),
      personal: {
        fullName: parsed.fullName || parsed.name || resume.personal.fullName,
        targetTitle: parsed.targetTitle || resume.personal.targetTitle,
        email: parsed.email || resume.personal.email,
        phone: parsed.phone || resume.personal.phone,
        location: parsed.location || resume.personal.location,
        linkedIn: parsed.linkedIn || resume.personal.linkedIn,
        github: parsed.github || resume.personal.github,
        portfolio: parsed.portfolio || '',
      },
      showSummary: parsed.showSummary ?? !!parsed.summary,
      summary: parsed.summary || resume.summary,
      education: (parsed.educationList || []).map((e: any, idx: number) => {
        const loc = e.location && e.location.toLowerCase() !== 'location' && e.location.toLowerCase() !== 'city, state'
          ? e.location
          : '';
        return {
          id: `edu-${idx}`,
          institution: e.institution || '',
          degree: e.degree || '',
          location: loc,
          graduationDate: e.duration || e.graduationDate || '',
          coursework: e.coursework || '',
          gpa: e.gpa || '',
        };
      }),
      skills: parsed.skillsCategorized
        ? Object.entries(parsed.skillsCategorized).map(([k, v], idx) => ({
            id: `skill-${idx}`,
            categoryName: k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1'),
            skillsList: String(v),
          }))
        : resume.skills,
      experience: (parsed.experience || []).map((exp: any, idx: number) => {
        const rawComp = (exp.company || '').trim();
        const rawRole = (exp.role || exp.title || '').trim();
        const isDuplicate = rawComp.toLowerCase() === rawRole.toLowerCase();
        // Never duplicate role as company
        const company = rawComp;
        const role = isDuplicate ? rawRole : (rawRole || 'Role Title');
        const loc = exp.location && exp.location.toLowerCase() !== 'city, state' && exp.location.toLowerCase() !== 'location'
          ? exp.location
          : '';

        const durationParts = (exp.duration || '').split(/[-–—]/);
        const startDate = durationParts[0]?.trim() || '';
        const endDate = durationParts[1]?.trim() || (exp.duration?.toLowerCase().includes('present') ? 'Present' : '');

        return {
          id: `exp-${idx}`,
          company: company,
          role: role,
          location: loc,
          startDate: startDate,
          endDate: endDate,
          current: (exp.duration || '').toLowerCase().includes('present'),
          bullets: (exp.points || exp.bulletPoints || []).map((pt: string, pIdx: number) => ({
            id: `b-${idx}-${pIdx}`,
            text: pt,
          })),
        };
      }),
      projects: (parsed.projects || []).map((proj: any, idx: number) => {
        const link = proj.link && proj.link.toLowerCase() !== 'link' ? proj.link : '';
        const linkText = proj.linkText && proj.linkText.toLowerCase() !== 'link'
          ? proj.linkText
          : (link ? (link.includes('github') ? 'GitHub' : 'Live Demo') : '');

        return {
          id: `proj-${idx}`,
          name: proj.name || '',
          tech: proj.tech || '',
          date: proj.date || '',
          link: link,
          linkText: linkText,
          bullets: (proj.points || []).map((pt: string, pIdx: number) => ({
            id: `pb-${idx}-${pIdx}`,
            text: pt,
          })),
        };
      }),
      leadership: (parsed.leadership || []).map((item: any, idx: number) => ({
        id: `lead-${idx}`,
        text: typeof item === 'string' ? item : item.text || '',
      })),
      certifications: (parsed.certifications || parsed.certificationsList || []).map((item: any, idx: number) => ({
        id: `cert-${idx}`,
        text: typeof item === 'string' ? item : item.text || '',
        date: item.date || '',
        organization: item.organization || '',
      })),
      achievements: (parsed.achievements || []).map((item: any, idx: number) => ({
        id: `ach-${idx}`,
        text: typeof item === 'string' ? item : item.text || '',
      })),
      sectionVisibility: {
        ...resume.sectionVisibility,
        leadership: (parsed.leadership || []).length > 0,
        certifications: (parsed.certifications || parsed.certificationsList || []).length > 0,
      },
    };

    loadResumeData(converted);
    setStatusBanner(`✓ Imported resume for ${converted.personal.fullName}!`);
    const uStr = typeof window !== 'undefined' ? localStorage.getItem('worklance_user') : null;
    if (uStr) {
      syncResumeToUserProfile(converted, atsScore.overallScore)
        .then((u) => {
          setCurrentUser(u);
          setStatusBanner(`✓ Imported resume & updated your profile for ${converted.personal.fullName}!`);
          setTimeout(() => setStatusBanner(''), 5000);
        })
        .catch(() => {
          setTimeout(() => setStatusBanner(''), 4000);
        });
    } else {
      setTimeout(() => setStatusBanner(''), 4000);
    }
  };

  // Upload resume handler (PDF, DOCX, TXT)
  const handleUploadResumeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract text from file.');
      }

      convertLegacyToStoreFormat(data.resume);
      setShowUploadModal(false);
    } catch (err: any) {
      setUploadError(err.message || 'Error processing resume file.');
    } finally {
      setUploadLoading(false);
      if (uploadFileInputRef.current) uploadFileInputRef.current.value = '';
    }
  };

  // Paste text upload handler
  const handleParsePastedText = async () => {
    if (!pastedResumeText || pastedResumeText.trim().length < 20) {
      setUploadError('Please paste at least 20 characters of resume content.');
      return;
    }

    setUploadLoading(true);
    setUploadError('');

    try {
      const res = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pastedResumeText }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse resume text.');
      }

      convertLegacyToStoreFormat(data.resume);
      setShowUploadModal(false);
      setPastedResumeText('');
    } catch (err: any) {
      setUploadError(err.message || 'Error parsing text.');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F5', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* MINIMAL HIGH-TECH STUDIO BAR (TIER 1) */}
      <div
        className="no-print sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.35)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Left: Brand + Document Version Selector */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-sm font-bold text-white tracking-tight">Resume Studio</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    ATS Standard
                  </span>
                </div>
              </div>
            </div>

            <div className="h-4 w-px bg-zinc-800 hidden md:block" />

            {/* Version Switcher */}
            <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1 rounded-lg transition">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Ver:</span>
              <select
                value={activeVariantId}
                onChange={(e) => switchVariant(e.target.value)}
                className="bg-transparent text-xs font-semibold text-zinc-200 outline-none cursor-pointer max-w-[130px] sm:max-w-[160px] truncate"
              >
                {variants.map((v) => {
                  let label = v.versionName;
                  if (v.id === 'master') {
                    const candidateName = currentUser?.name || resume.personal.fullName;
                    if (candidateName && candidateName.toLowerCase() !== 'sohan sethi') {
                      label = `Master (${candidateName.split(' ')[0]})`;
                    }
                  }
                  return (
                    <option key={v.id} value={v.id} className="bg-zinc-900 text-white">
                      {label}
                    </option>
                  );
                })}
              </select>
              <button
                onClick={() => setShowVersionModal(true)}
                className="text-[10.5px] text-zinc-400 hover:text-white font-medium ml-1 transition"
                title="Manage job-specific resume variants"
              >
                Manage
              </button>
            </div>
          </div>

          {/* Center: Segmented Diagnostic & Intelligence Tools */}
          <div className="hidden lg:flex items-center gap-1 bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-1">
            {/* ATS Score Diagnostic */}
            <button
              onClick={() => setShowAtsModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition"
              title="View ATS Diagnostic Breakdown"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  atsScore.overallScore >= 90 ? 'bg-emerald-400' : 'bg-amber-400'
                } animate-pulse`}
              />
              <span className="text-zinc-400 text-[11px]">ATS</span>
              <span className={`font-bold ${atsScore.overallScore >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {atsScore.overallScore}%
              </span>
            </button>

            <div className="h-3.5 w-px bg-zinc-800" />

            {/* Target JD Matcher */}
            <button
              onClick={() => setShowJdModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition"
              title="Match resume against Target Job Description"
            >
              <Target className="w-3.5 h-3.5 text-zinc-400" />
              <span>{resume.targetCompany ? resume.targetCompany : 'Match JD'}</span>
            </button>

            <div className="h-3.5 w-px bg-zinc-800" />

            {/* ATS Audit */}
            <button
              onClick={() => setShowChecklistModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition"
              title="Recruiter 10-point Checklist"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Audit</span>
            </button>

            <div className="h-3.5 w-px bg-zinc-800" />

            {/* Formula Guide */}
            <button
              onClick={() => setShowFormulaModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition"
              title="Action + Context + Metric Formula Guide"
            >
              <Lightbulb className="w-3.5 h-3.5 text-zinc-400" />
              <span>Guide</span>
            </button>

            <div className="h-3.5 w-px bg-zinc-800" />

            {/* Import Resume */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition"
              title="Import resume from PDF, Word, or text"
            >
              <Upload className="w-3.5 h-3.5 text-zinc-400" />
              <span>Import</span>
            </button>
          </div>

          {/* Right: Primary Action Group */}
          <div className="flex items-center gap-2">
            {/* Sync to Worklance Profile */}
            <button
              onClick={() => handleSyncToProfile()}
              disabled={isSyncingProfile}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm"
              title="Synchronize resume content directly to your Worklance profile"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span className="hidden sm:inline">{isSyncingProfile ? 'Syncing...' : 'Sync to Profile'}</span>
              <span className="sm:hidden">{isSyncingProfile ? '...' : 'Sync'}</span>
            </button>

            {/* Word .docx Export */}
            <button
              onClick={handleDownloadDocx}
              disabled={isExportingDocx}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-medium text-xs transition"
              title="Exports native Microsoft Word (.docx) file matching the single-column ATS layout"
            >
              <FileDown className="w-3.5 h-3.5 text-zinc-400" />
              <span>{isExportingDocx ? '...' : '.docx'}</span>
            </button>

            {/* Primary Print / Download PDF */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs transition shadow-sm"
              title="Export 100% Vector ATS Print PDF"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-950" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECONDARY FORMATTING & CANVAS STRIP (TIER 2) */}
      <div
        className="no-print w-full border-b border-zinc-800/80 bg-zinc-900/70 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between gap-3 text-xs">
          {/* Left Controls: 1-Page Fit, Style, Font, Paper */}
          <div className="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none">
            {/* 1-Page Auto-Fit Badge Button */}
            <button
              onClick={() => autoFitToOnePage(10)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition whitespace-nowrap"
              title="Auto-tune margins, spacing, and density to fit 1 page"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>1-Page Fit</span>
            </button>

            <span className="text-zinc-700">|</span>

            {/* Template Segmented Toggle */}
            <div className="flex items-center gap-1">
              <span className="text-[10.5px] font-semibold text-zinc-500">STYLE:</span>
              {[
                { id: 'classic', label: 'Classic' },
                { id: 'modern', label: 'Modern' },
                { id: 'technical', label: 'Tech' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id as any)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    resume.settings.template === t.id
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <span className="text-zinc-700">|</span>

            {/* Font Family Selector */}
            <div className="flex items-center gap-1">
              <span className="text-[10.5px] font-semibold text-zinc-500">FONT:</span>
              {['Times New Roman', 'Georgia', 'Arial', 'Inter'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFontFamily(f as any)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    resume.settings.fontFamily === f
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {f === 'Times New Roman' ? 'Times' : f}
                </button>
              ))}
            </div>

            <span className="text-zinc-700">|</span>

            {/* Paper Size */}
            <div className="flex items-center gap-1">
              {(['a4', 'letter'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setPageSize(sz)}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-bold uppercase transition ${
                    resume.settings.pageSize === sz
                      ? 'bg-zinc-200 text-zinc-950'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Right Controls: JSON Backup / Restore / Reset */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <button
              onClick={handleExportJson}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-800/60 transition"
              title="Backup resume structure as JSON"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-800/60 transition"
              title="Restore resume from JSON backup"
            >
              <Upload className="w-3 h-3" />
              <span className="hidden sm:inline">JSON</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJson}
              accept=".json"
              style={{ display: 'none' }}
            />

            <span className="text-zinc-700">|</span>

            <button
              onClick={() => {
                if (confirm('Reset current resume to the default Sohan Sethi reference template?')) {
                  resetToDefaultReference();
                  setStatusBanner('✓ Reset to Sohan Sethi reference resume.');
                  setTimeout(() => setStatusBanner(''), 3000);
                }
              }}
              className="text-[11px] text-zinc-500 hover:text-red-400 inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-800/60 transition"
              title="Reset to default reference resume"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden md:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* NOTIFICATION STATUS BANNER */}
      {statusBanner && (
        <div
          className="no-print"
          style={{
            background: '#09090B',
            color: '#FFFFFF',
            padding: '10px 20px',
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: 700,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {statusBanner}
        </div>
      )}

      {/* MAIN SPLIT-SCREEN WORKSPACE */}
      <div className="container resume-builder-grid" style={{ padding: '24px 32px 80px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '28px', alignItems: 'flex-start' }}>
          {/* LEFT SIDE: STRUCTURED SECTION ACCORDIONS */}
          <div
            className="no-print"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Header & Section Management Pill */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E4E4E7',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#18181B' }}>
                  Resume Sections & Content
                </h2>
                <div style={{ fontSize: '11.5px', color: '#71717A', marginTop: '2px' }}>
                  Click into any section to edit or use live inline editing in the preview.
                </div>
              </div>
              <button
                onClick={() => toggleAccordion('ordering')}
                style={{
                  background: openSections.ordering ? '#000000' : '#F4F4F5',
                  color: openSections.ordering ? '#FFFFFF' : '#18181B',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: '100px',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                ↕️ Reorder Sections
              </button>
            </div>

            {/* Section Reorder Drawer if toggled */}
            {openSections.ordering && (
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E4E4E7',
                  borderRadius: '16px',
                  padding: '16px',
                }}
              >
                <SectionOrderManager />
              </div>
            )}

            {/* 1. PERSONAL INFORMATION ACCORDION */}
            <AccordionCard
              title="1. Personal & Contact Information"
              subtitle={`${resume.personal.fullName} • ${resume.personal.targetTitle || 'Target Role'}`}
              isOpen={openSections.personal}
              onToggle={() => toggleAccordion('personal')}
              badge="Header"
            >
              <PersonalInfoEditor />
            </AccordionCard>

            {/* 2. PROFESSIONAL SUMMARY ACCORDION */}
            <AccordionCard
              title="2. Professional Summary"
              subtitle={resume.showSummary ? 'Included on resume (2–4 lines)' : 'Hidden (Image 5 style)'}
              isOpen={openSections.summary}
              onToggle={() => toggleAccordion('summary')}
              badge={resume.showSummary ? 'Active' : 'Optional'}
            >
              <SummaryEditor />
            </AccordionCard>

            {/* 3. EDUCATION ACCORDION */}
            <AccordionCard
              title="3. Education"
              subtitle={`${resume.education.length} degree entries`}
              isOpen={openSections.education}
              onToggle={() => toggleAccordion('education')}
              badge="Standard"
            >
              <EducationEditor />
            </AccordionCard>

            {/* 4. SKILLS ACCORDION */}
            <AccordionCard
              title="4. Categorized Skills"
              subtitle={`${resume.skills.length} technical domains (zero skill bars)`}
              isOpen={openSections.skills}
              onToggle={() => toggleAccordion('skills')}
              badge="Text Only"
            >
              <SkillsEditor />
            </AccordionCard>

            {/* 5. WORK EXPERIENCE ACCORDION */}
            <AccordionCard
              title="5. Work Experience"
              subtitle={`${resume.experience.length} roles • Action + Impact + Metric`}
              isOpen={openSections.experience}
              onToggle={() => toggleAccordion('experience')}
              badge="Quantified"
            >
              <ExperienceEditor />
            </AccordionCard>

            {/* 6. PROJECTS ACCORDION */}
            <AccordionCard
              title="6. Projects"
              subtitle={`${resume.projects.length} technical & analytical projects`}
              isOpen={openSections.projects}
              onToggle={() => toggleAccordion('projects')}
              badge="Scale & Impact"
            >
              <ProjectsEditor />
            </AccordionCard>

            {/* 7. LEADERSHIP & AWARDS */}
            <AccordionCard
              title="7. Leadership & Awards"
              subtitle={`${resume.leadership.length} entries`}
              isOpen={openSections.leadership}
              onToggle={() => toggleAccordion('leadership')}
              badge="Awards"
            >
              <LeadershipEditor />
            </AccordionCard>

            {/* 8. CERTIFICATIONS */}
            <AccordionCard
              title="8. Certifications"
              subtitle={`${resume.certifications.length} credentials`}
              isOpen={openSections.certifications}
              onToggle={() => toggleAccordion('certifications')}
              badge="Credentials"
            >
              <AdditionalSectionsEditor sectionKey="certifications" title="Certifications" />
            </AccordionCard>

            {/* 9. ACHIEVEMENTS & EXTRACURRICULAR */}
            <AccordionCard
              title="9. Achievements & Extracurricular"
              subtitle="Honors, Publications, Competitions"
              isOpen={openSections.achievements}
              onToggle={() => toggleAccordion('achievements')}
              badge="Additional"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <AdditionalSectionsEditor sectionKey="achievements" title="Achievements" />
                <AdditionalSectionsEditor sectionKey="publications" title="Publications" />
                <AdditionalSectionsEditor sectionKey="extracurricular" title="Extracurricular Activities" />
              </div>
            </AccordionCard>

            {/* 10. ADVANCED TYPOGRAPHY & SPACING */}
            <AccordionCard
              title="10. Advanced Spacing, Margins & Typography"
              subtitle="Controlled ATS customization scale"
              isOpen={openSections.settings}
              onToggle={() => toggleAccordion('settings')}
              badge="Customizer"
            >
              <AdvancedSettingsControl />
            </AccordionCard>
          </div>

          {/* RIGHT SIDE: LIVE SHEET PREVIEW (STICKY) */}
          <div style={{ position: 'sticky', top: '90px' }}>
            {/* Density Meter & Helper Bar */}
            <div className="no-print" style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <ResumeDensityMeter />

              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E4E4E7',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '11.5px', color: '#52525B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>💡</span>
                  <span>
                    <strong>Inline Editing:</strong> Click any text in the resume sheet below to edit directly in place.
                  </span>
                </span>
                <span style={{ fontSize: '11px', color: '#A1A1AA', fontFamily: 'monospace' }}>
                  {cleanFileName}.pdf
                </span>
              </div>
            </div>

            {/* THE ATS RESUME SHEET */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                overflowX: 'auto',
                paddingBottom: '20px',
              }}
            >
              <ResumeSheet />
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AtsDiagnosticModal isOpen={showAtsModal} onClose={() => setShowAtsModal(false)} />
      <JdMatcherModal isOpen={showJdModal} onClose={() => setShowJdModal(false)} />
      <VersionManagerModal isOpen={showVersionModal} onClose={() => setShowVersionModal(false)} />
      <ChecklistModal isOpen={showChecklistModal} onClose={() => setShowChecklistModal(false)} />
      <FormulaGuideModal isOpen={showFormulaModal} onClose={() => setShowFormulaModal(false)} />

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 2000,
          }}
          onClick={() => setShowUploadModal(false)}
        >
          <div
            style={{
              background: '#09090B',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              padding: '32px',
              width: '100%',
              maxWidth: '560px',
              color: '#FFFFFF',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>📤 Upload Existing Resume</div>
                <div style={{ fontSize: '12px', color: '#A1A1AA' }}>Extract & convert into the high-ATS standard template</div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', background: '#18181B', padding: '4px', borderRadius: '10px' }}>
              <button
                onClick={() => setUploadTab('file')}
                style={{
                  flex: 1,
                  padding: '7px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: uploadTab === 'file' ? '#FFFFFF' : 'transparent',
                  color: uploadTab === 'file' ? '#000000' : '#A1A1AA',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Upload File (PDF / Word / TXT / JSON)
              </button>
              <button
                onClick={() => setUploadTab('paste')}
                style={{
                  flex: 1,
                  padding: '7px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: uploadTab === 'paste' ? '#FFFFFF' : 'transparent',
                  color: uploadTab === 'paste' ? '#000000' : '#A1A1AA',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Paste Raw Text
              </button>
            </div>

            {uploadTab === 'file' ? (
              <div>
                <div
                  onClick={() => uploadFileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(255, 255, 255, 0.25)',
                    borderRadius: '16px',
                    padding: '36px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#111115',
                  }}
                >
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>📄</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
                    Click to choose file or drag & drop
                  </div>
                  <div style={{ fontSize: '12px', color: '#A1A1AA' }}>
                    Supports <strong>PDF (.pdf)</strong>, <strong>Word (.docx)</strong>, <strong>Text (.txt)</strong>, or <strong>JSON</strong>
                  </div>
                </div>
                <input
                  type="file"
                  ref={uploadFileInputRef}
                  onChange={handleUploadResumeFile}
                  accept=".pdf,.docx,.txt,.json"
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div>
                <textarea
                  rows={8}
                  value={pastedResumeText}
                  onChange={(e) => setPastedResumeText(e.target.value)}
                  placeholder="Paste your existing resume content or LinkedIn profile text here..."
                  style={{
                    width: '100%',
                    background: '#111115',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    padding: '12px',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    lineHeight: 1.4,
                    outline: 'none',
                    marginBottom: '12px',
                  }}
                />
                <button
                  onClick={handleParsePastedText}
                  disabled={uploadLoading}
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    color: '#000000',
                    padding: '10px',
                    borderRadius: '100px',
                    fontWeight: 800,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {uploadLoading ? 'Extracting & Parsing...' : 'Parse & Format Into Template'}
                </button>
              </div>
            )}

            {uploadLoading && (
              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12.5px', color: '#A1A1AA' }}>
                🔄 Extracting candidate profile, education, skills, projects, and work experience...
              </div>
            )}

            {uploadError && (
              <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#F87171', borderRadius: '8px', fontSize: '12px', textAlign: 'center' }}>
                {uploadError}
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// Collapsible Accordion Card Component
function AccordionCard({
  title,
  subtitle,
  isOpen,
  onToggle,
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  isOpen: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E4E4E7',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}
    >
      <div
        onClick={onToggle}
        style={{
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          background: isOpen ? '#FAFAFA' : '#FFFFFF',
          borderBottom: isOpen ? '1px solid #F4F4F5' : 'none',
          userSelect: 'none',
        }}
      >
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#18181B' }}>{title}</div>
          <div style={{ fontSize: '11.5px', color: '#71717A', marginTop: '1px' }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {badge && (
            <span
              style={{
                background: '#F4F4F5',
                color: '#52525B',
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '100px',
              }}
            >
              {badge}
            </span>
          )}
          <span style={{ fontSize: '12px', color: '#71717A', fontWeight: 700 }}>
            {isOpen ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {isOpen && <div style={{ padding: '16px 18px' }}>{children}</div>}
    </div>
  );
}
