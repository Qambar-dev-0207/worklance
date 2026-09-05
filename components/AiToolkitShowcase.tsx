'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ToolItem {
  id: string;
  tabLabel: string;
  buttonLabel: string;
  urlPath: string;
  badgeText: string;
  leftTitle: string;
  leftSubtitle: string;
  leftDoc: {
    name: string;
    contact: string;
    section1Title: string;
    section1Content: string[];
    section2Title: string;
    section2Sub: string;
    section2Org: string;
    section2Bullets: string[];
    section3Title: string;
    section3Content: string;
  };
  rightDoc: {
    senderName: string;
    senderMeta: string[];
    salutation: string;
    paragraphs: string[];
    signOff: string;
    signOffName: string;
  };
}

const TOOLS: ToolItem[] = [
  {
    id: 'cover-letter',
    tabLabel: 'AI Cover Letter Generator',
    buttonLabel: '✦ Generate Cover Letter',
    urlPath: 'worklance.com/ai/cover-letter-generator',
    badgeText: 'Instant Tailoring · 99.4% Recruiter Match',
    leftTitle: 'CANDIDATE RESUME',
    leftSubtitle: 'Input Profile & Experience',
    leftDoc: {
      name: 'OLIVIA ROSE',
      contact: 'Portland, Oregon | olivia.rose@worklance.ai | linkedin.com/olivia',
      section1Title: 'SKILLS',
      section1Content: [
        'Core Technical: React, Next.js 14, TypeScript, Tailwind CSS, Node.js, GraphQL',
        'Cloud & Databases: MongoDB Atlas, PostgreSQL, Redis, AWS Lambda, Docker',
        'Specialization: High-Throughput Web Applications, Distributed Systems, Microservices',
      ],
      section2Title: 'WORK EXPERIENCE',
      section2Sub: 'Senior Marketing Associate & Technical Product Lead',
      section2Org: 'Good Business Lab Foundation | Portland, OR',
      section2Bullets: [
        'Developed and executed strategic marketing and technical platforms for global conference featuring Nobel Laureate Prof. Esther Duflo.',
        'Elevated brand identity by directing 3 full platform revamps; increased annual platform traffic by 47%.',
        'Managed engineering and product workflow as ScrumMaster across a 7-member cross-functional team.',
      ],
      section3Title: 'EDUCATION',
      section3Content: 'Doctorate - Physics · Oregon State University, Corvallis, OR',
    },
    rightDoc: {
      senderName: 'Olivia Rose',
      senderMeta: ['Corvallis, OR', 'olivia.rose@osu.edu', '04/04/2026'],
      salutation: 'Dear Hiring Manager,',
      paragraphs: [
        'I am writing to express my strong interest in the research position at Cheng lab. As a doctoral candidate in particle physics at MIT, I have spent the past several years immersed in high-precision data analysis, experimental design, and computational modeling — skills I am eager to bring to your innovative team.',
        "My research focuses on particle physics, where I've developed and applied advanced techniques in statistical modeling, Python-based data pipelines, and large-scale simulations. Beyond technical expertise, I thrive in collaborative environments — co-authoring publications, mentoring undergraduate researchers, and contributing to international collaborations like John Doe.",
        "What excites me most about Cheng lab is your commitment to cutting-edge discovery and interdisciplinary approaches to complex scientific problems. I'm enthusiastic about the opportunity to contribute to your mission and grow within a team of like-minded researchers.",
        "Thank you for considering my application. I would welcome the opportunity to discuss how my background and passion for discovery align with your lab's goals.",
      ],
      signOff: 'Sincerely,',
      signOffName: 'Olivia Rose',
    },
  },
  {
    id: 'resume-scanner',
    tabLabel: 'AI Resume Scanner & Builder',
    buttonLabel: '✦ Optimize for ATS (Score 98%)',
    urlPath: 'worklance.com/ai/resume-ats-scanner',
    badgeText: 'Passes Workday, Greenhouse & Lever ATS',
    leftTitle: 'RAW CANDIDATE DRAFT',
    leftSubtitle: 'Detected ATS Score: 56/100 (Unoptimized)',
    leftDoc: {
      name: 'ARJUN MEHTA',
      contact: 'Mumbai, India | arjun.mehta@email.com | github.com/arjun',
      section1Title: 'DETECTED ISSUES',
      section1Content: [
        '⚠️ Missing quantified impact metrics (% improvements, latency stats)',
        '⚠️ Passive action verbs ("Worked on", "Responsible for testing")',
        '⚠️ Missing high-priority tech keywords for target role (Next.js, CI/CD)',
      ],
      section2Title: 'ORIGINAL BULLET POINTS',
      section2Sub: 'Backend Developer',
      section2Org: 'FinTech Software Solutions',
      section2Bullets: [
        'Worked on the backend APIs and helped make them faster.',
        'Responsible for fixing bugs and updating database queries.',
        'Helped teammates with deployment and code reviews.',
      ],
      section3Title: 'ATS COMPLIANCE SCORE',
      section3Content: '56% Match — High risk of automated rejection by ATS filters',
    },
    rightDoc: {
      senderName: 'Arjun Mehta — Optimized for ATS',
      senderMeta: ['ATS Score: 98/100', 'Keyword Density: 99.1%', 'Format: Single-Column Bot-Proof'],
      salutation: 'High-Impact Quantified Achievements:',
      paragraphs: [
        '• Architected RESTful microservices in Node.js & TypeScript, handling 1.2M daily transactions and decreasing p95 latency by 38%.',
        '• Redesigned MongoDB aggregation queries and implemented Redis caching, slashing database CPU utilization by 45%.',
        '• Streamlined CI/CD deployment pipelines on Docker & AWS ECS, cutting deployment roll-out time from 45 mins to 6 mins.',
        '• Championed unit and integration testing coverage with Jest, elevating overall test reliability from 62% to 94%.',
      ],
      signOff: 'ATS Verification:',
      signOffName: '✅ Fully compliant with Workday, Greenhouse, Taleo & Lever parser engines',
    },
  },
  {
    id: 'career-guidance',
    tabLabel: 'AI Career Guidance',
    buttonLabel: '✦ Generate Milestone Roadmap',
    urlPath: 'worklance.com/ai/career-guidance-engine',
    badgeText: 'Market Salary Insights · Step-by-Step Milestones',
    leftTitle: 'CURRENT PROFILE & GOAL',
    leftSubtitle: 'Input Career Trajectory',
    leftDoc: {
      name: 'PRIYA NAIR',
      contact: 'Current: Frontend Engineer (2 Years Exp) | Target: Staff Cloud Architect',
      section1Title: 'CURRENT SKILLS',
      section1Content: [
        'Proficient: React, TypeScript, CSS Architecture, REST APIs',
        'Familiar: Node.js, Express, Basic Docker, Git workflows',
        'Current Salary Benchmark: ₹12,00,000 / year',
      ],
      section2Title: 'TARGET ROLE REQUIREMENTS',
      section2Sub: 'Staff Cloud Solutions Architect',
      section2Org: 'Top-Tier Tech & SaaS Enterprises',
      section2Bullets: [
        'Distributed systems architecture, event-driven design (Kafka/RabbitMQ).',
        'Database sharding, multi-region replication (MongoDB, DynamoDB).',
        'Target Compensation Benchmark: ₹32,00,000 - ₹45,00,000 / year (+180%).',
      ],
      section3Title: 'CAREER GAP ASSESSMENT',
      section3Content: 'Identified 3 core technical milestones to bridge within 6 months',
    },
    rightDoc: {
      senderName: 'Priya Nair — Personalized Career Roadmap',
      senderMeta: ['Estimated Timeline: 24 Weeks', 'Target Compensation: ₹35 LPA', 'Success Rate: 94%'],
      salutation: 'Actionable Career Milestones:',
      paragraphs: [
        '🎯 Milestone 1 (Weeks 1-8): Cloud Infrastructure & Microservices — Master Docker, Kubernetes, AWS ECS, and multi-service event orchestration.',
        '🎯 Milestone 2 (Weeks 9-16): Distributed Data at Scale — Deep dive into MongoDB clustering, sharding, ACID transactions, and Redis distributed lock patterns.',
        '🎯 Milestone 3 (Weeks 17-24): System Design Mastery & Mock Technical Interviews — Practice high-concurrency architecture interviews (URL shortener, payment gateway, streaming feed).',
        '💼 Career Financial Return: Closing these 3 competencies positions your profile for senior cloud leadership roles with an expected +160% compensation surge.',
      ],
      signOff: 'Career Co-Pilot Verdict:',
      signOffName: 'Roadmap generated with real-time market hiring criteria across 10,000+ postings',
    },
  },
  {
    id: 'linkedin-builder',
    tabLabel: 'AI LinkedIn Builder',
    buttonLabel: '✦ Generate Recruiter Note',
    urlPath: 'worklance.com/ai/linkedin-outreach-builder',
    badgeText: '48% Higher InMail Reply Rate · Direct Access',
    leftTitle: 'TARGET RECRUITER PROFILE',
    leftSubtitle: 'From Worklance Verified HR Directory',
    leftDoc: {
      name: 'ANKIT KAPOOR',
      contact: 'Talent Acquisition Lead | Zenith Tech Labs | Bengaluru',
      section1Title: 'RECRUITER HIRING PRIORITIES',
      section1Content: [
        'Actively hiring: Senior Full Stack Engineers, Next.js Specialists',
        'Preferred Traits: Open-source contributors, strong architectural depth',
        'Inbox Volume: 80+ connection requests / day (generic messages ignored)',
      ],
      section2Title: 'CANDIDATE HOOKS',
      section2Sub: 'Shared Relevance',
      section2Org: 'Match Score: 98.4%',
      section2Bullets: [
        'Candidate has extensive Next.js 14 and MongoDB production scaling experience.',
        'Candidate built projects featured on GitHub Trending.',
        'Direct connection request personalized to open requisition.',
      ],
      section3Title: 'CHANNEL',
      section3Content: 'LinkedIn Connection Note (< 300 characters limit)',
    },
    rightDoc: {
      senderName: 'High-Conversion Connection Message',
      senderMeta: ['Length: 268 chars', 'Response Index: 4.8x average', '1-Click Send'],
      salutation: 'Hi Ankit,',
      paragraphs: [
        'Noticed your team at Zenith Tech is scaling full-stack platforms with Next.js & MongoDB. In my last role, I scaled our microservices to 500k+ MAU while slashing query latency by 42%.',
        'I would love to connect and share quick notes on your open engineering roles when you have a moment!',
      ],
      signOff: 'Best regards,',
      signOffName: 'Olivia Rose (github.com/olivia-dev)',
    },
  },
  {
    id: 'interview-prep',
    tabLabel: 'AI Career Financial Analysis',
    buttonLabel: '✦ Evaluate Offer & Equity',
    urlPath: 'worklance.com/ai/career-financial-analyzer',
    badgeText: 'Fair Market Value · Offer Negotiation Engine',
    leftTitle: 'COMPENSATION BENCHMARK',
    leftSubtitle: 'Senior Software Engineer Role in India / Remote',
    leftDoc: {
      name: 'OFFER EVALUATION DATA',
      contact: 'Base: ₹24,00,000 | Variable: ₹4,00,000 | ESOPs: ₹8,00,000 / 4 yrs',
      section1Title: 'MARKET PERCENTILES',
      section1Content: [
        '25th Percentile: ₹20,00,000 / year',
        '50th Percentile (Median): ₹26,50,000 / year',
        '90th Percentile (Top Tier): ₹36,00,000 / year',
      ],
      section2Title: 'COMPENSATION BREAKDOWN',
      section2Sub: 'Offered Package vs Benchmark',
      section2Org: 'Current Offer: ₹28 LPA Total Target Cash',
      section2Bullets: [
        'Base salary is 8% below median for candidate with 4.5 years experience.',
        'Equity grant has standard 1-year cliff with 25% annual vesting.',
        'Negotiation headroom: ₹4,00,000 - ₹6,00,000 based on verified tech skills.',
      ],
      section3Title: 'RECOMMENDATION',
      section3Content: 'Counter with ₹31,00,000 base citing market percentile benchmarks.',
    },
    rightDoc: {
      senderName: 'AI Financial Analysis & Counter-Offer Script',
      senderMeta: ['Confidence: 97%', 'Expected Uplift: +₹3.5 LPA', 'Risk Level: Low'],
      salutation: 'Professional Counter-Offer Framework:',
      paragraphs: [
        '• Market Position: Based on your verified technical screening score (99.2%) and specialized Next.js/MongoDB expertise, your profile tracks at the 85th percentile of the market (₹32 LPA - ₹36 LPA).',
        '• Counter-Offer Pitch: "Thank you for the offer to join Zenith Tech Labs. Given my proven track record in reducing query latency by 42% and scaling platforms to 500k+ users, I am confident I will deliver outsized value from Day 1. Based on current industry benchmarks for senior full-stack architects, I am seeking a base of ₹30,50,000 with the existing equity structure."',
        '• Alternative Negotiation Levers: If base budget is constrained, request a guaranteed 6-month performance review cycle, joining bonus of ₹2,50,000, or expanded equity grant.',
      ],
      signOff: 'Negotiation Strategy:',
      signOffName: '✅ Counter-offer pitch adheres to proven recruiter-friendly win-win principles',
    },
  },
];

