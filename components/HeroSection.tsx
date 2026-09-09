'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  FileText, 
  Users, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';

interface HeroSectionProps {
  currentUser?: any;
}

export default function HeroSection({ currentUser }: HeroSectionProps) {
  const router = useRouter();
  const [heroQuery, setHeroQuery] = useState('');
  const [activeDeckTab, setActiveDeckTab] = useState<'pipeline' | 'ats' | 'hr'>('pipeline');
  
  // 3D Tilt & Specular Glare Physics State
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    
    // Normalize coordinates from -1 to 1
    const xNorm = (clientX / rect.width) * 2 - 1;
    const yNorm = (clientY / rect.height) * 2 - 1;
    
    // Calculate rotation angles (max ±10 deg)
    const rotateY = xNorm * 10;
    const rotateX = -yNorm * 10;
    
    // Glare position percentage
    const glareX = (clientX / rect.width) * 100;
    const glareY = (clientY / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glareX, glareY });
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile) setIsHovered(true);
  }, [isMobile]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroQuery.trim()) {
      router.push(`/jobs?keyword=${encodeURIComponent(heroQuery.trim())}`);
    } else {
      router.push('/jobs');
    }
  };

  return (
    <header className="hero-nextgen">
      {/* Dynamic 3D Perspective Grid & Ambient Lighting */}
      <div className="hero-grid-ambient"></div>
      <div className="hero-spotlight-top"></div>
      <div className="hero-subtle-glow"></div>

      {/* Coordinate Accent Markings */}
      <div className="hero-coord-marker coord-left">LAT 37.7749° N · LNG 122.4194° W</div>
      <div className="hero-coord-marker coord-right">SYS_VER 4.2.0 // AUTONOMOUS_OS</div>

      <div className="container hero-grid-layout">
        {/* LEFT COLUMN: HIGH-PRECISION MINIMALIST TYPOGRAPHY */}
        <div className="hero-content-col">
          {/* Status Eyebrow Badge */}
          <div className="hero-eyebrow-pill">
            <span className="hero-pulse-dot"></span>
            <span className="hero-eyebrow-text">Worklance 4.0 · Autonomous Career Intelligence</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="hero-title-nextgen">
            Architect Your Career.<br />
            <span className="hero-metallic-gradient">Hired in 10 Minutes.</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle-nextgen">
            The unified career operating system that pairs high-velocity AI job matchmaking, verified recruiter direct access, automated technical screening, and recruiter-aligned ATS resume engineering.
          </p>

          {/* Dual Action CTAs */}
          <div className="hero-cta-group">
            <Link href="/jobs" className="hero-btn-primary">
              <span>Explore 10,000+ Jobs</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/resume-builder" className="hero-btn-secondary">
              <Sparkles size={15} />
              <span>Build ATS Resume</span>
            </Link>
          </div>

          {/* Frosted Command Search Console */}
          <form onSubmit={handleHeroSearch} className="hero-search-console">
            <Search size={17} className="hero-search-icon" />
            <input
              type="text"
              value={heroQuery}
              onChange={(e) => setHeroQuery(e.target.value)}
              placeholder="Search roles: 'Senior Full Stack', 'AI Engineer', 'Remote'..."
              className="hero-search-input"
            />
            <button type="submit" className="hero-search-btn">
              Find Roles
            </button>
          </form>

          {/* Quick Filter Tags */}
          <div className="hero-filter-chips">
            <span className="hero-filter-label">Quick Filters:</span>
            <button type="button" onClick={() => router.push('/jobs?keyword=Remote')} className="hero-chip-btn">
              ⚡ Remote
            </button>
            <button type="button" onClick={() => router.push('/jobs?keyword=Full%20Stack')} className="hero-chip-btn">
              💻 Full Stack
            </button>
            <button type="button" onClick={() => router.push('/jobs?keyword=AI')} className="hero-chip-btn">
              🤖 AI / ML
            </button>
            <button type="button" onClick={() => router.push('/jobs?location=Bengaluru')} className="hero-chip-btn">
              📍 Bengaluru
            </button>
          </div>

          {/* Platform Telemetry Strip */}
          <div className="hero-telemetry-strip">
            <div className="hero-telemetry-item">
              <span className="hero-telemetry-num">10,000+</span>
              <span className="hero-telemetry-sub">AI-Screened Roles</span>
            </div>
            <div className="hero-telemetry-divider"></div>
            <div className="hero-telemetry-item">
              <span className="hero-telemetry-num">98.4%</span>
              <span className="hero-telemetry-sub">ATS Pass Accuracy</span>
            </div>
            <div className="hero-telemetry-divider"></div>
            <div className="hero-telemetry-item">
              <span className="hero-telemetry-num">10 Min</span>
              <span className="hero-telemetry-sub">Avg. Offer Pipeline</span>
            </div>
            <div className="hero-telemetry-divider"></div>
            <div className="hero-telemetry-item">
              <span className="hero-telemetry-num">1,200+</span>
              <span className="hero-telemetry-sub">Direct HR Contacts</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D MULTI-LAYER INTERACTIVE HUD DECK */}
        <div 
          ref={stageRef}
          className="hero-stage-nextgen"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className="hero-deck-3d-wrapper"
            style={{
              transform: isMobile 
                ? 'none'
                : isHovered 
                  ? `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)` 
                  : 'perspective(1200px) rotateX(6deg) rotateY(-8deg) rotateZ(1deg)',
              transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* FLOATING SATELLITE 1: TOP-RIGHT FAST-TRACK OFFER PILL */}
            <div className="hero-floating-satellite sat-pill-top">
              <span className="satellite-pulse"></span>
              <span className="satellite-text">⚡ 10-Min Fast-Track Pipeline</span>
            </div>

            {/* MAIN 3D GLASS TELEMETRY DECK */}
            <div className="hero-glass-deck">
              {/* Dynamic Specular Glare Reflection */}
              {!isMobile && (
                <div 
                  className="hero-specular-glare"
                  style={{
                    background: `radial-gradient(circle 350px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.15), transparent 75%)`,
                  }}
                />
              )}

              {/* Technical Precision Corner Crosshairs */}
              <div className="deck-corner-cross cross-tl">+</div>
              <div className="deck-corner-cross cross-tr">+</div>
              <div className="deck-corner-cross cross-bl">+</div>
              <div className="deck-corner-cross cross-br">+</div>

              {/* Interactive Deck Header Mode Switcher */}
              <div className="deck-tab-bar">
                <button
                  type="button"
                  onClick={() => setActiveDeckTab('pipeline')}
                  className={`deck-tab-btn ${activeDeckTab === 'pipeline' ? 'active' : ''}`}
                >
                  <Zap size={13} />
                  <span>Pipeline</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDeckTab('ats')}
                  className={`deck-tab-btn ${activeDeckTab === 'ats' ? 'active' : ''}`}
                >
                  <FileText size={13} />
                  <span>ATS Score</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDeckTab('hr')}
                  className={`deck-tab-btn ${activeDeckTab === 'hr' ? 'active' : ''}`}
                >
                  <Users size={13} />
                  <span>Direct HR</span>
                </button>
              </div>

              {/* TAB CONTENT 1: AUTONOMOUS 10-MIN OFFER PIPELINE */}
              {activeDeckTab === 'pipeline' && (
                <div className="deck-body-content">
                  {/* Candidate Profile Row */}
                  <div className="deck-candidate-row">
                    <div className="candidate-meta">
                      <div className="candidate-avatar">RS</div>
                      <div>
                        <div className="candidate-name">Riya Sharma</div>
                        <div className="candidate-role">Senior Full Stack Architect</div>
                      </div>
                    </div>
                    <div className="match-pill-badge">
                      <span>99.2% MATCH</span>
                    </div>
                  </div>

                  {/* Pipeline Stage Tracker */}
                  <div className="pipeline-tracker-box">
                    <div className="tracker-header">
                      <span className="tracker-title">AUTONOMOUS PIPELINE</span>
                      <span className="tracker-timer">00:09:42 ELAPSED</span>
                    </div>
                    <div className="tracker-steps-line">
                      <div className="tracker-step done">
                        <div className="step-node">✓</div>
                        <span className="step-name">AI Screen</span>
                      </div>
                      <div className="tracker-step done">
                        <div className="step-node">✓</div>
                        <span className="step-name">AI Video</span>
                      </div>
                      <div className="tracker-step active">
                        <div className="step-node active-node">●</div>
                        <span className="step-name">Offer Out</span>
                      </div>
                    </div>
                  </div>

                  {/* Offer Package Meta */}
                  <div className="deck-role-card">
                    <div className="role-card-row">
                      <span className="role-card-label">Matched Organization:</span>
                      <span className="role-card-val">Zenith Tech Labs</span>
                    </div>
                    <div className="role-card-row">
                      <span className="role-card-label">Verified Target Package:</span>
                      <span className="role-card-highlight">₹28,00,000 - ₹35,00,000</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 2: LIVE ATS BOT-PROOF RESUME VALIDATOR */}
              {activeDeckTab === 'ats' && (
                <div className="deck-body-content">
                  <div className="ats-score-hero-row">
                    <div className="ats-score-dial">
                      <span className="dial-value">98.4%</span>
                      <span className="dial-label">ATS AUDIT</span>
                    </div>
                    <div className="ats-audit-meta">
                      <div className="ats-audit-status">
                        <CheckCircle2 size={15} color="#FFFFFF" />
                        <span>Ready for Workday, Greenhouse & Lever</span>
                      </div>
                      <p className="ats-audit-desc">
                        0 parsing anomalies. 1-column recruiter format with 100% selectable text.
                      </p>
                    </div>
                  </div>

                  {/* ATS Checklist Badges */}
                  <div className="ats-badge-grid">
                    <div className="ats-badge-item">
                      <CheckCircle2 size={12} />
                      <span>10/10 Keywords Matched</span>
                    </div>
                    <div className="ats-badge-item">
                      <CheckCircle2 size={12} />
                      <span>Action Verbs: 100%</span>
                    </div>
                    <div className="ats-badge-item">
                      <CheckCircle2 size={12} />
                      <span>Quantified Metrics: 85%</span>
                    </div>
                    <div className="ats-badge-item">
                      <CheckCircle2 size={12} />
                      <span>Zero Format Errors</span>
                    </div>
                  </div>

                  <div className="deck-role-card" style={{ marginTop: '14px' }}>
                    <div className="role-card-row">
                      <span className="role-card-label">Target Role Match:</span>
                      <span className="role-card-val">Full Stack & AI Engineer</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 3: DIRECT HR RADAR & INSTANT CONNECT */}
              {activeDeckTab === 'hr' && (
                <div className="deck-body-content">
                  <div className="hr-preview-card">
                    <div className="hr-meta-row">
                      <div className="hr-avatar">AK</div>
                      <div>
                        <div className="hr-name">Ananya Kapoor · Verified HR</div>
                        <div className="hr-company">Head of Talent @ Zenith Labs</div>
                      </div>
                      <span className="hr-online-dot" title="Active now"></span>
                    </div>
                    <div className="hr-quick-message">
                      &ldquo;Reviewed Riya&apos;s verified screening score (99.2%). Releasing fast-track technical offer letter.&rdquo;
                    </div>
                  </div>

                  <div className="ats-badge-grid" style={{ marginTop: '14px' }}>
                    <div className="ats-badge-item">
                      <Clock size={12} />
                      <span>Avg. Response: 12 Mins</span>
                    </div>
                    <div className="ats-badge-item">
                      <ShieldCheck size={12} />
                      <span>Direct Work Email Verified</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FLOATING SATELLITE 2: BOTTOM-LEFT AI VOICE SCREENING HUD */}
            <div className="hero-floating-satellite sat-hud-bottom">
              <div className="sat-hud-header">
                <span className="sat-hud-badge">🤖 AI VOICE SCREENING BOT</span>
                <span className="sat-hud-status">VERIFIED</span>
              </div>
              <div className="sat-hud-quote">
                &ldquo;Candidate demonstrated deep Next.js 14 RSC and microservices knowledge.&rdquo;
              </div>
              {/* Dynamic Soundwave Visualizer */}
              <div className="sat-soundwave">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
