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

  // Template Style: ivy (Image 5 standard), modern, minimal
  const [template, setTemplate] = useState<'ivy' | 'modern' | 'minimal'>('ivy');

  // Candidate Header Details (from Image 5)
  const [fullName, setFullName] = useState('UTTAKARSH');
  const [targetTitle, setTargetTitle] = useState('A.I. and M.L. Engineer');
  const [phone, setPhone] = useState('+91-7706005995');
  const [email, setEmail] = useState('uttakarsh03@gmail.com');
  const [github, setGithub] = useState('techut30');
  const [linkedIn, setLinkedIn] = useState('Uttakarsh');
  const [location, setLocation] = useState('');

  // Optional Objective / Summary
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState(
    'Targeted for A.I. and M.L. Engineer: Results-driven engineer with deep expertise in developing predictive models, NLP systems, and AI-driven automation pipelines. Proven track record in boosting operational efficiency by 25% and delivering resilient production systems with high user satisfaction.'
  );

  // Education (Image 5 format: Institution, Degree, Duration)
  const [educationList, setEducationList] = useState([
    {
      institution: 'Kalinga Institute of Industrial Technology',
      degree: 'Bachelor of Technology in Computer Engineering',
      duration: 'Oct 2021-May 2025(Pursuing)',
    },
  ]);

  // Categorized Skills (Image 5 exact categories)
  const [skillsCategorized, setSkillsCategorized] = useState({
    languages: 'Python, R, Java, C++, C',
    database: 'SQL, MongoDB',
    frameworks: 'A.I, M.L, Computational Intelligence, Data Structures and Algorithms, O.O.P., N.L.P',
    tools: 'Git/Github, PyCharm, Zed, CLion, Spyder',
    softSkills: 'Leadership, Problem Solving, Teamwork, Content-Writing, Event Management',
  });

  // Projects (Image 5 exact projects)
  const [projects, setProjects] = useState([
    {
      name: 'Hyperspectral Band Selection using GWO',
      tech: 'Python',
      link: 'Link',
      date: 'November, 2024',
      points: [
        'Developed a novel approach to select the optimal spectral bands from hyperspectral images using the Gray Wolf Optimization (GWO) algorithm',
        'Evaluated the performance of the selected bands using K-Nearest Neighbors (KNN) and Random Forest classifiers, optimizing GWO parameters to minimize the classification error rate',
        'Visualized the selected bands as a composite image, providing insights into the most informative regions of the hyperspectral data',
      ],
    },
    {
      name: 'AI Voice Assistant',
      tech: 'Python Automation, Speech Recognition',
      link: 'Link',
      date: 'March, 2024',
      points: [
        'Developed an AI-powered virtual assistant capable of voice recognition and executing user commands like checking time, playing YouTube videos, and web searches',
        'Integrated web scraping functionality to gather relevant online search results and open links directly based on voice input',
        'Implemented features such as mood detection, metadata extraction from images, and Instagram profile data downloading to enhance user interaction and automation',
      ],
    },
    {
      name: 'Discord chat-bot',
      tech: 'Python, Discord API, Open AI API',
      link: 'Link',
      date: 'August, 2023',
      points: [
        "Developed a Discord bot integrated with OpenAI's GPT-3.5 to provide AI-powered responses to user prompts via slash commands",
        'Implemented real-time interaction handling, enabling commands like ping, AI prompts, and dynamic message responses within Discord servers',
        'Utilized asynchronous programming for efficient command processing, AI conversation management, and guild-specific command synchronization',
      ],
    },
    {
      name: 'Multi-threaded Web Crawler Bot',
      tech: 'Java, JSoup , Multi-threading',
      link: 'Link',
      date: 'June, 2023',
      points: [
        'Developed a multi-threaded web crawler in Java to efficiently scrape and process web pages, leveraging the JSoup library for HTML parsing and data extraction.',
        'Implemented recursive crawling with depth control, ensuring that only new, unvisited links are processed while respecting a maximum depth limit.',
        'Optimized web scraping through concurrent processing using threads, allowing for simultaneous crawling of multiple websites, improving overall speed and performance.',
      ],
    },
  ]);

  // Work Experience (Image 5 exact work experience)
  const [experience, setExperience] = useState([
    {
      role: 'Freelance AI and ML Engineer',
      company: '',
      duration: 'January, 2022 - Present',
      points: [
        'Provided AI-driven solutions for 25+ diverse clients across industries, specializing in machine learning and natural language processing.',
        'Developed predictive models using time series analysis and ML techniques to increase client revenue by an average of 20%.',
        'Implemented NLP models for tasks such as sentiment analysis, text classification, and entity recognition, improving data understanding by 30%.',
        'Delivered end-to-end projects from data preprocessing to model deployment, ensuring client satisfaction rates of 95% or higher.',
      ],
    },
    {
      role: 'Head of A.I. and Technical Advisor',
      company: 'Akai',
      duration: 'December, 2023 - Present',
      points: [
        'Architected and implemented RAG-based AI systems to personalize educational content delivery, resulting in a 40% improvement in student engagement metrics.',
        'Led technical recruitment and built an AI team of 8 engineers from scratch, establishing development processes and technical standards.',
        'Developed adaptive learning algorithms that dynamically adjust content difficulty based on student performance, increasing course completion rates by 25%.',
        'Spearheaded the integration of large language models with educational content, reducing content creation time by 60% while maintaining quality standards.',
      ],
    },
  ]);

  // Extra-Curricular Achievements / Leadership (Image 5 exact section)
  const [leadership, setLeadership] = useState([
    'Produced and hosted a podcast in 2023, demonstrating strong communication skills and the ability to engage audiences on various topics.',
    'Organized OTT Fest in 2022, as a key member of TPH, the largest student-led society in Eastern India, showcasing leadership and event management skills.',
    'Was the co-ordinator of the writing wing of the TPH society.',
  ]);

  // Modals & Tools
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

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [optimizing, setOptimizing] = useState(false);
  const [optimizationBanner, setOptimizationBanner] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<string>('');

  // Dynamic ATS Score Calculation
  const calculateAtsScore = () => {
    let score = 60;
    if (fullName && targetTitle && email && phone) score += 10;
    if (educationList.length > 0) score += 8;
    if (skillsCategorized.languages && skillsCategorized.frameworks && skillsCategorized.tools) score += 10;
    if (projects.length >= 2) score += 5;
    if (experience.length >= 1) score += 5;
    return Math.min(score, 98);
  };

  const currentAtsScore = calculateAtsScore();

  // Print PDF with professional file name: Firstname_Lastname_Resume.pdf
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
          showSummary,
          educationList,
          skillsCategorized,
          projects,
          experience,
          leadership,
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
        if (opt.skillsCategorized) setSkillsCategorized(opt.skillsCategorized);
        if (opt.leadership) setLeadership(opt.leadership);
        if (data.jdAnalysis) setJdAnalysis(data.jdAnalysis);
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
    if (res.showSummary !== undefined) setShowSummary(res.showSummary);
    if (res.educationList && res.educationList.length > 0) setEducationList(res.educationList);
    if (res.skillsCategorized) setSkillsCategorized(res.skillsCategorized);
    if (res.experience && res.experience.length > 0) setExperience(res.experience);
    if (res.projects && res.projects.length > 0) setProjects(res.projects);
    if (res.leadership && res.leadership.length > 0) setLeadership(res.leadership);
  };

  // Export JSON
  const handleExportJson = () => {
    const resumeData = {
      fullName,
      targetTitle,
      email,
      phone,
      location,
      linkedIn,
      github,
      showSummary,
      summary,
      educationList,
      skillsCategorized,
      projects,
      experience,
      leadership,
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
          skills: Object.values(skillsCategorized).join(', '),
          education: educationList[0]?.institution,
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

  // Add / Remove helpers
  const handleAddExperience = () => {
    setExperience([
      ...experience,
      {
        role: 'Role Title',
        company: 'Company Name',
        duration: '2023 - Present',
        points: ['Spearheaded core feature implementation, increasing user engagement by 24%.'],
      },
    ]);
  };

  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        name: 'New Project Title',
        tech: 'Python, Machine Learning',
        link: 'Link',
        date: '2024',
        points: ['Developed high-accuracy classification pipeline achieving 94% precision.'],
      },
    ]);
  };

  const handleAddLeadership = () => {
    setLeadership([
      ...leadership,
      'Organized technical workshops and mentored 50+ students in machine learning algorithms.',
    ]);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO BANNER */}
      <div className="no-print" style={{ background: '#000000', color: '#fff', padding: '44px 0 36px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div className="eyebrow" style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
              ⚡ High-ATS Resume Engine • Ivy/Tech Standard Template
            </div>
            <h1 style={{ fontSize: '34px', color: '#fff', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>
              High-ATS Resume Builder & Optimizer
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14.5px', maxWidth: '680px', lineHeight: 1.5 }}>
              Standardized single-column Ivy/Tech format with <strong>25 Power Verbs</strong> and the <strong>Action + Impact + Metric formula</strong> (`[What you did] + [Why it mattered] + [What changed because of it]`).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: '#111115', padding: '12px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ATS Score</div>
              <div style={{ fontSize: '30px', fontWeight: 900, color: currentAtsScore >= 90 ? '#10B981' : '#FFFFFF' }}>
                {currentAtsScore}%
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                {currentAtsScore >= 90 ? '✓ Top 5% ATS Ready' : 'Optimization Active'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn btn-primary"
                style={{ background: '#FFFFFF', color: '#000000', padding: '10px 18px', fontSize: '13px', fontWeight: 700, borderRadius: '100px' }}
              >
                📤 Upload Existing Resume
              </button>

              <button
                onClick={() => handleOptimizeResume(false)}
                disabled={optimizing}
                className="btn btn-outline"
                style={{ background: '#18181B', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.25)', padding: '10px 18px', fontSize: '12.5px', fontWeight: 700, borderRadius: '100px' }}
              >
                {optimizing ? '🔄 Polishing Resume...' : '⚡ 1-Click High-ATS Polish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK SHORTCUT ACTIONS BAR */}
      <div className="no-print" style={{ background: '#FFFFFF', borderBottom: '1px solid #E4E4E7', padding: '10px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#71717A' }}>STYLE:</span>
            {[
              { id: 'ivy', label: 'Ivy / Tech (Image 5)' },
              { id: 'modern', label: 'Modern Sans' },
              { id: 'minimal', label: 'Minimal' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id as any)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: template === t.id ? '#000000' : '#F4F4F5',
                  color: template === t.id ? '#FFFFFF' : '#3F3F46',
                  cursor: 'pointer',
                }}
              >
                {t.label}
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
                cursor: 'pointer',
              }}
            >
              🎯 Target JD Matcher {jobDescription ? '(Matched)' : ''}
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
              📋 8-Point Checklist
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
              💡 Bullet Formula
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

      {/* MAIN BUILDER CONTAINER */}
      <div className="container resume-builder-grid" style={{ padding: '32px 32px 80px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* LEFT FORM EDITORS */}
          <div className="no-print" style={{ background: '#fff', borderRadius: '20px', border: '1px solid #E4E4E7', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#000000' }}>
                  📄 High-ATS Resume Editor
                </h2>
                <span style={{ fontSize: '12px', color: '#71717A' }}>
                  Image 5 Template Formatter • Standardized Sections
                </span>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                style={{ fontSize: '12px', fontWeight: 700, color: '#000000', textDecoration: 'underline', cursor: 'pointer' }}
              >
                + Upload Resume
              </button>
            </div>

            {/* Quick Action Verbs Bar */}
            <div style={{ background: '#F4F4F5', padding: '10px 12px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E4E4E7' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#52525B', marginBottom: '4px' }}>
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
                      fontSize: '10.5px',
                      padding: '2px 7px',
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
                  style={{ fontSize: '11px', padding: '2px 7px', color: '#000000', fontWeight: 700, cursor: 'pointer' }}
                >
                  +13 more...
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* CONTACT DETAILS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#18181B' }}>Full Name (Uppercase)</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#18181B' }}>Target Title / Role</label>
                  <input
                    type="text"
                    value={targetTitle}
                    onChange={(e) => setTargetTitle(e.target.value)}
                    placeholder="e.g. A.I. and M.L. Engineer"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#18181B' }}>Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#18181B' }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#18181B' }}>GitHub Handle</label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="e.g. techut30"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#18181B' }}>LinkedIn Handle / Name</label>
                  <input
                    type="text"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    placeholder="e.g. Uttakarsh"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              {/* OPTIONAL SUMMARY TOGGLE */}
              <div style={{ border: '1px solid #E4E4E7', borderRadius: '10px', padding: '10px 12px', background: '#F8F8F9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#18181B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="checkbox"
                      checked={showSummary}
                      onChange={(e) => setShowSummary(e.target.checked)}
                    />
                    Include Career Objective / Professional Summary
                  </label>
                  <span style={{ fontSize: '11px', color: '#71717A' }}>
                    {showSummary ? 'Visible at top' : 'Hidden (Image 5 style)'}
                  </span>
                </div>
                {showSummary && (
                  <textarea
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Objective / Summary statement..."
                    style={{ width: '100%', marginTop: '8px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E4E4E7', fontSize: '12px', outline: 'none', lineHeight: 1.4 }}
                  />
                )}
              </div>

              {/* EDUCATION SECTION */}
              <div style={{ borderTop: '1px solid #E4E4E7', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#18181B' }}>EDUCATION</label>
                </div>
                {educationList.map((edu, idx) => (
                  <div key={idx} style={{ background: '#F8F8F9', padding: '10px', borderRadius: '8px', border: '1px solid #E4E4E7', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...educationList];
                        updated[idx].institution = e.target.value;
                        setEducationList(updated);
                      }}
                      placeholder="Institution Name"
                      style={{ fontWeight: 700, fontSize: '13px', border: 'none', background: 'transparent', width: '100%', marginBottom: '4px', outline: 'none' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...educationList];
                          updated[idx].degree = e.target.value;
                          setEducationList(updated);
                        }}
                        placeholder="Degree (Italicized)"
                        style={{ fontStyle: 'italic', fontSize: '12px', border: 'none', background: 'transparent', width: '60%', outline: 'none' }}
                      />
                      <input
                        type="text"
                        value={edu.duration}
                        onChange={(e) => {
                          const updated = [...educationList];
                          updated[idx].duration = e.target.value;
                          setEducationList(updated);
                        }}
                        placeholder="Dates (e.g. Oct 2021-May 2025)"
                        style={{ fontSize: '11.5px', border: 'none', background: 'transparent', width: '38%', textAlign: 'right', outline: 'none' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* CATEGORIZED SKILLS */}
              <div style={{ borderTop: '1px solid #E4E4E7', paddingTop: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#18181B', display: 'block', marginBottom: '8px' }}>
                  SKILLS (CATEGORIZED AS IN IMAGE 5)
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#52525B' }}>Languages:</label>
                    <input
                      type="text"
                      value={skillsCategorized.languages}
                      onChange={(e) => setSkillsCategorized({ ...skillsCategorized, languages: e.target.value })}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E4E4E7', fontSize: '12px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#52525B' }}>Database Architecture:</label>
                    <input
                      type="text"
                      value={skillsCategorized.database}
                      onChange={(e) => setSkillsCategorized({ ...skillsCategorized, database: e.target.value })}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E4E4E7', fontSize: '12px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#52525B' }}>IT Constructs / Frameworks:</label>
                    <input
                      type="text"
                      value={skillsCategorized.frameworks}
                      onChange={(e) => setSkillsCategorized({ ...skillsCategorized, frameworks: e.target.value })}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E4E4E7', fontSize: '12px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#52525B' }}>Tools:</label>
                    <input
                      type="text"
                      value={skillsCategorized.tools}
                      onChange={(e) => setSkillsCategorized({ ...skillsCategorized, tools: e.target.value })}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E4E4E7', fontSize: '12px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#52525B' }}>Soft Skills:</label>
                    <input
                      type="text"
                      value={skillsCategorized.softSkills}
                      onChange={(e) => setSkillsCategorized({ ...skillsCategorized, softSkills: e.target.value })}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E4E4E7', fontSize: '12px', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* PROJECTS SECTION */}
              <div style={{ borderTop: '1px solid #E4E4E7', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#18181B' }}>PROJECTS</label>
                  <button
                    type="button"
                    onClick={handleAddProject}
                    style={{ background: '#000000', color: '#FFFFFF', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add Project
                  </button>
                </div>

                {projects.map((proj, idx) => (
                  <div key={idx} style={{ background: '#F8F8F9', padding: '10px', borderRadius: '8px', border: '1px solid #E4E4E7', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].name = e.target.value;
                          setProjects(updated);
                        }}
                        placeholder="Project Name"
                        style={{ fontWeight: 700, fontSize: '12.5px', border: 'none', background: 'transparent', width: '50%', outline: 'none' }}
                      />
                      <input
                        type="text"
                        value={proj.date}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].date = e.target.value;
                          setProjects(updated);
                        }}
                        placeholder="Date (e.g. November, 2024)"
                        style={{ fontSize: '11.5px', border: 'none', background: 'transparent', width: '45%', textAlign: 'right', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                      <input
                        type="text"
                        value={proj.tech}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].tech = e.target.value;
                          setProjects(updated);
                        }}
                        placeholder="Tech Stack (e.g. Python, Speech Recognition)"
                        style={{ fontSize: '11.5px', color: '#52525B', border: 'none', background: 'transparent', width: '70%', outline: 'none' }}
                      />
                      <input
                        type="text"
                        value={proj.link}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].link = e.target.value;
                          setProjects(updated);
                        }}
                        placeholder="Link text"
                        style={{ fontSize: '11.5px', color: '#2563EB', textDecoration: 'underline', border: 'none', background: 'transparent', width: '25%', textAlign: 'right', outline: 'none' }}
                      />
                    </div>

                    {proj.points.map((pt, pIdx) => (
                      <div key={pIdx} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#71717A' }}>•</span>
                        <textarea
                          rows={2}
                          value={pt}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].points[pIdx] = e.target.value;
                            setProjects(updated);
                          }}
                          style={{ flex: 1, padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #E4E4E7', outline: 'none', lineHeight: 1.35 }}
                        />
                        {proj.points.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...projects];
                              updated[idx].points = updated[idx].points.filter((_, i) => i !== pIdx);
                              setProjects(updated);
                            }}
                            style={{ color: '#A1A1AA', fontSize: '12px', cursor: 'pointer' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...projects];
                        updated[idx].points.push('Optimized system throughput by 30% through caching.');
                        setProjects(updated);
                      }}
                      style={{ fontSize: '11px', color: '#000000', fontWeight: 700, cursor: 'pointer', marginTop: '2px' }}
                    >
                      + Add Bullet
                    </button>
                  </div>
                ))}
              </div>

              {/* WORK EXPERIENCE */}
              <div style={{ borderTop: '1px solid #E4E4E7', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#18181B' }}>WORK EXPERIENCE</label>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    style={{ background: '#000000', color: '#FFFFFF', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add Role
                  </button>
                </div>

                {experience.map((exp, idx) => (
                  <div key={idx} style={{ background: '#F8F8F9', padding: '10px', borderRadius: '8px', border: '1px solid #E4E4E7', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                      <input
                        type="text"
                        value={exp.role + (exp.company ? `, ${exp.company}` : '')}
                        onChange={(e) => {
                          const updated = [...experience];
                          const val = e.target.value;
                          if (val.includes(',')) {
                            const [r, c] = val.split(',');
                            updated[idx].role = r.trim();
                            updated[idx].company = c.trim();
                          } else {
                            updated[idx].role = val;
                            updated[idx].company = '';
                          }
                          setExperience(updated);
                        }}
                        placeholder="Role Name, Company Name"
                        style={{ fontWeight: 700, fontSize: '12.5px', border: 'none', background: 'transparent', width: '55%', outline: 'none' }}
                      />
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].duration = e.target.value;
                          setExperience(updated);
                        }}
                        placeholder="Duration (e.g. January, 2022 - Present)"
                        style={{ fontSize: '11.5px', border: 'none', background: 'transparent', width: '40%', textAlign: 'right', outline: 'none' }}
                      />
                    </div>

                    {exp.points.map((pt, pIdx) => (
                      <div key={pIdx} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#71717A' }}>•</span>
                        <textarea
                          rows={2}
                          value={pt}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[idx].points[pIdx] = e.target.value;
                            setExperience(updated);
                          }}
                          style={{ flex: 1, padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #E4E4E7', outline: 'none', lineHeight: 1.35 }}
                        />
                        {exp.points.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...experience];
                              updated[idx].points = updated[idx].points.filter((_, i) => i !== pIdx);
                              setExperience(updated);
                            }}
                            style={{ color: '#A1A1AA', fontSize: '12px', cursor: 'pointer' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...experience];
                        updated[idx].points.push('Accelerated project delivery by 25% using automated CI/CD pipelines.');
                        setExperience(updated);
                      }}
                      style={{ fontSize: '11px', color: '#000000', fontWeight: 700, cursor: 'pointer', marginTop: '2px' }}
                    >
                      + Add Bullet
                    </button>
                  </div>
                ))}
              </div>

              {/* EXTRA-CURRICULAR / LEADERSHIP */}
              <div style={{ borderTop: '1px solid #E4E4E7', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#18181B' }}>EXTRA-CURRICULAR ACHIEVEMENTS / LEADERSHIP</label>
                  <button
                    type="button"
                    onClick={handleAddLeadership}
                    style={{ background: '#000000', color: '#FFFFFF', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add Item
                  </button>
                </div>

                {leadership.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#71717A' }}>•</span>
                    <textarea
                      rows={2}
                      value={item}
                      onChange={(e) => {
                        const updated = [...leadership];
                        updated[idx] = e.target.value;
                        setLeadership(updated);
                      }}
                      style={{ flex: 1, padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #E4E4E7', outline: 'none', lineHeight: 1.35 }}
                    />
                    {leadership.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setLeadership(leadership.filter((_, i) => i !== idx))}
                        style={{ color: '#A1A1AA', fontSize: '12px', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* RIGHT ATS RESUME SHEET PREVIEW (IMAGE 5 TEMPLATE) */}
          <div>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#000000' }}>
                  Live ATS Resume Preview ({template === 'ivy' ? 'Ivy / Tech Standard' : template.toUpperCase()})
                </div>
                <div style={{ fontSize: '11.5px', color: '#71717A' }}>
                  File: <code>{fullName.replace(/\s+/g, '_')}_Resume.pdf</code>
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
                    fontSize: '12px',
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

            {/* THE RESUME SHEET (MATCHES IMAGE 5 PIXEL-PERFECTLY) */}
            <div
              className={`ats-resume-sheet template-${template}`}
              style={{
                background: '#FFFFFF',
                padding: '36px 42px',
                borderRadius: '8px',
                border: '1px solid #D4D4D8',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                fontFamily: template === 'ivy' ? '"Times New Roman", Times, "Computer Modern", Georgia, serif' : 'Inter, system-ui, sans-serif',
                color: '#000000',
                lineHeight: 1.4,
              }}
            >
              {/* 1. HEADER */}
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 2px 0', color: '#000000' }}>
                  {fullName}
                </h1>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#18181B', marginBottom: '6px' }}>
                  {targetTitle}
                </div>
                <div style={{ fontSize: '11px', color: '#27272A', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <span>📞 {phone}</span>
                  <span>✉️ {email}</span>
                  {github && <span>💻 {github}</span>}
                  {linkedIn && <span>in {linkedIn}</span>}
                </div>
              </div>

              {/* OPTIONAL OBJECTIVE / SUMMARY */}
              {showSummary && summary && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1.5px solid #000000', paddingBottom: '2px', marginBottom: '4px', letterSpacing: '0.03em' }}>
                    OBJECTIVE
                  </div>
                  <p style={{ fontSize: '11px', lineHeight: 1.4, margin: '0 0 4px 0', textAlign: 'justify' }}>
                    {summary}
                  </p>
                </div>
              )}

              {/* 2. EDUCATION */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1.5px solid #000000', paddingBottom: '2px', marginBottom: '4px', letterSpacing: '0.03em' }}>
                  EDUCATION
                </div>
                {educationList.map((edu, idx) => (
                  <div key={idx} style={{ marginBottom: '3px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700, fontSize: '11.5px' }}>{edu.institution}</span>
                      <span style={{ fontWeight: 700, fontSize: '11px' }}>{edu.duration}</span>
                    </div>
                    <div style={{ fontStyle: 'italic', fontSize: '11px', color: '#18181B' }}>
                      {edu.degree}
                    </div>
                  </div>
                ))}
              </div>

              {/* 3. SKILLS */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1.5px solid #000000', paddingBottom: '2px', marginBottom: '5px', letterSpacing: '0.03em' }}>
                  SKILLS
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', lineHeight: 1.35 }}>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 700, width: '175px', verticalAlign: 'top', padding: '1px 0' }}>Languages:</td>
                      <td style={{ verticalAlign: 'top', padding: '1px 0' }}>{skillsCategorized.languages}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, width: '175px', verticalAlign: 'top', padding: '1px 0' }}>Database Architecture:</td>
                      <td style={{ verticalAlign: 'top', padding: '1px 0' }}>{skillsCategorized.database}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, width: '175px', verticalAlign: 'top', padding: '1px 0' }}>IT Constructs:</td>
                      <td style={{ verticalAlign: 'top', padding: '1px 0' }}>{skillsCategorized.frameworks}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, width: '175px', verticalAlign: 'top', padding: '1px 0' }}>Tools:</td>
                      <td style={{ verticalAlign: 'top', padding: '1px 0' }}>{skillsCategorized.tools}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, width: '175px', verticalAlign: 'top', padding: '1px 0' }}>Soft Skills:</td>
                      <td style={{ verticalAlign: 'top', padding: '1px 0' }}>{skillsCategorized.softSkills}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 4. PROJECTS */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1.5px solid #000000', paddingBottom: '2px', marginBottom: '5px', letterSpacing: '0.03em' }}>
                  PROJECTS
                </div>
                {projects.map((proj, idx) => (
                  <div key={idx} style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '11.5px' }}>{proj.name}</span>
                        <span style={{ fontSize: '11px' }}> | {proj.tech} </span>
                        {proj.link && (
                          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#2563EB', textDecoration: 'underline', fontSize: '11px', fontWeight: 600 }}>
                            {proj.link}
                          </a>
                        )}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '11px' }}>{proj.date}</span>
                    </div>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '18px', margin: '2px 0 0 0' }}>
                      {proj.points.map((pt, pIdx) => (
                        <li key={pIdx} style={{ fontSize: '11px', lineHeight: 1.35, marginBottom: '1.5px', textAlign: 'justify' }}>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* 5. WORK EXPERIENCE */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1.5px solid #000000', paddingBottom: '2px', marginBottom: '5px', letterSpacing: '0.03em' }}>
                  WORK EXPERIENCE
                </div>
                {experience.map((exp, idx) => (
                  <div key={idx} style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700, fontSize: '11.5px' }}>
                        {exp.role}{exp.company ? `, ${exp.company}` : ''}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '11px' }}>{exp.duration}</span>
                    </div>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '18px', margin: '2px 0 0 0' }}>
                      {exp.points.map((pt, pIdx) => (
                        <li key={pIdx} style={{ fontSize: '11px', lineHeight: 1.35, marginBottom: '1.5px', textAlign: 'justify' }}>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* 6. EXTRA-CURRICULAR ACHIEVEMENTS / LEADERSHIP */}
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1.5px solid #000000', paddingBottom: '2px', marginBottom: '5px', letterSpacing: '0.03em' }}>
                  EXTRA-CURRICULAR ACHIEVEMENTS / LEADERSHIP
                </div>
                <ul style={{ listStyleType: 'disc', paddingLeft: '18px', margin: '2px 0 0 0' }}>
                  {leadership.map((item, idx) => (
                    <li key={idx} style={{ fontSize: '11px', lineHeight: 1.35, marginBottom: '1.5px', textAlign: 'justify' }}>
                      {item}
                    </li>
                  ))}
                </ul>
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
                <div style={{ fontSize: '12.5px', color: '#A1A1AA' }}>Extract & format into the Ivy/Tech standard template</div>
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
                    padding: '36px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#0D0D10',
                  }}
                >
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>📄</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
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
                  placeholder="Paste your resume content or LinkedIn profile text here..."
                  style={{
                    width: '100%',
                    background: '#111115',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    padding: '12px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    lineHeight: 1.4,
                    outline: 'none',
                    marginBottom: '12px',
                  }}
                />
                <button
                  onClick={handleParsePastedText}
                  disabled={uploadLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', background: '#FFFFFF', color: '#000000', padding: '12px', borderRadius: '100px', fontWeight: 700 }}
                >
                  {uploadLoading ? 'Extracting & Parsing...' : 'Parse & Format Resume'}
                </button>
              </div>
            )}

            {uploadLoading && (
              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#A1A1AA' }}>
                🔄 Extracting candidate profile, education, skills, projects, and work experience...
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
                <div style={{ fontSize: '12px', color: '#A1A1AA' }}>Align skills and weave in keywords naturally</div>
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
                padding: '12px',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
                marginBottom: '16px',
                lineHeight: 1.4,
              }}
            />

            {jdAnalysis && (
              <div style={{ background: '#111115', padding: '14px', borderRadius: '14px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>Keyword Match Score:</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#10B981' }}>{jdAnalysis.matchScore}%</span>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#A1A1AA', textTransform: 'uppercase', marginBottom: '4px' }}>Matched Keywords:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {jdAnalysis.matchedKeywords.map((kw: string) => (
                      <span key={kw} style={{ background: '#064E3B', color: '#6EE7B7', fontSize: '10.5px', padding: '2px 8px', borderRadius: '100px' }}>
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#A1A1AA', textTransform: 'uppercase', marginBottom: '4px' }}>Missing Critical Keywords:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {jdAnalysis.missingKeywords.map((kw: string) => (
                      <span key={kw} style={{ background: '#451A03', color: '#FCD34D', fontSize: '10.5px', padding: '2px 8px', borderRadius: '100px' }}>
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
                {optimizing ? 'Tailoring...' : '⚡ Auto-Tailor Resume to JD'}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {[
                { title: '1. Standard Section Headings', desc: 'EDUCATION, SKILLS, PROJECTS, WORK EXPERIENCE, LEADERSHIP for 100% parser compliance.', check: true },
                { title: '2. 25 Power Verbs Applied', desc: 'Every bullet begins with a power verb (Achieved, Delivered, Developed, Spearheaded, Built).', check: true },
                { title: '3. Measurable Achievements Backed by Numbers', desc: 'Accomplishments include % gains, client numbers (25+), error reduction, and throughput.', check: true },
                { title: '4. Action + Impact + Metric (XYZ Formula)', desc: 'Follows [What you did] + [Why it mattered] + [What changed because of it].', check: true },
                { title: '5. Categorized Technical & Soft Skills', desc: 'Neatly organized into Languages, Database Architecture, IT Constructs, Tools, and Soft Skills.', check: true },
                { title: '6. Clean Contact Information', desc: 'Full name, target title, phone, email, GitHub, and verified LinkedIn (zero photos or bias markers).', check: true },
                { title: '7. Single-Column ATS Scanner Layout', desc: 'Linear hierarchy matching Image 5 without complex columns or graphics that break ATS parsers.', check: true },
                { title: '8. Professional File Naming Standard', desc: `Saved automatically as ${fullName.replace(/\s+/g, '_')}_Resume.pdf.`, check: true },
              ].map((item, idx) => (
                <div key={idx} style={{ background: '#111115', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10B981', fontSize: '16px', marginTop: '-1px' }}>✓</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{item.title}</div>
                    <div style={{ fontSize: '11.5px', color: '#A1A1AA', marginTop: '2px' }}>{item.desc}</div>
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

            <div style={{ background: '#111115', padding: '14px', borderRadius: '14px', marginBottom: '18px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontSize: '11.5px', color: '#60A5FA', fontWeight: 700, textTransform: 'uppercase', marginBottom: '3px' }}>The Winning Formula:</div>
              <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>👉 Action + Impact + Metric</div>
              <div style={{ fontSize: '12.5px', color: '#D4D4D8' }}>
                Template: <code>[What you did] + [Why it mattered] + [What changed because of it]</code>
              </div>
            </div>

            <div style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '10px' }}>Role Examples (Before vs After):</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {CHEATSHEET_EXAMPLES.map((ex, i) => (
                <div key={i} style={{ background: '#111115', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#A1A1AA', marginBottom: '4px' }}>{ex.role}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ fontSize: '11.5px', color: '#F87171' }}>
                      <span style={{ fontWeight: 700 }}>✕ Before:</span> {ex.before}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#34D399' }}>
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
