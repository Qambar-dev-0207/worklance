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
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const uStr = localStorage.getItem('worklance_user');
    if (uStr) {
      try {
        setCurrentUser(JSON.parse(uStr));
      } catch (e) {}
    }
  }, []);

  // Calculate dynamic ATS Score
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-soft)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO BANNER */}
      <div style={{ background: 'var(--navy-deep)', color: '#fff', padding: '50px 0 40px' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--orange-2)' }}>Naukri + LinkedIn ATS Engine</div>
            <h1 style={{ fontSize: '38px', color: '#fff', marginBottom: '8px' }}>
              Build an ATS-Optimized Resume
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15.5px' }}>
              Pass corporate recruiter bots and get shortlisted by top companies across India.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', padding: '18px 26px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
            <div style={{ fontSize: '12.5px', color: 'var(--orange-2)', fontWeight: 700, textTransform: 'uppercase' }}>Live ATS Score</div>
            <div style={{ fontSize: '34px', fontWeight: 900, color: '#34D399' }}>{calculateAtsScore()}%</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Optimized for Tech Recruiters</div>
          </div>
        </div>
      </div>

      {/* MAIN BUILDER CONTAINER */}
      <div className="container" style={{ padding: '40px 32px 80px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* LEFT FORM EDITORS */}
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid var(--line)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--navy-deep)' }}>
              📄 Edit Resume Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Target Role / Title</label>
                <input
                  type="text"
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>LinkedIn URL</label>
                  <input
                    type="text"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Professional Summary</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '13.5px', outline: 'none', lineHeight: 1.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Key Technical Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Education</label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT ATS RESUME SHEET PREVIEW */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                Live ATS Resume Preview
              </div>
              <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13.5px' }}>
                🖨️ Download / Print PDF
              </button>
            </div>

            <div className="ats-resume-sheet">
              <h1>{fullName}</h1>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--orange-2)', marginBottom: '6px' }}>{targetTitle}</div>
              <div style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span>📍 {location}</span>
                <span>•</span>
                <span>✉️ {email}</span>
                <span>•</span>
                <span>📞 {phone}</span>
                <span>•</span>
                <span>🔗 {linkedIn}</span>
              </div>

              <div className="ats-section-title">Professional Summary</div>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#334155' }}>{summary}</p>

              <div className="ats-section-title">Work Experience</div>
              {experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
                    <span>{exp.role} — {exp.company}</span>
                    <span style={{ fontSize: '12.5px', color: '#64748B' }}>{exp.duration}</span>
                  </div>
                  <ul style={{ listStyle: 'disc', paddingLeft: '18px', marginTop: '6px', fontSize: '13px', color: '#334155' }}>
                    {exp.points.map((pt, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="ats-section-title">Technical Skills</div>
              <p style={{ fontSize: '13px', color: '#334155' }}>{skills}</p>

              <div className="ats-section-title">Education & Certifications</div>
              <p style={{ fontSize: '13px', color: '#334155' }}>{education}</p>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
