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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  if (!isMounted) {
    return (
      <div style={{ minHeight: '100vh', background: '#F4F4F5', display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        {/* Minimal High-Tech Studio Bar Skeleton */}
        <div className="no-print resume-studio-tier1" style={{ position: 'sticky', top: 0, zIndex: 1000, width: '100%', background: '#09090B', borderBottom: '1px solid #27272A', boxShadow: '0 4px 20px rgba(0,0,0,0.35)' }}>
          <div className="resume-studio-tier1-inner" style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div className="studio-left-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="studio-brand-icon" style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#18181B', border: '1px solid #27272A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0 }}>
                <FileText style={{ width: '16px', height: '16px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>Resume Studio</span>
                <span className="studio-badge-pill" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10B981', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '2px 7px', borderRadius: '6px' }}>
                  ATS Standard
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #10B981', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '12px', color: '#A1A1AA', fontWeight: 500 }}>Initializing workspace...</span>
            </div>
          </div>
        </div>

        {/* Studio Split-Screen Workspace Skeleton */}
        <div className="container resume-builder-grid" style={{ padding: '24px 32px 80px', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '28px', alignItems: 'flex-start' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E4E4E7', padding: '24px', minHeight: '700px', opacity: 0.6 }} />
            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E4E4E7', padding: '24px', minHeight: '700px', opacity: 0.6, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F5', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* MINIMAL HIGH-TECH STUDIO BAR (TIER 1) */}
      <div
        className="no-print resume-studio-tier1"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          width: '100%',
          background: '#09090B',
          borderBottom: '1px solid #27272A',
          boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        }}
      >
        <div
          className="resume-studio-tier1-inner"
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '0 24px',
            height: '54px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Left: Brand + Document Version Selector */}
          <div className="studio-left-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div className="studio-brand-badge" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="studio-brand-icon" style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#18181B', border: '1px solid #27272A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0 }}>
                <FileText style={{ width: '16px', height: '16px' }} />
              </div>
              <div className="studio-brand-title" style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Resume Studio</span>
                <span className="studio-badge-pill" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10B981', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '2px 7px', borderRadius: '6px' }}>
                  ATS Standard
                </span>
              </div>
            </div>

            <div style={{ width: '1px', height: '16px', background: '#27272A' }} />

            {/* Version Switcher */}
            <div className="studio-version-box" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#18181B', border: '1px solid #27272A', padding: '4px 10px', borderRadius: '8px' }}>
              <span className="studio-version-label" style={{ fontSize: '10.5px', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ver:</span>
              <select
                value={activeVariantId}
                onChange={(e) => switchVariant(e.target.value)}
                className="studio-version-select"
                style={{
                  background: 'transparent',
                  color: '#F4F4F5',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: '170px',
                }}
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
                    <option key={v.id} value={v.id} style={{ background: '#18181B', color: '#FFF' }}>
                      {label}
                    </option>
                  );
                })}
              </select>
              <button
                onClick={() => setShowVersionModal(true)}
                className="studio-manage-btn"
                style={{
                  background: '#27272A',
                  color: '#D4D4D8',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Manage job-specific resume variants"
              >
                Manage
              </button>
            </div>
          </div>

          {/* Center: Segmented Diagnostic & Intelligence Tools */}
          <div className="studio-center-tools" style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#18181B', border: '1px solid #27272A', borderRadius: '10px', padding: '3px 6px' }}>
            {/* ATS Score Diagnostic */}
            <button
              onClick={() => setShowAtsModal(true)}
              className="studio-ats-pill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
              }}
              title="View ATS Diagnostic Breakdown"
            >
              <span
                className="studio-ats-indicator"
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: atsScore.overallScore >= 90 ? '#10B981' : '#F59E0B',
                }}
              />
              <span style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: 600 }}>ATS</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: atsScore.overallScore >= 90 ? '#10B981' : '#F59E0B' }}>
                {atsScore.overallScore}%
              </span>
            </button>

            <div className="studio-tool-divider" style={{ width: '1px', height: '16px', background: '#27272A', margin: '0 2px' }} />

            {/* Target JD Matcher */}
            <button
              onClick={() => setShowJdModal(true)}
              className="studio-tool-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', background: 'transparent', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
              title="Match resume against Target Job Description"
            >
              <Target style={{ width: '14px', height: '14px', color: '#A1A1AA' }} />
              <span>{resume.targetCompany ? resume.targetCompany : 'Match JD'}</span>
            </button>

            <div className="studio-tool-divider" style={{ width: '1px', height: '16px', background: '#27272A', margin: '0 2px' }} />

            {/* ATS Audit */}
            <button
              onClick={() => setShowChecklistModal(true)}
              className="studio-tool-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', background: 'transparent', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
              title="Recruiter 10-point Checklist"
            >
              <CheckCircle2 style={{ width: '14px', height: '14px', color: '#A1A1AA' }} />
              <span>Audit</span>
            </button>

            <div className="studio-tool-divider" style={{ width: '1px', height: '16px', background: '#27272A', margin: '0 2px' }} />

            {/* Formula Guide */}
            <button
              onClick={() => setShowFormulaModal(true)}
              className="studio-tool-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', background: 'transparent', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
              title="Action + Context + Metric Formula Guide"
            >
              <Lightbulb style={{ width: '14px', height: '14px', color: '#A1A1AA' }} />
              <span>Guide</span>
            </button>

            <div className="studio-tool-divider" style={{ width: '1px', height: '16px', background: '#27272A', margin: '0 2px' }} />

            {/* Import Resume */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="studio-tool-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', background: 'transparent', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
              title="Import resume from PDF, Word, or text"
            >
              <Upload style={{ width: '14px', height: '14px', color: '#A1A1AA' }} />
              <span>Import</span>
            </button>
          </div>

          {/* Right: Primary Action Group */}
          <div className="studio-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Sync to Worklance Profile */}
            <button
              onClick={() => handleSyncToProfile()}
              disabled={isSyncingProfile}
              className="studio-btn-sync"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
              }}
              title="Synchronize resume content directly to your Worklance profile"
            >
              <Sparkles style={{ width: '14px', height: '14px', color: '#A7F3D0' }} />
              <span>{isSyncingProfile ? 'Syncing...' : 'Sync to Profile'}</span>
            </button>

            {/* Word .docx Export */}
            <button
              onClick={handleDownloadDocx}
              disabled={isExportingDocx}
              className="studio-btn-docx"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: '#18181B',
                border: '1px solid #27272A',
                color: '#D4D4D8',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Exports native Microsoft Word (.docx) file matching the single-column ATS layout"
            >
              <FileDown style={{ width: '14px', height: '14px', color: '#A1A1AA' }} />
              <span>{isExportingDocx ? '...' : '.docx'}</span>
            </button>

            {/* Primary Print / Download PDF */}
            <button
              onClick={handlePrint}
              className="studio-btn-pdf"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#FFFFFF',
                color: '#09090B',
                border: 'none',
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
              title="Export 100% Vector ATS Print PDF"
            >
              <Printer style={{ width: '14px', height: '14px', color: '#09090B' }} />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECONDARY FORMATTING & CANVAS STRIP (TIER 2) */}
      <div
        className="no-print resume-studio-tier2"
        style={{
          width: '100%',
          background: '#111114',
          borderBottom: '1px solid #1F1F23',
        }}
      >
        <div
          className="resume-studio-tier2-inner"
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '0 24px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '11.5px',
          }}
        >
          {/* Left Controls: 1-Page Fit, Style, Font, Paper */}
          <div className="studio-tier2-left" style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto' }}>
            {/* 1-Page Auto-Fit Badge Button */}
            <button
              onClick={() => autoFitToOnePage(10)}
              className="studio-btn-autofit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#F59E0B',
                padding: '3px 10px',
                borderRadius: '100px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              title="Auto-tune margins, spacing, and density to fit 1 page"
            >
              <Zap style={{ width: '12px', height: '12px', color: '#F59E0B' }} />
              <span>1-Page Fit</span>
            </button>

            <span style={{ color: '#27272A' }}>|</span>

            {/* Template Segmented Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span className="studio-control-label" style={{ fontSize: '10.5px', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>STYLE:</span>
              {[
                { id: 'classic', label: 'Classic' },
                { id: 'modern', label: 'Modern' },
                { id: 'technical', label: 'Tech' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id as any)}
                  className={`studio-seg-btn ${resume.settings.template === t.id ? 'active' : ''}`}
                  style={{
                    background: resume.settings.template === t.id ? '#27272A' : 'transparent',
                    color: resume.settings.template === t.id ? '#FFFFFF' : '#A1A1AA',
                    fontSize: '11px',
                    fontWeight: resume.settings.template === t.id ? 700 : 600,
                    padding: '3px 8px',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <span style={{ color: '#27272A' }}>|</span>

            {/* Font Family Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span className="studio-control-label" style={{ fontSize: '10.5px', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>FONT:</span>
              {['Times New Roman', 'Georgia', 'Arial', 'Inter'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFontFamily(f as any)}
                  className={`studio-seg-btn ${resume.settings.fontFamily === f ? 'active' : ''}`}
                  style={{
                    background: resume.settings.fontFamily === f ? '#27272A' : 'transparent',
                    color: resume.settings.fontFamily === f ? '#FFFFFF' : '#A1A1AA',
                    fontSize: '11px',
                    fontWeight: resume.settings.fontFamily === f ? 700 : 600,
                    padding: '3px 8px',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {f === 'Times New Roman' ? 'Times' : f}
                </button>
              ))}
            </div>

            <span style={{ color: '#27272A' }}>|</span>

            {/* Paper Size */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {(['a4', 'letter'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setPageSize(sz)}
                  className={`studio-seg-btn ${resume.settings.pageSize === sz ? 'active' : ''}`}
                  style={{
                    background: resume.settings.pageSize === sz ? '#FFFFFF' : 'transparent',
                    color: resume.settings.pageSize === sz ? '#09090B' : '#A1A1AA',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Right Controls: JSON Backup / Restore / Reset */}
          <div className="studio-tier2-right" style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <button
              onClick={handleExportJson}
              className="studio-ghost-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: '#A1A1AA', fontSize: '11px', fontWeight: 600, padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}
              title="Backup resume structure as JSON"
            >
              <Download style={{ width: '12px', height: '12px' }} />
              <span>JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="studio-ghost-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: '#A1A1AA', fontSize: '11px', fontWeight: 600, padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}
              title="Restore resume from JSON backup"
            >
              <Upload style={{ width: '12px', height: '12px' }} />
              <span>JSON</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJson}
              accept=".json"
              style={{ display: 'none' }}
            />

            <span style={{ color: '#27272A' }}>|</span>

            <button
              onClick={() => {
                if (confirm('Reset current resume to the default Sohan Sethi reference template?')) {
                  resetToDefaultReference();
                  setStatusBanner('✓ Reset to Sohan Sethi reference resume.');
                  setTimeout(() => setStatusBanner(''), 3000);
                }
              }}
              className="studio-reset-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: '#71717A', fontSize: '11px', fontWeight: 600, padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}
              title="Reset to default reference resume"
            >
              <RotateCcw style={{ width: '12px', height: '12px' }} />
              <span>Reset</span>
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
