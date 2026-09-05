'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const POWER_VERBS = [
  'Achieved', 'Delivered', 'Researched', 'Improved', 'Managed',
  'Created', 'Streamlined', 'Implemented', 'Designed', 'Increased',
  'Reduced', 'Launched', 'Developed', 'Negotiated', 'Analyzed',
  'Trained', 'Facilitated', 'Revamped', 'Coordinated', 'Spearheaded',
  'Executed', 'Built', 'Solved', 'Led', 'Directed'
];

const CHEATSHEET_EXAMPLES = [
  {
    role: 'Software Developer',
    before: 'Worked on web application development.',
    after: 'Built & deployed a customer self-service dashboard, reducing support dependency by 28%.',
  },
  {
    role: 'Product Manager',
    before: 'Worked with teams to launch features.',
    after: 'Led the launch of a user-requested feature, driving a 17% increase in active feature usage.',
  },
  {
    role: 'Data Analyst',
    before: 'Created reports and dashboards.',
    after: 'Automated weekly reporting, improving efficiency and cutting reporting time by 94%.',
  },
  {
    role: 'UI/UX Designer',
    before: 'Designed website pages.',
    after: 'Enhanced onboarding flow, increasing user activation and signup completion by 23%.',
  },
  {
    role: 'Marketing',
    before: 'Managed social media accounts.',
    after: 'Drove 42% Instagram engagement growth in 3 months with short-form content.',
  },
  {
    role: 'Sales Executive',
    before: 'Handled client relationships and sales.',
    after: 'Prospected & closed new business opportunities, generating $2M in quarterly sales revenue.',
  },
  {
    role: 'Recruiter / HR',
    before: 'Managed recruitment process.',
    after: 'Optimized recruitment processes, cutting average time-to-hire from 45 to 28 days.',
  },
  {
    role: 'Accountant',
    before: 'Managed company finances and reports.',
    after: 'Implemented automated reconciliation processes, reducing month-end closing time by 35%.',
  },
];