export default function AiToolkitShowcase() {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentTool = TOOLS[activeTabIdx];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 600);
  };

  const handleCopy = () => {
    const textToCopy = [
      currentTool.rightDoc.salutation,
      ...currentTool.rightDoc.paragraphs,
      currentTool.rightDoc.signOff,
      currentTool.rightDoc.signOffName,
    ].join('\n\n');

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="ai-toolkit-section" id="ai-toolkit">
      {/* Background ambient lighting and grid floor */}
      <div className="ai-toolkit-glow"></div>

      <div className="container">
        {/* TOP HEADER BLOCK MATCHING THE SCREENSHOT */}
        <div className="ai-toolkit-header reveal">
          <div className="eyebrow ai-toolkit-eyebrow">
            <span className="hero-beacon"></span>
            AI Career Toolkit · Autonomous Workflows
          </div>

          <h2 className="ai-toolkit-title">
            Get Job Ready in Minutes with AI
          </h2>

          <p className="ai-toolkit-subtitle">
            Worklance is the most cost-effective AI career toolkit designed to accelerate your job search.
          </p>

          {/* CHECKLIST BULLETS */}
          <div className="ai-toolkit-checklist">
            <div className="ai-check-item">
              <span className="ai-check-icon">✓</span>
              <span>AI Resume Scanner & Builder</span>
            </div>
            <div className="ai-check-item">
              <span className="ai-check-icon">✓</span>
              <span>AI Career Guidance</span>
            </div>
            <div className="ai-check-item">
              <span className="ai-check-icon">✓</span>
              <span>AI Career Financial Analysis</span>
            </div>
            <div className="ai-check-item">
              <span className="ai-check-icon">✓</span>
              <span>AI LinkedIn Builder</span>
            </div>
            <div className="ai-check-item">
              <span className="ai-check-icon">✓</span>
              <span>Many more...</span>
            </div>
          </div>

          {/* TOP CTA BUTTON CIRCLED IN SCREENSHOT */}
          <div className="ai-toolkit-top-cta">
            <Link
              href="/register"
              className="btn btn-primary ai-btn-try-free"
            >
              TRY FOR FREE
            </Link>
          </div>
        </div>

        {/* TABS ROW MATCHING "AI Coverage Letter Generator" */}
        <div className="ai-toolkit-tabs-wrapper reveal">
          <div className="ai-toolkit-tabs">
            {TOOLS.map((tool, idx) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  setActiveTabIdx(idx);
                  setCopied(false);
                }}
                className={`ai-tab-btn ${activeTabIdx === idx ? 'active' : ''}`}
              >
                {tool.tabLabel}
              </button>
            ))}
          </div>
        </div>

        {/* MACOS BROWSER WINDOW MOCKUP */}
        <div className="ai-browser-mockup reveal">
          {/* Mac window header bar with controls */}
          <div className="ai-browser-header">
            <div className="ai-window-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <div className="ai-browser-url-bar">
              <span className="ai-url-lock">🔒</span>
              <span className="ai-url-text">{currentTool.urlPath}</span>
            </div>
            <div className="ai-browser-badge">
              <span className="hero-beacon"></span>
              {currentTool.badgeText}
            </div>
          </div>

          {/* WINDOW BODY: SPLIT VIEW (RESUME INPUT ON LEFT -> AI OUTPUT ON RIGHT) */}
          <div className="ai-browser-body">
            {/* LEFT PANE: INPUT RESUME DOCUMENT */}
            <div className="ai-left-doc-pane">
              <div className="ai-doc-paper">
                <div className="ai-doc-tag">{currentTool.leftTitle}</div>

                {/* Candidate Name & Contact */}
                <div className="ai-doc-candidate-header">
                  <h3 className="ai-doc-name">{currentTool.leftDoc.name}</h3>
                  <p className="ai-doc-contact">{currentTool.leftDoc.contact}</p>
                </div>

                {/* Section 1 */}
                <div className="ai-doc-section">
                  <div className="ai-doc-sec-title">{currentTool.leftDoc.section1Title}</div>
                  <ul className="ai-doc-list">
                    {currentTool.leftDoc.section1Content.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>

                {/* Section 2 */}
                <div className="ai-doc-section">
                  <div className="ai-doc-sec-title">{currentTool.leftDoc.section2Title}</div>
                  <div className="ai-doc-role-sub">{currentTool.leftDoc.section2Sub}</div>
                  <div className="ai-doc-role-org">{currentTool.leftDoc.section2Org}</div>
                  <ul className="ai-doc-list">
                    {currentTool.leftDoc.section2Bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </div>

                {/* Section 3 */}
                <div className="ai-doc-section">
                  <div className="ai-doc-sec-title">{currentTool.leftDoc.section3Title}</div>
                  <p className="ai-doc-text">{currentTool.leftDoc.section3Content}</p>
                </div>
              </div>
            </div>

            {/* CENTER CONNECTOR: NEURAL TRANSFORMATION DOTS & ARROW */}
            <div className="ai-center-connector">
              <div className="ai-dot-matrix">
                <span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span>
              </div>
              <div className="ai-flow-arrow">
                <span className="arrow-icon">→</span>
              </div>
              <div className="ai-flow-label">AI SYNTHESIS</div>
            </div>

            {/* RIGHT PANE: GENERATED OUTPUT CARD */}
            <div className="ai-right-output-pane">
              <div className="ai-output-card">
                {/* Action Button at Top of Card */}
                <div className="ai-output-action-bar">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="ai-generate-btn"
                  >
                    {isGenerating ? (
                      <>
                        <span className="ai-spinner-dot"></span>
                        Synthesizing...
                      </>
                    ) : (
                      currentTool.buttonLabel
                    )}
                  </button>

                  <div className="ai-output-controls">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="ai-copy-btn"
                      title="Copy to clipboard"
                    >
                      {copied ? '✓ Copied' : '📋 Copy'}
                    </button>
                    <Link
                      href="/resume-builder"
                      className="ai-edit-btn"
                      title="Open full editor"
                    >
                      ✏ Edit in Builder
                    </Link>
                  </div>
                </div>

                {/* Document Letter Content */}
                <div className={`ai-letter-content ${isGenerating ? 'generating' : ''}`}>
                  {/* Sender Header */}
                  <div className="ai-letter-sender">
                    <div className="ai-sender-name">{currentTool.rightDoc.senderName}</div>
                    {currentTool.rightDoc.senderMeta.map((meta, i) => (
                      <div key={i} className="ai-sender-meta">{meta}</div>
                    ))}
                  </div>

                  {/* Salutation */}
                  <div className="ai-letter-salutation">
                    {currentTool.rightDoc.salutation}
                  </div>

                  {/* Paragraphs */}
                  <div className="ai-letter-body">
                    {currentTool.rightDoc.paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>

                  {/* Sign-off */}
                  <div className="ai-letter-signoff">
                    <p>{currentTool.rightDoc.signOff}</p>
                    <p className="ai-signoff-name">{currentTool.rightDoc.signOffName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CAROUSEL PAGINATION PILLS UNDERNEATH MOCKUP */}
        <div className="ai-toolkit-pagination reveal">
          <div className="ai-pagination-dots">
            {TOOLS.map((tool, idx) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  setActiveTabIdx(idx);
                  setCopied(false);
                }}
                className={`ai-pag-dot ${activeTabIdx === idx ? 'active' : ''}`}
                aria-label={`Switch to ${tool.tabLabel}`}
                title={tool.tabLabel}
              />
            ))}
          </div>

          {/* BOTTOM CTA BUTTON */}
          <div className="ai-toolkit-bottom-cta">
            <Link
              href="/register"
              className="btn btn-primary ai-btn-try-free"
            >
              TRY FOR FREE
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
