'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface JobItem {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyAbout?: string;
  companyIndustry?: string;
  companySize?: string;
  companyWebsite?: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid';
  salary: string;
  description: string;
  responsibilities?: string[];
  requirements: string[];
  benefits?: string[];
  tags: string[];
  applicantCount: number;
  createdAt: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  
  // LinkedIn-Style Modal & Action States
  const [viewingJob, setViewingJob] = useState<JobItem | null>(null);
  const [detailTab, setDetailTab] = useState<'job' | 'company' | 'apply'>('job');
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [copiedShare, setCopiedShare] = useState(false);

  // Application Form States
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyMessage, setApplyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('worklance_user');
    if (!userStr) {
      window.location.href = '/login?redirect=/jobs';
      return;
    }
    try {
      const u = JSON.parse(userStr);
      setCurrentUser(u);
      if (u.resumeUrl) setResumeUrl(u.resumeUrl);
    } catch (e) {}

    const savedStr = localStorage.getItem('worklance_saved_jobs');
    if (savedStr) {
      try {
        setSavedJobIds(JSON.parse(savedStr));
      } catch (e) {}
    }
  }, []);

  const toggleSaveJob = (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: string[];
    if (savedJobIds.includes(jobId)) {
      updated = savedJobIds.filter((id) => id !== jobId);
    } else {
      updated = [...savedJobIds, jobId];
    }
    setSavedJobIds(updated);
    localStorage.setItem('worklance_saved_jobs', JSON.stringify(updated));
  };

  const handleShareJob = (job: JobItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareUrl = `${window.location.origin}/jobs?id=${job._id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (locationFilter) params.set('location', locationFilter);
      if (selectedType !== 'All') params.set('type', selectedType);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);

        // Auto-open direct shared job link if present in URL
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const sharedId = urlParams.get('id');
          if (sharedId) {
            const found = data.jobs.find((j: JobItem) => j._id === sharedId || (j as any).id === sharedId);
            if (found) {
              setViewingJob(found);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const [scraping, setScraping] = useState(false);
  const [scrapeNotice, setScrapeNotice] = useState('');

  const handleScrapeLiveJobs = async (customKeyword?: string) => {
    setScraping(true);
    setScrapeNotice('');
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'jobs',
          keyword: customKeyword || keyword || '',
          location: locationFilter || '',
          limit: 8,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setScrapeNotice(data.message || `Scraped ${data.scrapedCount} live developer jobs!`);
        fetchJobs();
        setTimeout(() => setScrapeNotice(''), 4000);
      } else {
        alert(data.error || 'Failed to scrape live jobs');
      }
    } catch (err: any) {
      alert('Scraper error: ' + err.message);
    } finally {
      setScraping(false);
    }
  };

  const handleSeedDatabase = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Database populated with sample jobs, hackathons, and HR directory!');
        fetchJobs();
      }
    } catch (err) {
      alert('Failed to seed database');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingJob) return;
    setApplyLoading(true);
    setApplyMessage(null);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: viewingJob._id,
          coverLetter,
          resumeUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setApplyMessage({ type: 'success', text: '🎉 Application submitted successfully! Track it in your profile.' });
      setTimeout(() => {
        setViewingJob(null);
        setApplyMessage(null);
        setCoverLetter('');
        setResumeUrl('');
        fetchJobs();
      }, 1800);
    } catch (err: any) {
      setApplyMessage({ type: 'error', text: err.message });
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* JOB SEARCH HERO BANNER (MONOTONE) */}
      <div style={{ background: '#000000', color: '#fff', padding: '54px 0 44px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container">
          <div style={{ maxWidth: '700px', marginBottom: '24px' }}>
            <div className="eyebrow" style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
              Job Opportunities
            </div>
            <h1 style={{ fontSize: '38px', color: '#fff', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.02em' }}>
              Find your next role at top tech companies
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15.5px' }}>
              Inspect complete job specifications, company insights, salary benchmarks, and direct recruiter contact.
            </p>
          </div>

          {/* SEARCH BAR */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '8px',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              maxWidth: '820px',
            }}
          >
            <input
              type="text"
              placeholder="Job title, skills, or company (e.g. React, Node, Frontend)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{
                flex: 2,
                minWidth: '220px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #E4E4E7',
                fontSize: '14px',
                outline: 'none',
                color: '#000000',
              }}
            />
            <input
              type="text"
              placeholder="City or 'Remote' (e.g. Bengaluru, Remote)"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              style={{
                flex: 1,
                minWidth: '160px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #E4E4E7',
                fontSize: '14px',
                outline: 'none',
                color: '#000000',
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: 700 }}>
              Search Jobs
            </button>
            <button
              type="button"
              onClick={() => handleScrapeLiveJobs()}
              disabled={scraping}
              className="btn btn-outline"
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                fontWeight: 800,
                background: '#000000',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
              }}
              title="Scrape live developer jobs from public feeds"
            >
              {scraping ? '⏳ Scraping...' : '⚡ Scrape Live Jobs'}
            </button>
          </form>

          {scrapeNotice && (
            <div style={{ marginTop: '12px', color: '#166534', background: '#DCFCE7', border: '1px solid #BBF7D0', padding: '8px 16px', borderRadius: '100px', display: 'inline-block', fontSize: '13px', fontWeight: 700 }}>
              {scrapeNotice}
            </div>
          )}

          {/* QUICK SCRAPE CATEGORY CHIPS */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '14px' }}>
            <span style={{ fontSize: '12px', color: '#71717A', fontWeight: 600 }}>Quick Scrape:</span>
            {['Full Stack', 'AI/ML', 'DevOps', 'Frontend', 'Remote'].map((cat) => (
              <button
                key={cat}
                type="button"
                disabled={scraping}
                onClick={() => handleScrapeLiveJobs(cat)}
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  background: '#F4F4F5',
                  color: '#18181B',
                  border: '1px solid #E4E4E7',
                  padding: '3px 10px',
                  borderRadius: '100px',
                  cursor: 'pointer',
                }}
              >
                + Scrape {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="container" style={{ padding: '40px 32px 80px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', alignItems: 'flex-start' }}>
          {/* SIDEBAR FILTERS */}
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              border: '1px solid var(--line)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '18px' }}>Work Type</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['All', 'Full-time', 'Remote', 'Hybrid', 'Contract'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontWeight: selectedType === type ? 700 : 500,
                    background: selectedType === type ? 'var(--navy-deep)' : 'var(--bg-soft)',
                    color: selectedType === type ? '#fff' : 'var(--navy)',
                    textAlign: 'left',
                  }}
                >
                  <span>{type}</span>
                </button>
              ))}
            </div>

            {savedJobIds.length > 0 && (
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--orange-2)', marginBottom: '4px' }}>
                  🔖 Saved Jobs ({savedJobIds.length})
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Your bookmarked opportunities are saved to this device.
                </p>
              </div>
            )}

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
              <h3 style={{ fontSize: '14.5px', fontWeight: 700, marginBottom: '10px' }}>Sample Data Helper</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Need sample job posts? Seed the database with 1-click:
              </p>
              <button onClick={handleSeedDatabase} className="btn btn-outline" style={{ width: '100%', fontSize: '12.5px', padding: '8px' }}>
                ⚡ Seed Sample Jobs
              </button>
            </div>
          </div>

          {/* JOBS FEED LIST */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
                {loading ? 'Searching jobs...' : `${jobs.length} Job Opportunities Available`}
              </h2>
              {currentUser?.role === 'recruiter' && (
                <Link href="/jobs/post" className="btn btn-primary" style={{ fontSize: '13.5px', padding: '8px 16px' }}>
                  + Post New Job
                </Link>
              )}
            </div>

            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '20px', color: 'var(--text-muted)' }}>
                Loading jobs...
              </div>
            ) : jobs.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '20px', border: '1px solid var(--line)' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No jobs match your search</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Try resetting filters or click below to populate sample jobs.
                </p>
                <button onClick={handleSeedDatabase} className="btn btn-primary">
                  Seed Sample Jobs
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {jobs.map((job) => {
                  const isSaved = savedJobIds.includes(job._id);
                  return (
                    <div
                      key={job._id}
                      onClick={() => {
                        setViewingJob(job);
                        setDetailTab('job');
                      }}
                      style={{
                        background: '#fff',
                        border: '1px solid var(--line)',
                        borderRadius: '20px',
                        padding: '24px',
                        boxShadow: 'var(--shadow-sm)',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        position: 'relative',
                      }}
                      className="job-opportunity-card"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '14px',
                              background: 'var(--navy-deep)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '16px',
                              boxShadow: '0 4px 12px rgba(15,23,42,0.15)',
                            }}
                          >
                            {job.company.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h3 style={{ fontSize: '18.5px', fontWeight: 700, margin: 0, color: 'var(--navy-deep)' }}>
                                {job.title}
                              </h3>
                              <span style={{ fontSize: '11px', color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>
                                Verified
                              </span>
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '3px' }}>
                              <strong style={{ color: 'var(--navy)', fontWeight: 600 }}>{job.company}</strong> · {job.location}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            onClick={(e) => toggleSaveJob(job._id, e)}
                            title={isSaved ? 'Remove Bookmark' : 'Save Job'}
                            style={{
                              border: 'none',
                              background: isSaved ? '#FEF3C7' : 'var(--bg-soft-2)',
                              color: isSaved ? '#D97706' : 'var(--navy)',
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '16px',
                            }}
                          >
                            {isSaved ? '★' : '☆'}
                          </button>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              padding: '5px 14px',
                              borderRadius: '100px',
                              background: job.type === 'Remote' ? '#DCFCE7' : 'var(--bg-soft-2)',
                              color: job.type === 'Remote' ? '#166534' : 'var(--navy)',
                            }}
                          >
                            {job.type}
                          </span>
                        </div>
                      </div>

                      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.6 }}>
                        {job.description.slice(0, 190)}...
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {job.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '11.5px',
                                fontWeight: 600,
                                background: 'var(--bg-soft-2)',
                                color: 'var(--navy)',
                                padding: '4px 10px',
                                borderRadius: '100px',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--orange-2)' }}>{job.salary}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingJob(job);
                              setDetailTab('apply');
                            }}
                            className="btn btn-primary"
                            style={{ padding: '8px 20px', fontSize: '13.5px' }}
                          >
                            Easy Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LINKEDIN-STYLE JOB & COMPANY DETAILS MODAL CARD */}
      {viewingJob && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setViewingJob(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '24px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setViewingJob(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                fontSize: '18px',
                fontWeight: 700,
                cursor: 'pointer',
                background: 'var(--bg-soft-2)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              ✕
            </button>

            {/* MODAL HEADER CARD */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                color: '#fff',
                padding: '32px 32px 24px',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: 'var(--orange-2)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '22px',
                    boxShadow: '0 8px 20px rgba(234, 88, 12, 0.3)',
                    flexShrink: 0,
                  }}
                >
                  {viewingJob.company.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--orange-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {viewingJob.companyIndustry || 'Software & Tech'}
                    </span>
                    <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '2px 8px', borderRadius: '100px' }}>
                      ✓ Verified Employer
                    </span>
                  </div>
                  <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '4px', marginBottom: '6px', lineHeight: 1.3 }}>
                    {viewingJob.title}
                  </h1>
                  <div style={{ fontSize: '14.5px', color: 'rgba(255,255,255,0.8)', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <strong style={{ color: '#fff' }}>{viewingJob.company}</strong>
                    <span>·</span>
                    <span>📍 {viewingJob.location}</span>
                    <span>·</span>
                    <span style={{ color: '#34D399', fontWeight: 600 }}>{viewingJob.type}</span>
                    <span>·</span>
                    <span>👥 {viewingJob.applicantCount} applicants</span>
                  </div>
                </div>
              </div>

              {/* SALARY & TAGS ROW */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#F59E0B' }}>
                  {viewingJob.salary}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={(e) => handleShareJob(viewingJob, e)}
                    className="btn"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '8px 16px',
                      fontSize: '13px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    {copiedShare ? '✓ Link Copied!' : '🔗 Share'}
                  </button>

                  <button
                    onClick={(e) => toggleSaveJob(viewingJob._id, e)}
                    className="btn"
                    style={{
                      background: savedJobIds.includes(viewingJob._id) ? '#FEF3C7' : 'rgba(255,255,255,0.1)',
                      color: savedJobIds.includes(viewingJob._id) ? '#D97706' : '#fff',
                      padding: '8px 16px',
                      fontSize: '13px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    {savedJobIds.includes(viewingJob._id) ? '★ Saved' : '☆ Save Job'}
                  </button>

                  <button
                    onClick={() => setDetailTab('apply')}
                    className="btn btn-primary"
                    style={{ padding: '9px 22px', fontSize: '14px', borderRadius: '10px' }}
                  >
                    Easy Apply
                  </button>
                </div>
              </div>
            </div>

            {/* TAB NAVIGATION BAR */}
            <div
              style={{
                display: 'flex',
                background: '#F8FAFC',
                borderBottom: '1px solid var(--line)',
                padding: '0 32px',
                gap: '24px',
              }}
            >
              <button
                onClick={() => setDetailTab('job')}
                style={{
                  padding: '14px 4px',
                  fontWeight: detailTab === 'job' ? 700 : 500,
                  color: detailTab === 'job' ? 'var(--orange-2)' : 'var(--text-muted)',
                  borderBottom: detailTab === 'job' ? '3px solid var(--orange-2)' : '3px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  fontSize: '14.5px',
                }}
              >
                📋 About the Job
              </button>
              <button
                onClick={() => setDetailTab('company')}
                style={{
                  padding: '14px 4px',
                  fontWeight: detailTab === 'company' ? 700 : 500,
                  color: detailTab === 'company' ? 'var(--orange-2)' : 'var(--text-muted)',
                  borderBottom: detailTab === 'company' ? '3px solid var(--orange-2)' : '3px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  fontSize: '14.5px',
                }}
              >
                🏢 About the Company
              </button>
              <button
                onClick={() => setDetailTab('apply')}
                style={{
                  padding: '14px 4px',
                  fontWeight: detailTab === 'apply' ? 700 : 500,
                  color: detailTab === 'apply' ? 'var(--orange-2)' : 'var(--text-muted)',
                  borderBottom: detailTab === 'apply' ? '3px solid var(--orange-2)' : '3px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  fontSize: '14.5px',
                }}
              >
                🚀 Apply Now
              </button>
            </div>

            {/* TAB CONTENT PANEL */}
            <div style={{ padding: '32px', flex: 1, minHeight: '320px' }}>
              {/* TAB 1: ABOUT THE JOB */}
              {detailTab === 'job' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: 'var(--navy-deep)' }}>
                      Role Overview
                    </h3>
                    <p style={{ fontSize: '14.5px', lineHeight: 1.7, color: '#334155' }}>
                      {viewingJob.description}
                    </p>
                  </div>

                  {/* RESPONSIBILITIES */}
                  {viewingJob.responsibilities && viewingJob.responsibilities.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', color: '#000000' }}>
                        Key Responsibilities
                      </h3>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: 0, margin: 0, listStyle: 'none' }}>
                        {viewingJob.responsibilities.map((resp, i) => (
                          <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: '#27272A', lineHeight: 1.5 }}>
                            <span style={{ color: '#000000', fontWeight: 800 }}>✓</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* REQUIREMENTS */}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', color: '#000000' }}>
                      Qualifications & Requirements
                    </h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: 0, margin: 0, listStyle: 'none' }}>
                      {viewingJob.requirements.map((req, i) => (
                        <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: '#27272A', lineHeight: 1.5 }}>
                          <span style={{ color: '#000000', fontWeight: 800 }}>•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* SKILLS REQUIRED */}
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '10px', color: '#000000' }}>
                      Required Tech Stack & Skills
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {viewingJob.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            background: '#F4F4F5',
                            color: '#18181B',
                            padding: '5px 12px',
                            borderRadius: '100px',
                            border: '1px solid #E4E4E7',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* BENEFITS & PERKS */}
                  {viewingJob.benefits && viewingJob.benefits.length > 0 && (
                    <div style={{ background: '#F4F4F5', borderRadius: '16px', padding: '20px', border: '1px solid #E4E4E7' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '10px', color: '#000000' }}>
                        🎁 Perks & Benefits
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {viewingJob.benefits.map((b, i) => (
                          <div key={i} style={{ fontSize: '13px', color: '#27272A', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span>✨</span> {b}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI INTERVIEW TIP CTA */}
                  <div style={{ background: '#000000', color: '#fff', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Worklance AI Career OS</div>
                      <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#fff' }}>Prepare for {viewingJob.company} Interview Questions</div>
                      <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)' }}>Practice AI mock interviews & view previous technical questions.</div>
                    </div>
                    <Link href="/interview-prep" className="btn btn-primary" style={{ fontSize: '13px', padding: '9px 18px', whiteSpace: 'nowrap', borderRadius: '100px', background: '#FFFFFF', color: '#000000' }}>
                      Start Practice 🎤
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 2: ABOUT THE COMPANY */}
              {detailTab === 'company' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: 'var(--navy-deep)' }}>
                      About {viewingJob.company}
                    </h3>
                    <p style={{ fontSize: '14.5px', lineHeight: 1.7, color: '#334155' }}>
                      {viewingJob.companyAbout || `${viewingJob.company} is a leading innovation enterprise focused on scaling high-impact software solutions, fostering developer talent, and building modern cloud products across India.`}
                    </p>
                  </div>

                  {/* COMPANY METRICS GRID */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Industry</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-deep)', marginTop: '4px' }}>
                        {viewingJob.companyIndustry || 'Software & Cloud Technology'}
                      </div>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Company Size</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-deep)', marginTop: '4px' }}>
                        {viewingJob.companySize || '250 - 500 employees'}
                      </div>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Headquarters</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-deep)', marginTop: '4px' }}>
                        {viewingJob.location}
                      </div>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Official Website</div>
                      <a
                        href={viewingJob.companyWebsite || '#'}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '15px', fontWeight: 700, color: '#2563EB', marginTop: '4px', display: 'inline-block' }}
                      >
                        {viewingJob.companyWebsite || `https://${viewingJob.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`} ↗
                      </a>
                    </div>
                  </div>

                  {/* RECRUITER & HIRING MANAGER CARD */}
                  <div style={{ border: '1px solid var(--line)', borderRadius: '18px', padding: '20px', background: '#fff' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                      Hiring Team for this Role
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'var(--navy-deep)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '16px',
                          }}
                        >
                          AK
                        </div>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy-deep)' }}>Ankit Kapoor</div>
                          <div style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                            Talent Acquisition Lead at {viewingJob.company}
                          </div>
                        </div>
                      </div>

                      <Link href="/hr-database" className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 16px' }}>
                        Message HR Contact 💬
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: APPLY NOW */}
              {detailTab === 'apply' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <span className="eyebrow">Easy Application</span>
                    <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>Apply to {viewingJob.title}</h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                      Submit your application directly to the recruiter at {viewingJob.company}.
                    </p>
                  </div>

                  {applyMessage && (
                    <div
                      style={{
                        background: applyMessage.type === 'success' ? '#DCFCE7' : '#FEE2E2',
                        color: applyMessage.type === 'success' ? '#166534' : '#991B1B',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 600,
                        marginBottom: '20px',
                      }}
                    >
                      {applyMessage.text}
                    </div>
                  )}

                  <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>
                        Cover Letter / Pitch to Hiring Manager
                      </label>
                      <textarea
                        rows={4}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Highlight your relevant React/Next.js achievements and why you're excited about this role..."
                        style={{
                          width: '100%',
                          padding: '14px',
                          borderRadius: '12px',
                          border: '1px solid var(--line)',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>
                        Resume Link / Portfolio URL (Google Drive, Cloud PDF, or Notion)
                      </label>
                      <input
                        type="url"
                        required
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                        placeholder="https://drive.google.com/your-resume.pdf"
                        style={{
                          width: '100%',
                          padding: '14px',
                          borderRadius: '12px',
                          border: '1px solid var(--line)',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button type="button" onClick={() => setViewingJob(null)} className="btn btn-outline">
                        Cancel
                      </button>
                      <button type="submit" disabled={applyLoading} className="btn btn-primary btn-lg">
                        {applyLoading ? 'Submitting Application...' : 'Submit Application Now 🚀'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
