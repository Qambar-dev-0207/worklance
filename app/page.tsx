'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AiToolkitShowcase from '@/components/AiToolkitShowcase';

export default function Home() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'seeker' | 'recruiter'>('seeker');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [heroQuery, setHeroQuery] = useState('');

  // New interactive states for AI ROI Chart & Pricing
  const [activeRoiMetric, setActiveRoiMetric] = useState<'time' | 'cost' | 'quality' | 'manual' | 'team'>('time');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [pricingCategory, setPricingCategory] = useState<'recruiter' | 'seeker'>('recruiter');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroQuery.trim()) {
      router.push(`/jobs?keyword=${encodeURIComponent(heroQuery.trim())}`);
    } else {
      router.push('/jobs');
    }
  };

  const roiMetrics = {
    time: {
      title: 'TIME',
      traditional: '30 days',
      ai: '3 hours',
      desc: 'From posting a role to sending a verified offer letter',
    },
    cost: {
      title: 'COST',
      traditional: '₹45,000',
      ai: '₹3,500',
      desc: 'Agency fees and screening expenses per hire',
    },
    quality: {
      title: 'QUALITY',
      traditional: '65% match',
      ai: '98% match',
      desc: 'Candidate role fit and technical interview score correlation',
    },
    manual: {
      title: 'MANUAL',
      traditional: '40 hrs/wk',
      ai: '15 mins/wk',
      desc: 'Time spent reviewing resumes and scheduling calls',
    },
    team: {
      title: 'TEAM',
      traditional: '4-5 Recruiters',
      ai: '1 Lead + AI',
      desc: 'Staffing required to screen and interview candidate volume',
    },
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('worklance_user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className={`nav ${isScrolled ? 'scrolled' : ''}`} id="nav">
        <div className="container nav-inner">
          <Link href="/" className="logo">
            <img src="/logo.png" alt="Worklance Logo" className="logo-mark-img" width={34} height={34} />
            Worklance
          </Link>
          <div className="nav-links">
            <Link href="/jobs">Job Hub</Link>
            <Link href="/hackathons">Hackathons</Link>
            <Link href="/hr-database">HR Directory</Link>
            <Link href="/interview-prep">Interview Prep</Link>
            <Link href="/resume-builder">Resume Builder</Link>
          </div>
          <div className="nav-cta">
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 600 }}>Hi, {currentUser.name}</span>
                <Link href="/profile" className="btn btn-outline" style={{ padding: '7px 16px', fontSize: '13px' }}>
                  My Profile
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost">Log in</Link>
                <Link href="/register" className="btn btn-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 3D SLEEK HERO SECTION */}
      <header className="hero">
        <div className="hero-3d-grid-floor"></div>
        <div className="hero-3d-spotlight"></div>

        <div className="container hero-grid">
          {/* LEFT: MINIMALIST BOLD TYPOGRAPHY & COMMAND SEARCH */}
          <div>
            <div className="eyebrow" style={{ background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.18)', marginBottom: '18px' }}>
              <span className="hero-beacon"></span>
              Autonomous Career OS · AI Automated
            </div>

            <h1>
              Architect Your Career.<br />
              <span className="hero-3d-gradient-text">Hired in 10 Minutes.</span>
            </h1>

            <p className="lead">
              The unified intelligence platform that merges AI job matchmaking, verified recruiter direct access, automated voice screening, and bot-proof ATS resume engineering.
            </p>

            {/* COMMAND SEARCH BAR */}
            <form onSubmit={handleHeroSearch} className="hero-command-box">
              <span style={{ fontSize: '16px', opacity: 0.7 }}>🔍</span>
              <input
                type="text"
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
                placeholder="Search 10,000+ AI-screened tech roles..."
                className="hero-command-input"
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ background: '#FFFFFF', color: '#000000', borderRadius: '100px', padding: '10px 22px', fontSize: '13px', fontWeight: 800, whiteSpace: 'nowrap' }}
              >
                Find Roles
              </button>
            </form>

            {/* QUICK SHORTCUT PILLS */}
            <div className="hero-tags-row">
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Quick Filter:</span>
              <button type="button" onClick={() => router.push('/jobs?keyword=Remote')} className="hero-tag-btn">⚡ Remote</button>
              <button type="button" onClick={() => router.push('/jobs?keyword=Full%20Stack')} className="hero-tag-btn">💻 Full Stack</button>
              <button type="button" onClick={() => router.push('/jobs?keyword=AI')} className="hero-tag-btn">🤖 AI / ML</button>
              <button type="button" onClick={() => router.push('/jobs?location=Bengaluru')} className="hero-tag-btn">📍 Bengaluru</button>
            </div>

            {/* TRUST INDICATORS */}
            <div className="hero-trust-metrics">
              <span><span className="hero-beacon"></span> 10-Minute Offer Pipeline</span>
              <span><span className="hero-beacon"></span> 98.4% ATS Accuracy</span>
              <span><span className="hero-beacon"></span> Verified Direct HRs</span>
            </div>
          </div>

          {/* RIGHT: 3D MULTI-LAYER FLOATING INTERFACE DECK */}
          <div className="hero-3d-stage">
            <div className="hero-3d-card-deck">
              {/* SATELLITE 1: TOP-RIGHT FAST-TRACK PILL */}
              <div className="hero-sat-card sat-top-right">
                <span className="hero-beacon"></span>
                <span>⚡ 10-Min Fast Track Verified</span>
              </div>

              {/* MAIN 3D GLASS DECK */}
              <div className="hero-main-deck">
                <div className="cross-corner cross-tl">+</div>
                <div className="cross-corner cross-tr">+</div>
                <div className="cross-corner cross-bl">+</div>
                <div className="cross-corner cross-br">+</div>

                {/* Candidate Header */}
                <div className="hero-deck-header">
                  <div className="hero-candidate-info">
                    <div className="hero-candidate-avatar">RS</div>
                    <div>
                      <div className="hero-candidate-name">Riya Sharma</div>
                      <div className="hero-candidate-role">Senior Full Stack Engineer</div>
                    </div>
                  </div>
                  <div className="hero-match-badge">99.2% MATCH</div>
                </div>

                {/* 3-Stage Pipeline Tracker */}
                <div className="hero-pipeline-tracker">
                  <div className="hero-pipeline-title">
                    <span>Autonomous Pipeline</span>
                    <span style={{ color: '#FFFFFF' }}>00:09:42 Elapsed</span>
                  </div>
                  <div className="hero-pipeline-steps">
                    <div className="hero-p-step done">
                      <div className="hero-p-dot">✓</div>
                      <span className="hero-p-label">AI Screen</span>
                    </div>
                    <div className="hero-p-step done">
                      <div className="hero-p-dot">✓</div>
                      <span className="hero-p-label">AI Video</span>
                    </div>
                    <div className="hero-p-step active">
                      <div className="hero-p-dot">●</div>
                      <span className="hero-p-label">Offer Out</span>
                    </div>
                  </div>
                </div>

                {/* Matched Role Details */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Matched Company:</span>
                    <span style={{ fontWeight: 800, color: '#FFFFFF' }}>Zenith Tech Labs</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Compensation Benchmark:</span>
                    <span style={{ fontWeight: 800, color: '#FFFFFF' }}>₹28,00,000 - ₹35,00,000</span>
                  </div>
                </div>
              </div>

              {/* SATELLITE 2: BOTTOM-LEFT AI VOICE SCREENING CARD */}
              <div className="hero-sat-card sat-bottom-left">
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🤖 AI Voice Interview Bot
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF', marginTop: '3px' }}>
                  &ldquo;Candidate demonstrated deep Next.js 14 RSC and microservices knowledge.&rdquo;
                </div>
                <div className="sat-waveform">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* AI CAREER TOOLKIT SHOWCASE (MOCKUP SECTION) */}
      <AiToolkitShowcase />

      {/* FEATURES */}
      <section className="section-pad" id="features">
        <div className="container">
          <div className="sec-head reveal">
            <div className="eyebrow">Platform</div>
            <h2>Six tools. One career operating system.</h2>
            <p>No more juggling five tabs for a job search. Worklance connects every step so nothing falls through the cracks.</p>
          </div>
          <div className="feat-grid">
            <div className="feat-card reveal">
              <span className="num">01</span>
              <div className="feat-icon">📄</div>
              <h3>ATS Resume Builder</h3>
              <p>Professional, ATS-friendly templates with AI suggestions, a live resume score and grammar checks — export as PDF in minutes.</p>
              <div className="feat-tags"><span>AI Suggestions</span><span>Resume Score</span><span>Cover Letters</span></div>
            </div>
            <div className="feat-card reveal">
              <span className="num">02</span>
              <div className="feat-icon">🔍</div>
              <h3>Job Search</h3>
              <p>Filter by location, salary, skills and work type. Save roles, apply in one click and track every application from one dashboard.</p>
              <div className="feat-tags"><span>Easy Apply</span><span>Remote/Hybrid</span><span>Tracking</span></div>
            </div>
            <div className="feat-card reveal">
              <span className="num">03</span>
              <div className="feat-icon">👤</div>
              <h3>HR Database</h3>
              <p>Reach verified HR contacts directly — name, company, designation, email and LinkedIn — filtered by industry, city and role.</p>
              <div className="feat-tags"><span>Verified Contacts</span><span>Premium</span></div>
            </div>
            <div className="feat-card reveal">
              <span className="num">04</span>
              <div className="feat-icon">📚</div>
              <h3>Previous Year Questions</h3>
              <p>Company-wise interview questions from TCS, Infosys, Google, Amazon and more — sorted by HR, technical, coding and GD rounds.</p>
              <div className="feat-tags"><span>Company-wise</span><span>Coding</span><span>Aptitude</span></div>
            </div>
            <div className="feat-card reveal">
              <span className="num">05</span>
              <div className="feat-icon">🎤</div>
              <h3>Interview Preparation</h3>
              <p>Practice with AI-powered mock interviews, get instant feedback and prep with company-specific questions and tips.</p>
              <div className="feat-tags"><span>AI Practice</span><span>Feedback</span></div>
            </div>
            <div className="feat-card reveal">
              <span className="num">06</span>
              <div className="feat-icon">🎓</div>
              <h3>Skills & Training</h3>
              <p>Learn Excel, SQL, Python, React, communication and more — with videos, notes, practice sets and certificates.</p>
              <div className="feat-tags"><span>Courses</span><span>Certificates</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* AI INTELLIGENCE & RECRUITMENT TRANSFORMATION */}
      <section className="section-pad" id="ai-intelligence" style={{ background: '#000000', color: '#fff', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container">
          <div className="sec-head center reveal" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="eyebrow" style={{ justifyContent: 'center', background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.18)' }}>AI Intelligence</div>
            <h2 style={{ color: '#fff', fontSize: '42px', fontWeight: 800 }}>Transform Your Hiring Process<br />with AI Intelligence</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '720px', margin: '0 auto', fontSize: '16.5px' }}>
              Revolutionize recruitment with cutting-edge AI technology that automates candidate screening, conducts intelligent interviews, and identifies top talent faster than ever before.
            </p>
          </div>

          {/* Isometric AI Hiring Maze Graphic */}
          <div className="ai-maze-card reveal">
            <img
              src="/images/ai-hiring-maze.jpg"
              alt="AI Automated Recruitment Workflow"
              className="ai-maze-img"
            />
            <div className="ai-maze-badge ai-badge-1">
              <span>⚡ 98% Screening Accuracy</span>
            </div>
            <div className="ai-maze-badge ai-badge-2">
              <span>🤖 Automated Voice & Video Screening</span>
            </div>
            <div className="ai-maze-badge ai-badge-3">
              <span>🚀 10x Faster Time-to-Offer</span>
            </div>
          </div>

          {/* High-Impact Monochrome Quote Banner */}
          <div className="ai-magenta-quote reveal">
            <div className="ai-quote-text">
              &ldquo;Transform your hiring process with AI automation that delivers results <span className="italic-accent">10x faster</span> than traditional methods.&rdquo;
            </div>
            <div className="ai-quote-author">
              &mdash; Streamline recruitment from days to minutes
            </div>
          </div>

          {/* BOOST HIRING ROI & SPIDER / RADAR CHART */}
          <div className="roi-section reveal" id="roi-analysis">
            <div className="cross-corner cross-tl">+</div>
            <div className="cross-corner cross-tr">+</div>
            <div className="cross-corner cross-bl">+</div>
            <div className="cross-corner cross-br">+</div>

            <div className="roi-head">
              <h2>Boost your hiring ROI</h2>
              <p>
                Ramp up hiring as your company grows while also keeping an eye on the budget. Worklance provides scalable and cost-effective recruitment solutions for organizations of all sizes.
              </p>
            </div>

            <div className="roi-chart-container">
              <svg className="roi-radar-svg" viewBox="0 0 500 480" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Concentric Pentagon Grid Lines */}
                <polygon points="250,208 280.4,222.6 268.8,255.4 231.2,255.4 219.6,222.6" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
                <polygon points="250,176 310.9,205.2 287.6,270.8 212.4,270.8 189.1,205.2" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
                <polygon points="250,144 341.3,187.8 306.4,286.2 193.6,286.2 158.7,187.8" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none" />
                <polygon points="250,112 371.8,170.4 325.2,301.6 174.8,301.6 128.2,170.4" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
                <polygon points="250,80 402.2,153.1 344.0,317.0 156.0,317.0 97.8,153.1" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" fill="none" />

                {/* Axis Radial Lines */}
                <line x1="250" y1="240" x2="250" y2="80" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="250" y1="240" x2="402.2" y2="153.1" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="250" y1="240" x2="344.0" y2="317.0" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="250" y1="240" x2="156.0" y2="317.0" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="250" y1="240" x2="97.8" y2="153.1" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />

                {/* Traditional Hiring Polygon (Muted Grey Dashed) */}
                <polygon
                  points="250,185 305,220 290,270 215,275 190,215"
                  fill="rgba(255, 255, 255, 0.05)"
                  stroke="rgba(255, 255, 255, 0.35)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Worklance AI-Powered Radar Polygon (Monochrome Crisp White/Silver) */}
                <polygon
                  points="250,115 394.5,158 322.0,305 170.0,305 115.0,158"
                  fill="rgba(255, 255, 255, 0.18)"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />

                {/* Interactive Points on Polygon */}
                {/* Cost (Top) */}
                <circle
                  cx="250"
                  cy="115"
                  r={activeRoiMetric === 'cost' ? '7.5' : '4.5'}
                  fill={activeRoiMetric === 'cost' ? '#FFFFFF' : '#71717A'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="radar-interactive-dot"
                  onClick={() => setActiveRoiMetric('cost')}
                />
                {/* Time (Top-Right) */}
                <circle
                  cx="394.5"
                  cy="158"
                  r={activeRoiMetric === 'time' ? '7.5' : '4.5'}
                  fill={activeRoiMetric === 'time' ? '#FFFFFF' : '#71717A'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="radar-interactive-dot"
                  onClick={() => setActiveRoiMetric('time')}
                />
                {/* Team (Bottom-Right) */}
                <circle
                  cx="322"
                  cy="305"
                  r={activeRoiMetric === 'team' ? '7.5' : '4.5'}
                  fill={activeRoiMetric === 'team' ? '#FFFFFF' : '#71717A'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="radar-interactive-dot"
                  onClick={() => setActiveRoiMetric('team')}
                />
                {/* Manual (Bottom-Left) */}
                <circle
                  cx="170"
                  cy="305"
                  r={activeRoiMetric === 'manual' ? '7.5' : '4.5'}
                  fill={activeRoiMetric === 'manual' ? '#FFFFFF' : '#71717A'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="radar-interactive-dot"
                  onClick={() => setActiveRoiMetric('manual')}
                />
                {/* Quality (Top-Left) */}
                <circle
                  cx="115"
                  cy="158"
                  r={activeRoiMetric === 'quality' ? '7.5' : '4.5'}
                  fill={activeRoiMetric === 'quality' ? '#FFFFFF' : '#71717A'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="radar-interactive-dot"
                  onClick={() => setActiveRoiMetric('quality')}
                />

                {/* Axis Labels */}
                <text
                  x="250"
                  y="55"
                  textAnchor="middle"
                  className={`radar-axis-label ${activeRoiMetric === 'cost' ? 'active' : ''}`}
                  onClick={() => setActiveRoiMetric('cost')}
                >
                  Cost
                </text>
                <text
                  x="420"
                  y="158"
                  textAnchor="start"
                  className={`radar-axis-label ${activeRoiMetric === 'time' ? 'active' : ''}`}
                  onClick={() => setActiveRoiMetric('time')}
                >
                  Time
                </text>
                <text
                  x="355"
                  y="345"
                  textAnchor="start"
                  className={`radar-axis-label ${activeRoiMetric === 'team' ? 'active' : ''}`}
                  onClick={() => setActiveRoiMetric('team')}
                >
                  Team
                </text>
                <text
                  x="145"
                  y="345"
                  textAnchor="end"
                  className={`radar-axis-label ${activeRoiMetric === 'manual' ? 'active' : ''}`}
                  onClick={() => setActiveRoiMetric('manual')}
                >
                  Manual
                </text>
                <text
                  x="80"
                  y="158"
                  textAnchor="end"
                  className={`radar-axis-label ${activeRoiMetric === 'quality' ? 'active' : ''}`}
                  onClick={() => setActiveRoiMetric('quality')}
                >
                  Quality
                </text>
              </svg>

              {/* Floating Tooltip Card */}
              <div className="roi-tooltip-card">
                <div className="roi-tooltip-title">{roiMetrics[activeRoiMetric].title}</div>
                <div className="roi-tooltip-row">
                  <span className="label"><span className="roi-dot-gray"></span> Traditional</span>
                  <span className="val">{roiMetrics[activeRoiMetric].traditional}</span>
                </div>
                <div className="roi-tooltip-row active-ai">
                  <span className="label"><span className="roi-dot-white"></span> AI-Powered</span>
                  <span className="val">{roiMetrics[activeRoiMetric].ai}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  {roiMetrics[activeRoiMetric].desc}
                </div>
              </div>
            </div>

            {/* Metric Selectors */}
            <div className="roi-metric-selectors">
              {(['time', 'cost', 'quality', 'manual', 'team'] as const).map((m) => (
                <button
                  key={m}
                  className={`roi-btn ${activeRoiMetric === m ? 'active' : ''}`}
                  onClick={() => setActiveRoiMetric(m)}
                >
                  {roiMetrics[m].title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-pad bg-soft" id="how">
        <div className="container">
          <div className="sec-head center reveal" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>Process</div>
            <h2>How Worklance works</h2>
            <p>A clear five-step path — whether you're hunting for your next role or hiring for one.</p>
          </div>
          <div className="tabs reveal">
            <button
              className={`tab-btn ${activeTab === 'seeker' ? 'active' : ''}`}
              onClick={() => setActiveTab('seeker')}
            >
              For Job Seekers
            </button>
            <button
              className={`tab-btn ${activeTab === 'recruiter' ? 'active' : ''}`}
              onClick={() => setActiveTab('recruiter')}
            >
              For Recruiters
            </button>
          </div>
          <div className={`steps-track ${activeTab === 'seeker' ? 'active' : ''} reveal`} id="seeker">
            <div className="step"><div className="step-num">1</div><h4>Create Profile</h4><p>Set up your career profile in minutes.</p></div>
            <div className="step"><div className="step-num">2</div><h4>Build Resume</h4><p>Generate an ATS-optimized resume.</p></div>
            <div className="step"><div className="step-num">3</div><h4>Apply</h4><p>Easy-apply to matched openings.</p></div>
            <div className="step"><div className="step-num">4</div><h4>Get Interview</h4><p>Prep with mock interviews and PYQs.</p></div>
            <div className="step"><div className="step-num">5</div><h4>Get Hired</h4><p>Land the offer and track it all.</p></div>
          </div>
          <div className={`steps-track ${activeTab === 'recruiter' ? 'active' : ''} reveal`} id="recruiter">
            <div className="step"><div className="step-num">1</div><h4>Create Company</h4><p>Set up your company profile.</p></div>
            <div className="step"><div className="step-num">2</div><h4>Post Job</h4><p>Publish roles in a few clicks.</p></div>
            <div className="step"><div className="step-num">3</div><h4>Receive Applications</h4><p>Applications land in one pipeline.</p></div>
            <div className="step"><div className="step-num">4</div><h4>Shortlist</h4><p>Search, save and shortlist candidates.</p></div>
            <div className="step"><div className="step-num">5</div><h4>Hire</h4><p>Schedule interviews and close roles.</p></div>
          </div>
        </div>
      </section>

      {/* HACKATHONS */}
      <section className="section-pad" id="hackathons">
        <div className="container">
          <div className="sec-head center reveal" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>Hackathons</div>
            <h2>Compete, build, and get noticed by recruiters</h2>
            <p>Join hackathons hosted by real companies, build with a team, and turn your project into your next job lead.</p>
          </div>

          <div className="hack-banner reveal">
            <div>
              <span className="badge-live"><span className="pulse"></span> Live · 3 days left</span>
              <h3>Worklance Winter Hackathon 2026</h3>
              <p>Build an AI-powered hiring tool in 48 hours. Open to students and early-career developers across India.</p>
              <div className="stats">
                <div><div className="n">1,240</div><div className="l">Participants</div></div>
                <div><div className="n">180</div><div className="l">Teams</div></div>
                <div><div className="n">48 hrs</div><div className="l">Duration</div></div>
              </div>
            </div>
            <div className="side">
              <div className="prize">₹3,00,000</div>
              <div className="prize-label">Total Prize Pool</div>
              <Link href="/hackathons" className="btn btn-primary">Register Your Team</Link>
            </div>
          </div>

          <div className="hack-grid">
            <div className="hack-card reveal">
              <div className="hack-card-top"><div className="hack-logo-badge">ZN</div><span className="hack-status live">Live</span></div>
              <h4>Zenith Labs AI Challenge</h4>
              <div className="org">Hosted by Zenith Labs</div>
              <div className="tags"><span>AI/ML</span><span>Beginner Friendly</span></div>
              <div className="hack-meta-row"><span>Prize Pool</span><span>₹1,50,000</span></div>
              <div className="hack-meta-row"><span>Team Size</span><span>Up to 4</span></div>
              <div className="hack-meta-row"><span>Ends in</span><span>2 days</span></div>
              <Link href="/hackathons" className="btn btn-dark" style={{ width: '100%', marginTop: '18px' }}>Join Hackathon</Link>
            </div>
            <div className="hack-card reveal">
              <div className="hack-card-top"><div className="hack-logo-badge">NX</div><span className="hack-status upcoming">Upcoming</span></div>
              <h4>Nexora Fintech Sprint</h4>
              <div className="org">Hosted by Nexora Tech</div>
              <div className="tags"><span>Fintech</span><span>Web Dev</span></div>
              <div className="hack-meta-row"><span>Prize Pool</span><span>₹2,00,000</span></div>
              <div className="hack-meta-row"><span>Team Size</span><span>Up to 5</span></div>
              <div className="hack-meta-row"><span>Starts in</span><span>6 days</span></div>
              <Link href="/hackathons" className="btn btn-outline" style={{ width: '100%', marginTop: '18px' }}>Notify Me</Link>
            </div>
            <div className="hack-card reveal">
              <div className="hack-card-top"><div className="hack-logo-badge">CD</div><span className="hack-status upcoming">Upcoming</span></div>
              <h4>Codeloop Campus Build</h4>
              <div className="org">Hosted by Codeloop · Campus Only</div>
              <div className="tags"><span>Students Only</span><span>Web Dev</span></div>
              <div className="hack-meta-row"><span>Prize Pool</span><span>₹75,000</span></div>
              <div className="hack-meta-row"><span>Team Size</span><span>Up to 3</span></div>
              <div className="hack-meta-row"><span>Starts in</span><span>12 days</span></div>
              <Link href="/hackathons" className="btn btn-outline" style={{ width: '100%', marginTop: '18px' }}>Notify Me</Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY WORKLANCE */}
      <section className="section-pad" id="why">
        <div className="container why-wrap">
          <div className="why-visual reveal">
            <div className="score">
              <div className="score-num">92%</div>
              <div className="score-label">Average resume ATS score after AI review</div>
              <div className="mini-row"><span>Resume completion</span><span>100%</span></div>
              <div className="mini-row"><span>Applications sent</span><span>18</span></div>
              <div className="mini-row"><span>Interviews scheduled</span><span>4</span></div>
              <div className="mini-row"><span>Profile views by HR</span><span>27</span></div>
            </div>
          </div>
          <div>
            <div className="eyebrow">Why Worklance</div>
            <h2 style={{ fontSize: '34px', marginBottom: '26px' }}>Everything else forced you to piece it together yourself.</h2>
            <div className="why-list">
              <div className="why-item reveal"><div className="why-check">✓</div><div><h4>One platform, not five tabs</h4><p>Resume, jobs, HR contacts, prep and courses — all connected to one profile.</p></div></div>
              <div className="why-item reveal"><div className="why-check">✓</div><div><h4>Verified HR database</h4><p>Skip the guesswork and reach real decision-makers directly.</p></div></div>
              <div className="why-item reveal"><div className="why-check">✓</div><div><h4>Real interview preparation</h4><p>Company-specific questions and AI mock interviews, not generic tips.</p></div></div>
              <div className="why-item reveal"><div className="why-check">✓</div><div><h4>Track everything in one dashboard</h4><p>Applications, interviews, courses and profile score — always visible.</p></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-pad bg-soft">
        <div className="container">
          <div className="sec-head center reveal" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>Testimonials</div>
            <h2>Trusted by job seekers and recruiters alike</h2>
          </div>
          <div className="test-grid">
            <div className="test-card reveal">
              <p className="test-quote">Worklance cut my job search from three months to three weeks. The HR database alone got me two direct interviews.</p>
              <div className="test-person"><div className="avatar">RS</div><div><div className="name">Riya Sharma</div><div className="role">Frontend Developer, Fresher</div></div></div>
            </div>
            <div className="test-card reveal">
              <p className="test-quote">We fill open roles nearly twice as fast now. The candidate pipeline view alone was worth switching over.</p>
              <div className="test-person"><div className="avatar">AK</div><div><div className="name">Ankit Kapoor</div><div className="role">HR Manager, SaaS Startup</div></div></div>
            </div>
            <div className="test-card reveal">
              <p className="test-quote">The company-wise previous year questions made my TCS and Infosys interviews feel like practice rounds.</p>
              <div className="test-person"><div className="avatar">PM</div><div><div className="name">Priya Mehta</div><div className="role">B.Tech Final Year Student</div></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* SPEED QUOTE BANNER */}
      <section className="container" style={{ marginTop: '50px', marginBottom: '30px' }}>
        <div className="speed-quote-section reveal">
          <div className="cross-corner cross-tl">+</div>
          <div className="cross-corner cross-tr">+</div>
          <div className="cross-corner cross-bl">+</div>
          <div className="cross-corner cross-br">+</div>
          <h2 className="speed-quote-title">
            &ldquo;Hire in 10 Minutes. Yes, Really. Not 10 days. Not 10 hours. <span className="monotone-highlight">10 minutes.</span>&rdquo;
          </h2>
          <p className="speed-quote-sub">&mdash; From posting a job to sending an offer letter</p>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="section-pad" id="pricing" style={{ paddingTop: '20px' }}>
        <div className="container">
          <div className="ai-pricing-wrap reveal">
            <div className="cross-corner cross-tl">+</div>
            <div className="cross-corner cross-tr">+</div>
            <div className="cross-corner cross-bl">+</div>
            <div className="cross-corner cross-br">+</div>

            {/* Glowing Spotlight Beam Effect */}
            <div className="pricing-spotlight-beam"></div>

            <div className="ai-pricing-head">
              <h2>Simple, Transparent Pricing</h2>
              <p>Choose the plan that fits your hiring needs. All plans include our core AI-powered features.</p>
            </div>

            {/* Plan Category Switcher (Recruiter AI Plans / Job Seeker Plans) */}
            <div className="pricing-mode-tabs">
              <button
                className={`pricing-mode-btn ${pricingCategory === 'recruiter' ? 'active' : ''}`}
                onClick={() => setPricingCategory('recruiter')}
              >
                AI Hiring Plans (Recruiter)
              </button>
              <button
                className={`pricing-mode-btn ${pricingCategory === 'seeker' ? 'active' : ''}`}
                onClick={() => setPricingCategory('seeker')}
              >
                Job Seeker Plans
              </button>
            </div>

            {/* Billing Toggle (Monthly / Yearly) */}
            <div className="ai-billing-toggle">
              <button
                className={`ai-billing-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={`ai-billing-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
                onClick={() => setBillingCycle('yearly')}
              >
                Yearly <span className="discount-pill">15% OFF</span>
              </button>
            </div>

            {pricingCategory === 'recruiter' ? (
              /* RECRUITER AI HIRING PLANS (AS SEEN IN SCREENSHOTS) */
              <div className="ai-pricing-grid">
                {/* Starter Card */}
                <div className="ai-price-card">
                  <div className="ai-card-tier">Starter</div>
                  <div className="ai-card-price">
                    <span className="ai-price-num">{billingCycle === 'yearly' ? '₹7,999' : '₹9,499'}</span>
                    <span className="ai-price-unit">/ month</span>
                  </div>
                  <div className="ai-card-sub">
                    {billingCycle === 'yearly' ? '(Billed annually - Save 20%)' : '(Billed monthly)'}
                  </div>
                  <ul className="ai-card-features">
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      1,500 AI Credits / month
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      3 Active Jobs
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      AI Pre-screening Calls (10 cr/call)
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      AI Video Interviews (35 cr/interview)
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      WhatsApp & Email Invites (1 cr/msg)
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Resume Parsing (1 cr/cv)
                    </li>
                  </ul>
                  <Link href="/register?plan=starter" className="btn-ai-white">
                    Get Started
                  </Link>
                </div>

                {/* Growth Card (Most Popular) */}
                <div className="ai-price-card featured">
                  <div className="ai-popular-badge">Most Popular</div>
                  <div className="ai-card-tier">Growth</div>
                  <div className="ai-card-price">
                    <span className="ai-price-num">{billingCycle === 'yearly' ? '₹15,999' : '₹18,999'}</span>
                    <span className="ai-price-unit">/ month</span>
                  </div>
                  <div className="ai-card-sub">
                    {billingCycle === 'yearly' ? '(Billed annually - Save 20%)' : '(Billed monthly)'}
                  </div>
                  <ul className="ai-card-features">
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      4,000 AI Credits / month
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      10 Active Jobs
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      AI Sourcing + Contacts (5 Projects, 15 cr/contact reveal)
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      WhatsApp & Email Automation
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Advanced Anti-Cheating & Analytics
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Custom Interview Workflows
                    </li>
                  </ul>
                  <Link href="/register?plan=growth" className="btn-ai-dark">
                    Get Started
                  </Link>
                </div>
              </div>
            ) : (
              /* JOB SEEKER TIERS (DARK SPOTLIGHT CARDS MATCHING RECRUITER TIER) */
              <div className="ai-pricing-grid">
                {/* Starter Seeker Card */}
                <div className="ai-price-card">
                  <div className="ai-card-tier">Starter Seeker</div>
                  <div className="ai-card-price">
                    <span className="ai-price-num">₹0</span>
                    <span className="ai-price-unit">/ month</span>
                  </div>
                  <div className="ai-card-sub">
                    Free forever for ambitious engineers
                  </div>
                  <ul className="ai-card-features">
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      1 ATS-Optimized Resume Template
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Unlimited Tech Job Search & Filters
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Application Tracker & Dashboard
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Hackathon Hub Team Registrations
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Sample Interview Questions & Tips
                    </li>
                  </ul>
                  <Link href="/register" className="btn-ai-white">
                    Get Started Free
                  </Link>
                </div>

                {/* Pro Career OS Card (Most Popular) */}
                <div className="ai-price-card featured">
                  <div className="ai-popular-badge">Most Popular</div>
                  <div className="ai-card-tier">Pro Career OS</div>
                  <div className="ai-card-price">
                    <span className="ai-price-num">{billingCycle === 'yearly' ? '₹399' : '₹499'}</span>
                    <span className="ai-price-unit">/ month</span>
                  </div>
                  <div className="ai-card-sub">
                    {billingCycle === 'yearly' ? '(Billed annually - ₹4,788/yr)' : '(Billed monthly)'}
                  </div>
                  <ul className="ai-card-features">
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Unlimited AI ATS Resumes + Bot Score Checker
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Full Verified HR Database Access & 1-Click Copy
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      AI Voice & Technical Interview Mock Simulator
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      10-Minute Fast-Track Verified Candidate Badge
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Previous Year Company Questions (FAANG, Unicorns)
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Priority Recruiter Inbox Placement
                    </li>
                  </ul>
                  <Link href="/register?plan=pro" className="btn-ai-dark">
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-soft" id="faq">
        <div className="container">
          <div className="sec-head center reveal" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>FAQ</div>
            <h2>Questions, answered</h2>
            <p>Everything you need to know about Worklance Career OS and autonomous recruitment.</p>
          </div>
          <div className="faq-wrap">
            {[
              {
                q: "Is Worklance free to use for job seekers?",
                a: "Yes! The Starter plan is 100% free forever and includes ATS resume building, unlimited tech job search, application tracking, and hackathon registrations. Pro Career OS unlocks direct HR contacts and AI voice mock interviews."
              },
              {
                q: "How does the HR Database work?",
                a: "Our HR directory is a curated, verified repository of active talent acquisition leaders, engineering recruiters, and HR heads with direct emails, LinkedIn profiles, and verified company domains."
              },
              {
                q: "What is the 10-Minute Fast-Track Offer Pipeline?",
                a: "Worklance allows candidates to complete AI voice pre-screening and technical evaluations in advance. Recruiters can review instant benchmark scores and send direct interview invitations or offers in as little as 10 minutes."
              },
              {
                q: "Can recruiters post jobs and manage full hiring pipelines?",
                a: "Yes. Recruiters get an autonomous dashboard to post roles, search candidates, review AI assessment scores, schedule interviews, and update candidate statuses from Applied to Offered."
              },
              {
                q: "How does the AI ATS Resume Builder work?",
                a: "It generates clean, single-column, bot-optimized resumes that pass modern Applicant Tracking Systems (Workday, Greenhouse, Lever) and calculates real-time ATS compliance scores."
              },
              {
                q: "What kind of interview preparation questions are included?",
                a: "We provide real previous year interview questions from top tech companies (Google, Amazon, TCS, Infosys, Microsoft) categorized by HR, Technical, Coding, and System Design rounds."
              }
            ].map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <div className="faq-q" onClick={() => toggleFaq(index)}>
                    <span>{item.q}</span>
                    <span className="plus">+</span>
                  </div>
                  <div
                    className="faq-a"
                    style={{
                      maxHeight: isOpen ? '240px' : '0px',
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <p>{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="section-pad" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="cta-band reveal">
            <div>
              <h2>Ready to build your career, faster?</h2>
              <p>Join job seekers and recruiters already using Worklance every day.</p>
            </div>
            <div className="actions">
              <Link href="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
              <Link href="/jobs" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>Explore Jobs</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="foot-grid">
            <div>
              <div className="foot-logo" style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <img src="/logo.png" alt="Worklance Logo" className="logo-mark-img" width={34} height={34} />
                Worklance
              </div>
            </div>
            <div className="foot-col">
              <h5>Product</h5>
              <ul>
                <li><Link href="/jobs">Job Search</Link></li>
                <li><Link href="/hr-database">HR Database</Link></li>
                <li><Link href="/hackathons">Hackathons</Link></li>
                <li><a href="#features">Interview Prep</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h5>Company</h5>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Companies</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h5>For Recruiters</h5>
              <ul>
                <li><Link href="/jobs/post">Post a Job</Link></li>
                <li><a href="#pricing">Recruiter Plans</a></li>
                <li><Link href="/hr-database">Candidate Search</Link></li>
              </ul>
            </div>
            <div className="foot-col">
              <h5>Support</h5>
              <ul>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Worklance. All rights reserved.</span>
            <span>Connect · Train · Get Hired</span>
          </div>
        </div>
      </footer>
    </>
  );
}
