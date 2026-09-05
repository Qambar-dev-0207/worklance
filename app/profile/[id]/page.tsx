'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PublicCandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const userId = params?.id as string;

  useEffect(() => {
    if (!userId) return;
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile/${userId}`);
      const data = await res.json();
      if (data.success && data.user) {
        setProfile(data.user);
      } else {
        setError(data.error || 'Candidate profile not found');
      }
    } catch (err: any) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyProfileLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="container" style={{ padding: '40px 32px 80px', flex: 1, maxWidth: '960px' }}>
        {/* TOP BAR / BACK LINK */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button
            onClick={() => router.back()}
            className="btn btn-outline"
            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '100px' }}
          >
            ← Back
          </button>
          <button
            onClick={handleCopyProfileLink}
            className="btn btn-outline"
            style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '100px' }}
          >
            {copiedLink ? '✓ Profile Link Copied!' : '🔗 Share Candidate Profile'}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#71717A' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>Loading candidate profile...</div>
          </div>
        ) : error || !profile ? (
          <div style={{ background: '#fff', padding: '60px 40px', borderRadius: '24px', textAlign: 'center', border: '1px solid #E4E4E7' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Profile Not Found</h2>
            <p style={{ color: '#71717A', marginBottom: '24px' }}>
              {error || 'The requested user profile does not exist or has been made private.'}
            </p>
            <Link href="/jobs" className="btn btn-primary" style={{ borderRadius: '100px' }}>
              Browse Job Hub
            </Link>
          </div>
        ) : (
          <div>
            {/* HERO PROFILE CARD */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                border: '1px solid #E4E4E7',
                padding: '36px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                marginBottom: '28px',
                display: 'flex',
                gap: '28px',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: '#000000',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {profile.avatar || profile.name?.slice(0, 2).toUpperCase() || 'WL'}
              </div>

              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
                    {profile.name}
                  </h1>
                  <span
                    style={{
                      background: '#000000',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '100px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Verified Candidate
                  </span>
                  {profile.atsScore && (
                    <span
                      style={{
                        background: '#DCFCE7',
                        color: '#166534',
                        border: '1px solid #BBF7D0',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '100px',
                      }}
                    >
                      🎯 {profile.atsScore}% ATS Score
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '16px', fontWeight: 600, color: '#27272A', marginBottom: '8px' }}>
                  {profile.title || 'Tech Professional'} {profile.company ? `at ${profile.company}` : ''}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13.5px', color: '#71717A', marginBottom: '16px' }}>
                  {profile.location && <span>📍 {profile.location}</span>}
                  {profile.email && <span>✉️ {profile.email}</span>}
                  {profile.phone && <span>📞 {profile.phone}</span>}
                  {profile.availability && <span>⏱️ Available: {profile.availability}</span>}
                  {profile.workPreference && <span>💼 Work Style: {profile.workPreference}</span>}
                </div>

                {/* SOCIAL / PORTFOLIO BADGES */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {profile.portfolioUrl && (
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline"
                      style={{ padding: '6px 14px', fontSize: '12.5px', borderRadius: '100px' }}
                    >
                      🌐 Portfolio Website
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline"
                      style={{ padding: '6px 14px', fontSize: '12.5px', borderRadius: '100px' }}
                    >
                      🐙 GitHub Profile
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline"
                      style={{ padding: '6px 14px', fontSize: '12.5px', borderRadius: '100px' }}
                    >
                      💼 LinkedIn Profile
                    </a>
                  )}
                  {profile.resumeUrl && (
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                      style={{ padding: '6px 16px', fontSize: '12.5px', borderRadius: '100px' }}
                    >
                      📄 Download ATS Resume
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* BIO & SUMMARY */}
            {profile.bio && (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E4E4E7',
                  padding: '28px',
                  marginBottom: '24px',
                }}
              >
                <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '12px' }}>Professional Summary</h3>
                <p style={{ color: '#52525B', fontSize: '14.5px', lineHeight: 1.7, margin: 0 }}>
                  {profile.bio}
                </p>
              </div>
            )}

            {/* SKILLS */}
            {profile.skills && profile.skills.length > 0 && (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E4E4E7',
                  padding: '28px',
                  marginBottom: '24px',
                }}
              >
                <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '14px' }}>Technical Skills & Competencies</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profile.skills.map((s: string, idx: number) => (
                    <span
                      key={idx}
                      style={{
                        background: '#000000',
                        color: '#FFFFFF',
                        padding: '6px 14px',
                        borderRadius: '100px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* WORK EXPERIENCE */}
            {profile.experience && profile.experience.length > 0 && (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E4E4E7',
                  padding: '28px',
                  marginBottom: '24px',
                }}
              >
                <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '18px' }}>Work Experience</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {profile.experience.map((exp: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        borderLeft: '3px solid #000000',
                        paddingLeft: '18px',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: '#18181B' }}>{exp.role}</div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#52525B' }}>
                            {exp.company} {exp.location ? `• ${exp.location}` : ''}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            background: exp.current ? '#000000' : '#F4F4F5',
                            color: exp.current ? '#FFFFFF' : '#71717A',
                            padding: '3px 10px',
                            borderRadius: '100px',
                          }}
                        >
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate || 'Present'}
                        </span>
                      </div>
                      {exp.description && (
                        <p style={{ color: '#71717A', fontSize: '13.5px', marginTop: '8px', lineHeight: 1.6 }}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROJECTS SHOWCASE */}
            {profile.projects && profile.projects.length > 0 && (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E4E4E7',
                  padding: '28px',
                  marginBottom: '24px',
                }}
              >
                <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '18px' }}>Featured Projects</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {profile.projects.map((proj: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        background: '#FAFAFA',
                        border: '1px solid #E4E4E7',
                        borderRadius: '16px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '15.5px', fontWeight: 800, marginBottom: '6px' }}>{proj.title}</div>
                        <p style={{ color: '#71717A', fontSize: '13px', lineHeight: 1.5, marginBottom: '12px' }}>
                          {proj.description}
                        </p>
                        {proj.techStack && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                            {proj.techStack.map((tech: string, tIdx: number) => (
                              <span
                                key={tIdx}
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  background: '#E4E4E7',
                                  color: '#18181B',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                }}
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '12px', fontWeight: 700, color: '#000000', textDecoration: 'underline' }}
                          >
                            Live Demo ↗
                          </a>
                        )}
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '12px', fontWeight: 700, color: '#71717A', textDecoration: 'underline' }}
                          >
                            Source Code ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EDUCATION */}
            {profile.education && profile.education.length > 0 && (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E4E4E7',
                  padding: '28px',
                  marginBottom: '24px',
                }}
              >
                <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '16px' }}>Education</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {profile.education.map((edu: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 800 }}>{edu.degree}</div>
                        <div style={{ fontSize: '13.5px', color: '#52525B' }}>
                          {edu.school} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}
                        </div>
                        {edu.grade && <div style={{ fontSize: '12.5px', color: '#71717A', marginTop: '2px' }}>Grade: {edu.grade}</div>}
                      </div>
                      <span style={{ fontSize: '12.5px', color: '#71717A', fontWeight: 600 }}>
                        {edu.startYear} – {edu.endYear}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