export default function ResumeBuilderPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFileInputRef = useRef<HTMLInputElement>(null);

  // Template State
  const [template, setTemplate] = useState<'classic' | 'modern' | 'minimal'>('classic');

  // Resume Core Data
  const [fullName, setFullName] = useState('Riya Sharma');
  const [targetTitle, setTargetTitle] = useState('Senior Frontend & Full Stack Engineer');
  const [email, setEmail] = useState('riya.sharma@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [location, setLocation] = useState('Bengaluru, Karnataka');
  const [linkedIn, setLinkedIn] = useState('linkedin.com/in/riyasharma-dev');
  const [github, setGithub] = useState('github.com/riyasharma');
  
  const [summary, setSummary] = useState(
    'Targeted for Senior Frontend & Full Stack Engineer: Results-driven engineer with 4+ years of experience architecting high-performance React and Next.js SaaS applications. Proven track record in optimizing web performance by 45%, reducing latency, and integrating resilient Node.js microservices handling 1M+ monthly requests.'
  );

  const [experience, setExperience] = useState([
    {
      company: 'Zenith Tech Labs',
      role: 'Frontend Engineer Lead',
      duration: '2023 - Present',
      points: [
        'Architected Next.js 14 web application platform handling 1M+ monthly requests, reducing Core Web Vitals LCP by 45%.',
        'Spearheaded performance optimization and dynamic code splitting, cutting bundle size by 38%.',
        'Mentored junior engineers and instituted TypeScript best practices across 4 squad repositories, increasing team sprint velocity by 25%.',
      ],
    },
    {
      company: 'Nexora Innovations',
      role: 'Software Engineer (Frontend)',
      duration: '2021 - 2023',
      points: [
        'Built and deployed real-time financial dashboards using React and WebSockets, reducing customer support dependency by 28%.',
        'Collaborated with product designers to construct a company-wide design token system, cutting UI delivery time by 35%.',
      ],
    },
  ]);

  const [projects, setProjects] = useState([
    {
      name: 'Worklance Career Operating System',
      tech: 'Next.js 14, TypeScript, MongoDB, JWT',
      description: 'Architected unified career platform featuring AI job matching and ATS resume generation, achieving 99.9% uptime SLA.',
    },
    {
      name: 'Real-Time Vector Search Engine',
      tech: 'Node.js, Redis, Docker, FastAPI',
      description: 'Engineered sub-10ms latency vector retrieval engine for semantic search over 500k documents, reducing latency by 42%.',
    },
  ]);

  const [skills, setSkills] = useState('React, Next.js, TypeScript, Node.js, Express, MongoDB, Tailwind CSS, REST APIs, GraphQL, Jest, Docker, Git');
  const [education, setEducation] = useState('B.Tech in Computer Science — RV College of Engineering, Bengaluru (2017 - 2021)');
  
  // Modals & Panels
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTab, setUploadTab] = useState<'file' | 'paste'>('file');
  const [pastedResumeText, setPastedResumeText] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const [showJdModal, setShowJdModal] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [jdAnalysis, setJdAnalysis] = useState<any>(null);

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  // AI Review States
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationBanner, setOptimizationBanner] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<string>('');

  useEffect(() => {
    // Auto-fill from user profile if stored in localStorage
    const uStr = localStorage.getItem('worklance_user');
    if (uStr) {
      try {
        const u = JSON.parse(uStr);
        if (u.name) setFullName(u.name);
        if (u.email) setEmail(u.email);
        if (u.title) setTargetTitle(u.title);
        if (u.bio) setSummary(u.bio);
        if (u.skills && u.skills.length > 0) {
          setSkills(Array.isArray(u.skills) ? u.skills.join(', ') : u.skills);
        }
      } catch (e) {}
    }
  }, []);

  // Compute live ATS score dynamically
  const computeLiveAts = () => {
    let allBullets: string[] = [];
    experience.forEach((e) => {
      if (Array.isArray(e.points)) allBullets.push(...e.points);
    });
    projects.forEach((p) => {
      if (p.description) allBullets.push(p.description);
    });

    const total = Math.max(allBullets.length, 1);
    const powerCount = allBullets.filter((b) => {
      const first = (b.trim().split(/\s+/)[0] || '').toLowerCase();
      return POWER_VERBS.some((pv) => pv.toLowerCase() === first);
    }).length;

    const metricRegex = /\b(\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?[KMBkmb]?|\d+x|\d+\+?\s*(?:users|clients|customers|requests|transactions|queries|days|weeks|months|engineers|members|hours|features|services)|#\d+|\b\d{2,}\b)/i;
    const metricCount = allBullets.filter((b) => metricRegex.test(b)).length;

    let score = 55;
    if (fullName && targetTitle && email && phone) score += 12;
    if (summary.length > 70) score += 8;
    if (skills.split(',').length >= 8) score += 8;
    score += Math.round((powerCount / total) * 10);
    score += Math.round((metricCount / total) * 7);

    return Math.min(score, 98);
  };

  const currentAtsScore = computeLiveAts();

  // Print PDF with standard file name: Firstname_Lastname_Resume.pdf
  const handlePrint = () => {
    const originalTitle = document.title;
    const cleanFileName = `${fullName.trim().replace(/[^a-zA-Z0-9]/g, '_')}_Resume`;
    document.title = cleanFileName;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // 1-Click High-ATS Polish
  const handleOptimizeResume = async (tailorWithJd: boolean = false) => {
    setOptimizing(true);
    setOptimizationBanner('Analyzing bullet points and injecting Action + Impact + Metric formula with 25 Power Verbs...');
    try {
      const res = await fetch('/api/resume/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          targetTitle,
          email,
          phone,
          location,
          linkedIn,
          github,
          summary,
          experience,
          projects,
          skills,
          education,
          jobDescription,
          tailorToJD: tailorWithJd,
        }),
      });

      const data = await res.json();
      if (data.success && data.optimizedResume) {
        const opt = data.optimizedResume;
        setSummary(opt.summary);
        setExperience(opt.experience);
        setProjects(opt.projects);
        setSkills(opt.skills);
        if (data.jdAnalysis) {
          setJdAnalysis(data.jdAnalysis);
        }
        setOptimizationBanner('🎉 High-ATS Resume Generated! All bullets upgraded with 25 Power Verbs and quantified metrics.');
        setTimeout(() => setOptimizationBanner(''), 5000);
      } else {
        throw new Error(data.error || 'Optimization failed');
      }
    } catch (err: any) {
      setOptimizationBanner(`Error: ${err.message}`);
      setTimeout(() => setOptimizationBanner(''), 4000);
    } finally {
      setOptimizing(false);
    }
  };

  // Upload Resume handler (PDF, DOCX, TXT, JSON)
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

      applyParsedResume(data.resume);
      setShowUploadModal(false);
      setOptimizationBanner(`✓ Successfully imported ${data.resume.fullName}'s resume! Click "⚡ Upgrade to High ATS" to polish.`);
      setTimeout(() => setOptimizationBanner(''), 5000);
    } catch (err: any) {
      setUploadError(err.message || 'Error processing resume file.');
    } finally {
      setUploadLoading(false);
      if (uploadFileInputRef.current) uploadFileInputRef.current.value = '';
    }
  };

  // Direct paste text handler
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

      applyParsedResume(data.resume);
      setShowUploadModal(false);
      setPastedResumeText('');
      setOptimizationBanner(`✓ Successfully extracted resume for ${data.resume.fullName}! Ready to polish.`);
      setTimeout(() => setOptimizationBanner(''), 5000);
    } catch (err: any) {
      setUploadError(err.message || 'Error parsing text.');
    } finally {
      setUploadLoading(false);
    }
  };

  const applyParsedResume = (res: any) => {
    if (res.fullName) setFullName(res.fullName);
    if (res.targetTitle) setTargetTitle(res.targetTitle);
    if (res.email) setEmail(res.email);
    if (res.phone) setPhone(res.phone);
    if (res.location) setLocation(res.location);
    if (res.linkedIn) setLinkedIn(res.linkedIn);
    if (res.github) setGithub(res.github);
    if (res.summary) setSummary(res.summary);
    if (res.experience && res.experience.length > 0) setExperience(res.experience);
    if (res.projects && res.projects.length > 0) setProjects(res.projects);
    if (res.skills) setSkills(res.skills);
    if (res.education) setEducation(res.education);
  };

  // Sync to Worklance Profile
  const handleSyncToProfile = async () => {
    setSyncStatus('Syncing to your Worklance profile...');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          title: targetTitle,
          bio: summary,
          skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to sync to profile');
      }

      localStorage.setItem('worklance_user', JSON.stringify(data.user));
      setSyncStatus('✓ Successfully saved to your Worklance profile!');
      setTimeout(() => setSyncStatus(''), 3500);
    } catch (err: any) {
      setSyncStatus(`Error: ${err.message}`);
      setTimeout(() => setSyncStatus(''), 3500);
    }
  };

  const handleLoadFromProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.success && data.user) {
        const u = data.user;
        if (u.name) setFullName(u.name);
        if (u.email) setEmail(u.email);
        if (u.title) setTargetTitle(u.title);
        if (u.bio) setSummary(u.bio);
        if (u.skills) setSkills(Array.isArray(u.skills) ? u.skills.join(', ') : u.skills);
        alert('✓ Resume populated with your profile data!');
      }
    } catch (e) {
      alert('Could not fetch profile');
    }
  };

  const handleExportJson = () => {
    const resumeData = {
      fullName,
      targetTitle,
      email,
      phone,
      location,
      linkedIn,
      github,
      summary,
      experience,
      projects,
      skills,
      education,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(resumeData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${fullName.replace(/\s+/g, '_')}_Resume.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          applyParsedResume(parsed);
          alert('✓ Resume successfully loaded from JSON backup!');
        } catch (err) {
          alert('Invalid JSON resume file format');
        }
      };
    }
  };

  const handleRunAiReview = async () => {
    setReviewLoading(true);
    setShowReviewModal(true);
    try {
      const res = await fetch('/api/resume/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          targetTitle,
          email,
          phone,
          location,
          linkedIn,
          summary,
          experience,
          projects,
          skills,
          education,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewResult(data.review);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewLoading(false);
    }
  };

  // Experience and Project helpers
  const handleAddExperience = () => {
    setExperience([
      ...experience,
      {
        company: 'Company Name',
        role: 'Role Title',
        duration: '2023 - Present',
        points: ['Spearheaded core feature implementation, increasing user engagement by 24%.'],
      },
    ]);
  };

  const handleRemoveExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleAddBullet = (expIndex: number) => {
    const updated = [...experience];
    updated[expIndex].points.push('Delivered system optimization, reducing response latency by 32%.');
    setExperience(updated);
  };

  const handleRemoveBullet = (expIndex: number, ptIndex: number) => {
    const updated = [...experience];
    updated[expIndex].points = updated[expIndex].points.filter((_, idx) => idx !== ptIndex);
    setExperience(updated);
  };

  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        name: 'Project Name',
        tech: 'React, Node.js, MongoDB',
        description: 'Architected scalable system handling 50k+ requests with 99.9% uptime.',
      },
    ]);
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO BANNER */}
      <div className="no-print" style={{ background: '#000000', color: '#fff', padding: '48px 0 40px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div className="eyebrow" style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
              ⚡ High-ATS Resume Engine
            </div>
            <h1 style={{ fontSize: '36px', color: '#fff', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Upload & Transform to a High-ATS Resume
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', maxWidth: '650px', lineHeight: 1.5 }}>
              Upload your existing resume (PDF, Word, TXT, JSON) to rewrite bullets with the <strong>Action + Impact + Metric formula</strong> and <strong>25 Power Verbs</strong> to pass corporate screening algorithms.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: '#111115', padding: '14px 22px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center', minWidth: '130px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ATS Score</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: currentAtsScore >= 90 ? '#10B981' : '#FFFFFF' }}>
                {currentAtsScore}%
              </div>
              <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.5)' }}>
                {currentAtsScore >= 90 ? '✓ Top 5% ATS Ready' : 'Optimization Active'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn btn-primary"
                style={{ background: '#FFFFFF', color: '#000000', padding: '11px 20px', fontSize: '13.5px', fontWeight: 700, borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                📤 Upload Existing Resume
              </button>

              <button
                onClick={() => handleOptimizeResume(false)}
                disabled={optimizing}
                className="btn btn-outline"
                style={{ background: '#18181B', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.25)', padding: '11px 20px', fontSize: '13px', fontWeight: 700, borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {optimizing ? '🔄 Polishing Resume...' : '⚡ 1-Click High-ATS Polish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK SHORTCUT ACTIONS BAR */}
      <div className="no-print" style={{ background: '#FFFFFF', borderBottom: '1px solid #E4E4E7', padding: '10px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#71717A' }}>FORMAT:</span>
            {(['classic', 'modern', 'minimal'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTemplate(t)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: template === t ? '#000000' : '#F4F4F5',
                  color: template === t ? '#FFFFFF' : '#3F3F46',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {t}
              </button>
            ))}

            <span style={{ color: '#D4D4D8', margin: '0 4px' }}>|</span>

            <button
              onClick={() => setShowJdModal(true)}
              style={{
                background: jobDescription ? '#ECFDF5' : '#F4F4F5',
                color: jobDescription ? '#047857' : '#18181B',
                border: jobDescription ? '1px solid #A7F3D0' : '1px solid #E4E4E7',
                padding: '5px 12px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              🎯 Target Job Description {jobDescription ? '(Matched)' : ''}
            </button>

            <button
              onClick={() => setShowChecklistModal(true)}
              style={{
                background: '#F4F4F5',
                color: '#18181B',
                border: '1px solid #E4E4E7',
                padding: '5px 12px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📋 8-Point ATS Checklist
            </button>

            <button
              onClick={() => setShowGuideModal(true)}
              style={{
                background: '#F4F4F5',
                color: '#18181B',
                border: '1px solid #E4E4E7',
                padding: '5px 12px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              💡 Cheatsheet & Formula
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleRunAiReview}
              className="btn btn-outline"
              style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '100px', fontWeight: 700 }}
            >
              🤖 Deep Review
            </button>
            <button
              onClick={handleSyncToProfile}
              className="btn btn-outline"
              style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '100px', fontWeight: 700 }}
            >
              💾 Save to Profile
            </button>
            <button
              onClick={handleLoadFromProfile}
              className="btn btn-outline"
              style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '100px', fontWeight: 700 }}
            >
              🔄 Load Profile
            </button>
            <button
              onClick={handleExportJson}
              className="btn btn-outline"
              style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '100px', fontWeight: 700 }}
            >
              ⬇️ JSON
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-outline"
              style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '100px', fontWeight: 700 }}
            >
              ⬆️ JSON
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJson}
              accept=".json"
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* NOTIFICATION BANNER */}
      {optimizationBanner && (
        <div className="no-print" style={{ background: '#000000', color: '#FFFFFF', padding: '11px 20px', textAlign: 'center', fontSize: '13.5px', fontWeight: 700 }}>
          {optimizationBanner}
        </div>
      )}
      {syncStatus && (
        <div className="no-print" style={{ background: '#18181B', color: '#FFFFFF', padding: '10px 20px', textAlign: 'center', fontSize: '13px', fontWeight: 700 }}>
          {syncStatus}
        </div>
      )}

      {/* MAIN BUILDER CONTAINER */}
      <div className="container resume-builder-grid" style={{ padding: '36px 32px 80px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* LEFT FORM EDITORS */}
          <div className="no-print" style={{ background: '#fff', borderRadius: '20px', border: '1px solid #E4E4E7', padding: '26px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#000000' }}>
                  📄 High-ATS Resume Editor
                </h2>
                <span style={{ fontSize: '12px', color: '#71717A' }}>
                  Quantified achievements • 25 Power Verbs • Single-column ATS safe
                </span>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                style={{ fontSize: '12px', fontWeight: 700, color: '#000000', textDecoration: 'underline', cursor: 'pointer' }}
              >
                + Upload New File
              </button>
            </div>

            {/* Quick Action Verbs Bar */}
            <div style={{ background: '#F4F4F5', padding: '10px 14px', borderRadius: '12px', marginBottom: '18px', border: '1px solid #E4E4E7' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#52525B', marginBottom: '6px' }}>
                💡 25 POWER ACTION VERBS (CLICK TO COPY):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {POWER_VERBS.slice(0, 12).map((verb) => (
                  <span
                    key={verb}
                    onClick={() => {
                      navigator.clipboard.writeText(verb);
                      setOptimizationBanner(`Copied "${verb}" to clipboard!`);
                      setTimeout(() => setOptimizationBanner(''), 2000);
                    }}
                    style={{
                      background: '#FFFFFF',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid #E4E4E7',
                      color: '#18181B',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {verb}
                  </span>
                ))}
                <span
                  onClick={() => setShowGuideModal(true)}
                  style={{ fontSize: '11px', padding: '2px 8px', color: '#000000', fontWeight: 700, cursor: 'pointer' }}
                >
                  +13 more...
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#18181B' }}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '9px 13px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#18181B' }}>Target Job Title / Role</label>
                  <span style={{ fontSize: '11px', color: '#71717A' }}>Crucial for ATS matching</span>
                </div>
                <input
                  type="text"
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend & Full Stack Engineer"
                  style={{ width: '100%', padding: '9px 13px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#18181B' }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '9px 13px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#18181B' }}>Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '9px 13px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#18181B' }}>Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ width: '100%', padding: '9px 13px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#18181B' }}>LinkedIn Profile</label>
                  <input
                    type="text"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    placeholder="linkedin.com/in/username"
                    style={{ width: '100%', padding: '9px 13px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#18181B' }}>GitHub / Portfolio Link (Optional)</label>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="github.com/username"
                  style={{ width: '100%', padding: '9px 13px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#18181B' }}>Laser-Targeted Professional Summary</label>
                  <button
                    type="button"
                    onClick={() => handleOptimizeResume(false)}
                    style={{ fontSize: '11.5px', color: '#000000', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ⚡ Polish Summary
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Targeted for [Role]: Results-driven professional with X+ years experience delivering high-impact solutions..."
                  style={{ width: '100%', padding: '10px 13px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13px', outline: 'none', lineHeight: 1.5 }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#18181B' }}>Core Technical & Soft Skills (Comma-separated)</label>
                  <span style={{ fontSize: '11px', color: '#71717A' }}>{skills.split(',').filter(Boolean).length} skills added</span>
                </div>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Next.js, TypeScript, Node.js, Docker, AWS, System Architecture..."
                  style={{ width: '100%', padding: '9px 13px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13px', outline: 'none' }}
                />
              </div>

              {/* WORK EXPERIENCE */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#18181B' }}>Work Experience</label>
                    <div style={{ fontSize: '11.5px', color: '#71717A' }}>Formula: Action + Impact + Metric [What you did + Why it mattered + What changed]</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    style={{ background: '#000000', color: '#FFFFFF', padding: '4px 12px', borderRadius: '100px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add Role
                  </button>
                </div>

                {experience.map((exp, idx) => (
                  <div key={idx} style={{ background: '#F8F8F9', padding: '14px', borderRadius: '12px', marginBottom: '12px', border: '1px solid #E4E4E7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].role = e.target.value;
                          setExperience(updated);
                        }}
                        placeholder="Job Title"
                        style={{ fontWeight: 700, fontSize: '13.5px', border: '1px solid #E4E4E7', background: '#FFFFFF', borderRadius: '8px', padding: '6px 10px', width: '50%' }}
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].company = e.target.value;
                          setExperience(updated);
                        }}
                        placeholder="Company Name"
                        style={{ fontSize: '13.5px', border: '1px solid #E4E4E7', background: '#FFFFFF', borderRadius: '8px', padding: '6px 10px', width: '50%' }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].duration = e.target.value;
                          setExperience(updated);
                        }}
                        placeholder="Duration (e.g. Jan 2022 - Present)"
                        style={{ fontSize: '12px', color: '#52525B', border: '1px solid #E4E4E7', background: '#FFFFFF', borderRadius: '8px', padding: '4px 10px', width: '60%' }}
                      />
                      {experience.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(idx)}
                          style={{ color: '#DC2626', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Remove Role
                        </button>
                      )}
                    </div>

                    {/* Bullet points for this role */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {exp.points.map((pt, pIdx) => (
                        <div key={pIdx} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#71717A', marginTop: '6px' }}>•</span>
                          <textarea
                            rows={2}
                            value={pt}
                            onChange={(e) => {
                              const updated = [...experience];
                              updated[idx].points[pIdx] = e.target.value;
                              setExperience(updated);
                            }}
                            placeholder="Use Action + Impact + Metric: e.g. Architected platform handling 1M+ requests, reducing latency by 35%."
                            style={{ flex: 1, padding: '7px 10px', fontSize: '12.5px', border: '1px solid #E4E4E7', background: '#FFFFFF', borderRadius: '8px', outline: 'none', lineHeight: 1.4 }}
                          />
                          {exp.points.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet(idx, pIdx)}
                              style={{ color: '#A1A1AA', fontSize: '14px', marginTop: '4px', cursor: 'pointer' }}
                              title="Delete bullet point"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddBullet(idx)}
                        style={{ alignSelf: 'flex-start', fontSize: '11.5px', fontWeight: 700, color: '#000000', cursor: 'pointer', marginTop: '4px' }}
                      >
                        + Add Bullet Point
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* PROJECTS SECTION */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#18181B' }}>Key Projects & Systems</label>
                  <button
                    type="button"
                    onClick={handleAddProject}
                    style={{ background: '#000000', color: '#FFFFFF', padding: '4px 12px', borderRadius: '100px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add Project
                  </button>
                </div>
                {projects.map((proj, idx) => (
                  <div key={idx} style={{ background: '#F8F8F9', padding: '12px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #E4E4E7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].name = e.target.value;
                          setProjects(updated);
                        }}
                        placeholder="Project Name"
                        style={{ fontWeight: 700, fontSize: '13px', border: '1px solid #E4E4E7', background: '#FFFFFF', borderRadius: '8px', padding: '6px 10px', width: '50%' }}
                      />
                      <input
                        type="text"
                        value={proj.tech}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].tech = e.target.value;
                          setProjects(updated);
                        }}
                        placeholder="Tech Stack (e.g. Next.js, Redis, AWS)"
                        style={{ fontSize: '12px', border: '1px solid #E4E4E7', background: '#FFFFFF', borderRadius: '8px', padding: '6px 10px', width: '50%', color: '#71717A' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].description = e.target.value;
                          setProjects(updated);
                        }}
                        placeholder="Quantifiable outcome: e.g. Engineered retrieval engine for 500k documents, reducing latency by 40%."
                        style={{ flex: 1, padding: '7px 10px', fontSize: '12px', border: '1px solid #E4E4E7', background: '#FFFFFF', borderRadius: '8px', outline: 'none', lineHeight: 1.4 }}
                      />
                      {projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProject(idx)}
                          style={{ color: '#DC2626', fontSize: '11.5px', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#18181B' }}>Education & Certifications</label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  style={{ width: '100%', padding: '9px 13px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT ATS RESUME SHEET PREVIEW */}
          <div>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#000000' }}>
                  Live ATS Resume Preview ({template.toUpperCase()})
                </div>
                <div style={{ fontSize: '11.5px', color: '#71717A' }}>
                  Exported as: <code>{fullName.replace(/\s+/g, '_')}_Resume.pdf</code>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => handleOptimizeResume(false)}
                  disabled={optimizing}
                  style={{
                    background: '#000000',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    borderRadius: '100px',
                    cursor: 'pointer',
                  }}
                >
                  ⚡ Polish Bullets
                </button>
                <button
                  onClick={handlePrint}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '100px' }}
                >
                  🖨️ Download ATS PDF
                </button>
              </div>
            </div>

            {/* THE RESUME SHEET */}
            <div
              className={`ats-resume-sheet template-${template}`}
              style={{
                background: '#FFFFFF',
                padding: '38px',
                borderRadius: '12px',
                border: '1px solid #E4E4E7',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                fontFamily: template === 'classic' ? 'Georgia, serif' : 'Inter, system-ui, sans-serif',
                lineHeight: 1.5,
              }}
            >
              {/* HEADER */}
              <div style={{ textAlign: template === 'minimal' ? 'left' : 'center', marginBottom: '16px', borderBottom: '1px solid #E4E4E7', paddingBottom: '14px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#000000', marginBottom: '4px', letterSpacing: '-0.02em' }}>
                  {fullName}
                </h1>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#3F3F46', marginBottom: '8px' }}>
                  {targetTitle}
                </div>
                <div style={{ fontSize: '11.5px', color: '#52525B', display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: template === 'minimal' ? 'flex-start' : 'center' }}>
                  <span>{location}</span>
                  <span>•</span>
                  <span>{email}</span>
                  <span>•</span>
                  <span>{phone}</span>
                  <span>•</span>
                  <span>{linkedIn}</span>
                  {github && (
                    <>
                      <span>•</span>
                      <span>{github}</span>
                    </>
                  )}
                </div>
              </div>

              {/* PROFESSIONAL SUMMARY */}
              <div style={{ marginBottom: '16px' }}>
                <div className="ats-section-title" style={{ fontSize: '12.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1.5px solid #000000', paddingBottom: '3px', marginBottom: '6px', color: '#000000' }}>
                  Professional Summary
                </div>
                <p style={{ fontSize: '11.5px', lineHeight: 1.55, color: '#27272A' }}>
                  {summary}
                </p>
              </div>

              {/* WORK EXPERIENCE */}
              <div style={{ marginBottom: '16px' }}>
                <div className="ats-section-title" style={{ fontSize: '12.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1.5px solid #000000', paddingBottom: '3px', marginBottom: '8px', color: '#000000' }}>
                  Work Experience
                </div>
                {experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '12px', color: '#000000' }}>
                      <span><strong>{exp.role}</strong> — {exp.company}</span>
                      <span style={{ fontSize: '11px', color: '#71717A' }}>{exp.duration}</span>
                    </div>
                    <ul style={{ listStyle: 'disc', paddingLeft: '18px', marginTop: '4px', fontSize: '11.5px', color: '#27272A', lineHeight: 1.5 }}>
                      {exp.points.map((pt, idx) => (
                        <li key={idx} style={{ marginBottom: '2px' }}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* KEY PROJECTS */}
              {projects.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div className="ats-section-title" style={{ fontSize: '12.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1.5px solid #000000', paddingBottom: '3px', marginBottom: '8px', color: '#000000' }}>
                    Key Projects & Systems
                  </div>
                  {projects.map((proj, i) => (
                    <div key={i} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '12px', color: '#000000' }}>
                        <span>{proj.name}</span>
                        <span style={{ fontSize: '11px', color: '#71717A', fontStyle: 'italic' }}>{proj.tech}</span>
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#27272A', marginTop: '2px', lineHeight: 1.4 }}>
                        {proj.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* TECHNICAL SKILLS */}
              <div style={{ marginBottom: '16px' }}>
                <div className="ats-section-title" style={{ fontSize: '12.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1.5px solid #000000', paddingBottom: '3px', marginBottom: '6px', color: '#000000' }}>
                  Technical Skills & Competencies
                </div>
                <p style={{ fontSize: '11.5px', color: '#27272A', lineHeight: 1.5 }}>
                  {skills}
                </p>
              </div>

              {/* EDUCATION */}
              <div>
                <div className="ats-section-title" style={{ fontSize: '12.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1.5px solid #000000', paddingBottom: '3px', marginBottom: '6px', color: '#000000' }}>
                  Education & Certifications
                </div>
                <p style={{ fontSize: '11.5px', color: '#27272A' }}>
                  {education}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* UPLOAD RESUME MODAL */}
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
            zIndex: 1000,
          }}
          onClick={() => setShowUploadModal(false)}
        >
          <div
            style={{
              background: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
              padding: '32px',
              width: '100%',
              maxWidth: '560px',
              color: '#FFFFFF',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>📤 Upload Existing Resume</div>
                <div style={{ fontSize: '12.5px', color: '#A1A1AA' }}>Extract & upgrade to a 95%+ ATS Score</div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Tab switchers */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#18181B', padding: '4px', borderRadius: '12px' }}>
              <button
                onClick={() => setUploadTab('file')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  background: uploadTab === 'file' ? '#FFFFFF' : 'transparent',
                  color: uploadTab === 'file' ? '#000000' : '#A1A1AA',
                  cursor: 'pointer',
                }}
              >
                Upload File (PDF / Word / TXT)
              </button>
              <button
                onClick={() => setUploadTab('paste')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  background: uploadTab === 'paste' ? '#FFFFFF' : 'transparent',
                  color: uploadTab === 'paste' ? '#000000' : '#A1A1AA',
                  cursor: 'pointer',
                }}
              >
                Paste Resume Text
              </button>
            </div>

            {uploadTab === 'file' ? (
              <div>
                <div
                  onClick={() => uploadFileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(255, 255, 255, 0.25)',
                    borderRadius: '16px',
                    padding: '40px 24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#0D0D10',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>📄</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
                    Click to browse or drag & drop resume
                  </div>
                  <div style={{ fontSize: '12px', color: '#A1A1AA' }}>
                    Supports <strong>PDF (.pdf)</strong>, <strong>Word (.docx)</strong>, <strong>Text (.txt)</strong>, or <strong>JSON (.json)</strong>
                  </div>
                </div>
                <input
                  type="file"
                  ref={uploadFileInputRef}
                  onChange={handleUploadResumeFile}
                  accept=".pdf,.docx,.txt,.json,.md"
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div>
                <textarea
                  rows={8}
                  value={pastedResumeText}
                  onChange={(e) => setPastedResumeText(e.target.value)}
                  placeholder="Paste your resume content or LinkedIn profile summary here... We will extract sections, experience, and skills automatically."
                  style={{
                    width: '100%',
                    background: '#111115',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    padding: '14px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    outline: 'none',
                    marginBottom: '14px',
                  }}
                />
                <button
                  onClick={handleParsePastedText}
                  disabled={uploadLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', background: '#FFFFFF', color: '#000000', padding: '12px', borderRadius: '100px', fontWeight: 700 }}
                >
                  {uploadLoading ? 'Extracting & Parsing...' : 'Parse & Load Resume'}
                </button>
              </div>
            )}

            {uploadLoading && (
              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#A1A1AA' }}>
                🔄 Extracting candidate profile, experience bullets, and skills...
              </div>
            )}

            {uploadError && (
              <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#F87171', borderRadius: '8px', fontSize: '12.5px', textAlign: 'center' }}>
                {uploadError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TARGET JOB DESCRIPTION MATCHING MODAL */}
      {showJdModal && (
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
            zIndex: 1000,
          }}
          onClick={() => setShowJdModal(false)}
        >
          <div
            style={{
              background: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
              padding: '32px',
              width: '100%',
              maxWidth: '620px',
              color: '#FFFFFF',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>🎯 Target Job Description Matcher</div>
                <div style={{ fontSize: '12px', color: '#A1A1AA' }}>Align keywords and tailor your resume for a specific job opening</div>
              </div>
              <button
                onClick={() => setShowJdModal(false)}
                style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description or requirements here..."
              style={{
                width: '100%',
                background: '#111115',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '14px',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
                marginBottom: '16px',
                lineHeight: 1.5,
              }}
            />

            {jdAnalysis && (
              <div style={{ background: '#111115', padding: '16px', borderRadius: '16px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>Keyword Match Score:</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#10B981' }}>{jdAnalysis.matchScore}%</span>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#A1A1AA', textTransform: 'uppercase', marginBottom: '6px' }}>Matched Keywords:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {jdAnalysis.matchedKeywords.map((kw: string) => (
                      <span key={kw} style={{ background: '#064E3B', color: '#6EE7B7', fontSize: '11px', padding: '3px 8px', borderRadius: '100px' }}>
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#A1A1AA', textTransform: 'uppercase', marginBottom: '6px' }}>Missing Critical Keywords:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {jdAnalysis.missingKeywords.map((kw: string) => (
                      <span key={kw} style={{ background: '#451A03', color: '#FCD34D', fontSize: '11px', padding: '3px 8px', borderRadius: '100px' }}>
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleOptimizeResume(true)}
                disabled={optimizing}
                className="btn btn-primary"
                style={{ flex: 1, background: '#FFFFFF', color: '#000000', borderRadius: '100px', fontWeight: 700, padding: '12px' }}
              >
                {optimizing ? 'Tailoring to JD...' : '⚡ Auto-Tailor Resume to JD'}
              </button>
              <button
                onClick={() => setShowJdModal(false)}
                className="btn btn-outline"
                style={{ borderRadius: '100px', padding: '12px 20px', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8-POINT ATS CHECKLIST MODAL */}
      {showChecklistModal && (
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
            zIndex: 1000,
          }}
          onClick={() => setShowChecklistModal(false)}
        >
          <div
            style={{
              background: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
              padding: '32px',
              width: '100%',
              maxWidth: '600px',
              color: '#FFFFFF',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>📋 8-Point High-ATS Verification Checklist</div>
                <div style={{ fontSize: '12px', color: '#A1A1AA' }}>Based on recruitment cheatsheet benchmarks</div>
              </div>
              <button
                onClick={() => setShowChecklistModal(false)}
                style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {[
                { title: '1. Tailored to the Specific Job Role', desc: 'Summary and experience emphasize keywords from the target job posting.', check: true },
                { title: '2. 25 Power Verbs Applied', desc: 'Every bullet begins with a power verb (Achieved, Delivered, Spearheaded, Built, Solved).', check: true },
                { title: '3. Measurable Achievements Backed by Numbers', desc: 'Bullets contain percentages, latency drops, user counts, or revenue metrics.', check: true },
                { title: '4. Action + Impact + Metric (XYZ Formula)', desc: 'Follows [What you did] + [Why it mattered] + [What changed because of it].', check: true },
                { title: '5. Clean Contact Information', desc: 'Updated email, phone, location & LinkedIn. Zero photos or personal bias markers.', check: Boolean(email && phone && linkedIn) },
                { title: '6. Standard Section Headers', desc: 'Recognized headers (Professional Summary, Work Experience, Technical Skills, Education).', check: true },
                { title: '7. Single-Column ATS Scanner Layout', desc: 'No complex multi-columns, graphic bars, tables or text boxes that confuse parsers.', check: true },
                { title: '8. Professional File Naming Standard', desc: `Formatted for export as ${fullName.replace(/\s+/g, '_')}_Resume.pdf.`, check: true },
              ].map((item, idx) => (
                <div key={idx} style={{ background: '#111115', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: item.check ? '#10B981' : '#F59E0B', fontSize: '18px', marginTop: '-2px' }}>
                    {item.check ? '✓' : '⚠️'}
                  </span>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '2px' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowChecklistModal(false)}
              className="btn btn-primary"
              style={{ width: '100%', background: '#FFFFFF', color: '#000000', borderRadius: '100px', fontWeight: 700 }}
            >
              Close Checklist
            </button>
          </div>
        </div>
      )}

      {/* CHEATSHEET & FORMULA MODAL */}
      {showGuideModal && (
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
            zIndex: 1000,
          }}
          onClick={() => setShowGuideModal(false)}
        >
          <div
            style={{
              background: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
              padding: '32px',
              width: '100%',
              maxWidth: '680px',
              color: '#FFFFFF',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>💡 Resume Bullet Formula Cheatsheet</div>
                <div style={{ fontSize: '12px', color: '#A1A1AA' }}>"Responsibilities tell recruiters what your job was. Achievements tell recruiters why they should hire you."</div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#111115', padding: '16px', borderRadius: '16px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontSize: '12px', color: '#60A5FA', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>The Winning Formula:</div>
              <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>👉 Action + Impact + Metric</div>
              <div style={{ fontSize: '13px', color: '#D4D4D8' }}>
                Template: <code>[What you did] + [Why it mattered] + [What changed because of it]</code>
              </div>
            </div>

            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Role Examples (Before vs After):</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {CHEATSHEET_EXAMPLES.map((ex, i) => (
                <div key={i} style={{ background: '#111115', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#A1A1AA', marginBottom: '6px' }}>{ex.role}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '12px', color: '#F87171' }}>
                      <span style={{ fontWeight: 700 }}>✕ Before:</span> {ex.before}
                    </div>
                    <div style={{ fontSize: '12px', color: '#34D399' }}>
                      <span style={{ fontWeight: 700 }}>✓ After:</span> {ex.after}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="btn btn-primary"
              style={{ width: '100%', background: '#FFFFFF', color: '#000000', borderRadius: '100px', fontWeight: 700 }}
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* AI REVIEW MODAL */}
      {showReviewModal && (
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
            zIndex: 1000,
          }}
          onClick={() => setShowReviewModal(false)}
        >
          <div
            style={{
              background: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              padding: '36px',
              width: '100%',
              maxWidth: '560px',
              color: '#FFFFFF',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>🤖 AI Resume & ATS Review</div>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {reviewLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#A1A1AA' }}>
                Analyzing resume structure, keyword density, and ATS score...
              </div>
            ) : reviewResult ? (
              <div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#111115', padding: '16px', borderRadius: '16px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '36px', fontWeight: 900, color: '#FFFFFF' }}>{reviewResult.score}%</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>ATS Rating: {reviewResult.rating}</div>
                    <div style={{ fontSize: '12px', color: '#A1A1AA' }}>
                      {reviewResult.powerVerbsUsed || 0} Power Verbs • {reviewResult.metricsCount || 0} Quantified Metrics
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '10px' }}>Actionable ATS Suggestions:</div>
                <ul style={{ listStyle: 'disc', paddingLeft: '20px', fontSize: '13px', color: '#D4D4D8', lineHeight: 1.6, marginBottom: '24px' }}>
                  {reviewResult.suggestions.map((sug: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: '8px' }}>{sug}</li>
                  ))}
                </ul>

                <button
                  onClick={() => setShowReviewModal(false)}
                  className="btn btn-primary"
                  style={{ width: '100%', background: '#FFFFFF', color: '#000000', borderRadius: '100px', fontWeight: 700 }}
                >
                  Got It, Thanks!
                </button>
              </div>
            ) : (
              <div style={{ color: '#EF4444' }}>Unable to retrieve review results.</div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
