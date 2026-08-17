'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ResumeBuilderPage() {
  const [fullName, setFullName] = useState('Riya Sharma');
  const [targetTitle, setTargetTitle] = useState('Senior Frontend & Full Stack Engineer');
  const [email, setEmail] = useState('riya.sharma@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [location, setLocation] = useState('Bengaluru, Karnataka');
  const [linkedIn, setLinkedIn] = useState('linkedin.com/in/riyasharma-dev');
  
  const [summary, setSummary] = useState(
    'Results-driven Senior Frontend Engineer with 4+ years of experience architecting high-performance React and Next.js SaaS applications. Proven track record in optimizing web performance by 40%, managing state with Redux/Zustand, and integrating resilient Node.js microservices.'
  );

  const [experience, setExperience] = useState([
    {
      company: 'Zenith Tech Labs',
      role: 'Frontend Engineer Lead',
      duration: '2023 - Present',
      points: [
        'Architected Next.js 14 web application platform handling 1M+ monthly requests.',
        'Reduced Core Web Vitals LCP by 45% through dynamic code splitting and image optimization.',
        'Mentored junior engineers and instituted TypeScript best practices across 4 squad repositories.',
      ],
    },
    {
      company: 'Nexora Innovations',
      role: 'Software Engineer (Frontend)',
      duration: '2021 - 2023',
      points: [
        'Built real-time financial dashboards using React, Tailwind CSS, and WebSockets.',
        'Collaborated with product designers to construct a company-wide Figma design token system.',
      ],
    },
  ]);

  const [skills, setSkills] = useState('React, Next.js, TypeScript, Node.js, Express, MongoDB, Tailwind CSS, REST APIs, GraphQL, Jest, Git');
  const [education, setEducation] = useState('B.Tech in Computer Science — RV College of Engineering, Bengaluru (2017 - 2021)');
  
  // AI Review States
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Dynamic ATS Score Calculation
  const calculateAtsScore = () => {
    let score = 50;
    if (fullName && targetTitle && email && phone) score += 15;
    if (summary.length > 80) score += 10;
    if (experience.length >= 2) score += 15;
    if (skills.split(',').length >= 6) score += 10;
    return Math.min(score, 96);
  };

  const handlePrint = () => {
    window.print();
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
          summary,
          experience,
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

  const handleAddExperience = () => {
    setExperience([
      ...experience,
      {
        company: 'Company Name',
        role: 'Role Title',
        duration: '2022 - 2023',
        points: ['Accomplishment or project responsibility.'],
      },
    ]);
  };

  const handleRemoveExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO BANNER (MONOTONE) */}
      <div style={{ background: '#000000', color: '#fff', padding: '54px 0 44px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div className="eyebrow" style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
              ATS Resume Engine
            </div>
            <h1 style={{ fontSize: '38px', color: '#fff', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Build an ATS-Optimized Resume
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15.5px' }}>
              Pass corporate recruiter screening algorithms and get shortlisted by top companies.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ background: '#111115', padding: '16px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live ATS Score</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF' }}>{calculateAtsScore()}%</div>
              <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.5)' }}>Tech Bot Compliant</div>
            </div>

            <button
              onClick={handleRunAiReview}
              className="btn btn-primary"
              style={{ background: '#FFFFFF', color: '#000000', padding: '14px 22px', fontSize: '13.5px', fontWeight: 700, borderRadius: '100px' }}
            >
              🤖 AI Review & Critique
            </button>
          </div>
        </div>
      </div>

      {/* MAIN BUILDER CONTAINER */}
      <div className="container" style={{ padding: '40px 32px 80px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* LEFT FORM EDITORS */}
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #E4E4E7', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#000000' }}>
                📄 Edit Resume Details
              </h2>
              <span style={{ fontSize: '12px', color: '#71717A' }}>Live Auto-Updating</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#18181B' }}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#18181B' }}>Target Role / Title</label>
                <input
                  type="text"
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#18181B' }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#18181B' }}>Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }}
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
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#18181B' }}>LinkedIn URL</label>
                  <input
                    type="text"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#18181B' }}>Professional Summary</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', outline: 'none', lineHeight: 1.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#18181B' }}>Key Technical Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#18181B' }}>Work Experience</label>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    style={{ background: 'none', border: 'none', color: '#000000', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add Experience
                  </button>
                </div>
                {experience.map((exp, idx) => (
                  <div key={idx} style={{ background: '#F4F4F5', padding: '12px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #E4E4E7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].role = e.target.value;
                          setExperience(updated);
                        }}
                        placeholder="Role"
                        style={{ fontWeight: 600, fontSize: '13px', border: 'none', background: 'transparent', outline: 'none', width: '48%' }}
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].company = e.target.value;
                          setExperience(updated);
                        }}
                        placeholder="Company"
                        style={{ fontSize: '13px', border: 'none', background: 'transparent', outline: 'none', width: '48%', textAlign: 'right' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].duration = e.target.value;
                          setExperience(updated);
                        }}
                        placeholder="Duration (e.g. 2022 - Present)"
                        style={{ fontSize: '12px', color: '#71717A', border: 'none', background: 'transparent', outline: 'none', width: '70%' }}
                      />
                      {experience.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(idx)}
                          style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '11.5px', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#18181B' }}>Education</label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT ATS RESUME SHEET PREVIEW */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#000000' }}>
                Live ATS Resume Preview
              </div>
              <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13.5px', borderRadius: '100px' }}>
                🖨️ Download / Print PDF
              </button>
            </div>

            <div className="ats-resume-sheet" style={{ background: '#FFFFFF', padding: '36px', borderRadius: '12px', border: '1px solid #E4E4E7', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#000000', marginBottom: '4px', letterSpacing: '-0.02em' }}>{fullName}</h1>
              <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#3F3F46', marginBottom: '8px' }}>{targetTitle}</div>
              <div style={{ fontSize: '12.5px', color: '#71717A', marginBottom: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span>📍 {location}</span>
                <span>•</span>
                <span>✉️ {email}</span>
                <span>•</span>
                <span>📞 {phone}</span>
                <span>•</span>
                <span>🔗 {linkedIn}</span>
              </div>

              <div className="ats-section-title" style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1.5px solid #000000', paddingBottom: '4px', marginBottom: '8px', color: '#000000' }}>
                Professional Summary
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#27272A', marginBottom: '18px' }}>{summary}</p>

              <div className="ats-section-title" style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1.5px solid #000000', paddingBottom: '4px', marginBottom: '8px', color: '#000000' }}>
                Work Experience
              </div>
              {experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '13.5px', color: '#000000' }}>
                    <span>{exp.role} — {exp.company}</span>
                    <span style={{ fontSize: '12px', color: '#71717A' }}>{exp.duration}</span>
                  </div>
                  <ul style={{ listStyle: 'disc', paddingLeft: '18px', marginTop: '6px', fontSize: '12.5px', color: '#3F3F46', lineHeight: 1.5 }}>
                    {exp.points.map((pt, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="ats-section-title" style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1.5px solid #000000', paddingBottom: '4px', marginBottom: '8px', color: '#000000' }}>
                Technical Skills
              </div>
              <p style={{ fontSize: '13px', color: '#27272A', marginBottom: '18px' }}>{skills}</p>

              <div className="ats-section-title" style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1.5px solid #000000', paddingBottom: '4px', marginBottom: '8px', color: '#000000' }}>
                Education & Certifications
              </div>
              <p style={{ fontSize: '13px', color: '#27272A' }}>{education}</p>
            </div>
          </div>

        </div>
      </div>

      {/* AI REVIEW MODAL */}
      {showReviewModal && (
        <div
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
                    <div style={{ fontSize: '12px', color: '#A1A1AA' }}>Identified {reviewResult.keywordCount} key technical terms</div>
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
