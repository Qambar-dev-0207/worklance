'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ApplicationItem {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
  };
  applicantId?: string;
  applicantName: string;
  applicantEmail: string;
  coverLetter?: string;
  resumeUrl?: string;
  status: 'Applied' | 'Shortlisted' | 'Interviewing' | 'Offered' | 'Rejected';
  createdAt: string;
}

interface JobItem {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  applicantCount: number;
  createdAt: string;
  tags?: string[];
  description?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [myPostedJobs, setMyPostedJobs] = useState<JobItem[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobItem[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [activeTab, setActiveTab] = useState<'applications' | 'posted_jobs' | 'saved_jobs'>('applications');

  // Candidate Inspection & Status Update Modal for Recruiters
  const [selectedCandidateApp, setSelectedCandidateApp] = useState<ApplicationItem | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [candidateFilterJobId, setCandidateFilterJobId] = useState<string>('All');
  const [candidateSearch, setCandidateSearch] = useState('');

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    const uStr = localStorage.getItem('worklance_user');
    if (uStr) {
      try {
        const u = JSON.parse(uStr);
        setUser(u);
        setName(u.name || '');
        setTitle(u.title || '');
        setCompany(u.company || '');
        setBio(u.bio || '');
        setResumeUrl(u.resumeUrl || '');
        setSkills(Array.isArray(u.skills) ? u.skills.join(', ') : u.skills || '');
        if (u.role === 'recruiter') {
          setActiveTab('posted_jobs');
        }
      } catch (e) {}
    }

    fetchFreshProfile();
    fetchMyApplications();
    fetchSavedJobs();
  }, []);

  useEffect(() => {
    if (user?.role === 'recruiter') {
      fetchMyPostedJobs();
    }
  }, [user]);

  const fetchFreshProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setName(data.user.name || '');
        setTitle(data.user.title || '');
        setCompany(data.user.company || '');
        setBio(data.user.bio || '');
        setResumeUrl(data.user.resumeUrl || '');
        setSkills(Array.isArray(data.user.skills) ? data.user.skills.join(', ') : data.user.skills || '');
        localStorage.setItem('worklance_user', JSON.stringify(data.user));
      }
    } catch (e) {}
  };

  const fetchMyApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchMyPostedJobs = async () => {
    if (!user) return;
    setLoadingJobs(true);
    try {
      const res = await fetch(`/api/jobs?postedBy=${user._id || user.id || 'usr_1'}`);
      const data = await res.json();
      if (data.success) {
        setMyPostedJobs(data.jobs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchSavedJobs = async () => {
    const savedStr = localStorage.getItem('worklance_saved_jobs');
    if (!savedStr) return;
    try {
      const ids: string[] = JSON.parse(savedStr);
      if (ids.length === 0) {
        setSavedJobs([]);
        return;
      }
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.success) {
        const matches = (data.jobs || []).filter((j: any) => ids.includes(j._id) || ids.includes(j.id));
        setSavedJobs(matches);
      }
    } catch (e) {}
  };

  const handleRemoveSavedJob = (jobId: string) => {
    const savedStr = localStorage.getItem('worklance_saved_jobs');
    if (savedStr) {
      try {
        const ids: string[] = JSON.parse(savedStr);
        const updated = ids.filter((id) => id !== jobId);
        localStorage.setItem('worklance_saved_jobs', JSON.stringify(updated));
        setSavedJobs(savedJobs.filter((j) => j._id !== jobId));
      } catch (e) {}
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          title,
          company,
          bio,
          skills,
          resumeUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setUser(data.user);
      localStorage.setItem('worklance_user', JSON.stringify(data.user));
      setProfileMsg('✓ Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err: any) {
      setProfileMsg(`Error: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateApplicantStatus = async (appId: string, newStatus: string) => {
    setUpdatingStatusId(appId);
    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId, status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update applicant status');
      }

      // Update state in applications list
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus as any } : a))
      );

      if (selectedCandidateApp && selectedCandidateApp._id === appId) {
        setSelectedCandidateApp({ ...selectedCandidateApp, status: newStatus as any });
      }
    } catch (err: any) {
      alert(`Could not update status: ${err.message}`);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleWithdrawApp = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    try {
      const res = await fetch(`/api/applications?id=${appId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setApplications(applications.filter((a) => a._id !== appId));
      } else {
        alert(data.error || 'Failed to withdraw application');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE' });
    localStorage.removeItem('worklance_user');
    setUser(null);
    router.push('/');
    router.refresh();
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center', maxWidth: '400px', border: '1px solid #E4E4E7' }}>
            <h2 style={{ marginBottom: '12px', fontWeight: 800 }}>Please Log In</h2>
            <p style={{ color: '#71717A', marginBottom: '20px', fontSize: '14px' }}>
              Log in to view your profile, applications, posted roles, and saved jobs.
            </p>
            <Link href="/login" className="btn btn-primary btn-lg" style={{ width: '100%', borderRadius: '100px' }}>
              Log In
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Filter candidate pipeline for recruiters
  const filteredCandidates = applications.filter((app) => {
    if (candidateFilterJobId !== 'All') {
      const jId = (app.jobId as any)?._id || (app.jobId as any)?.id || app.jobId;
      if (jId !== candidateFilterJobId) return false;
    }
    if (candidateSearch) {
      const s = candidateSearch.toLowerCase();
      const matchName = app.applicantName?.toLowerCase().includes(s);
      const matchEmail = app.applicantEmail?.toLowerCase().includes(s);
      const matchJob = app.jobId?.title?.toLowerCase().includes(s);
      if (!matchName && !matchEmail && !matchJob) return false;
    }
    return true;
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Offered':
        return { background: '#059669', color: '#FFFFFF' };
      case 'Interviewing':
        return { background: '#7C3AED', color: '#FFFFFF' };
      case 'Shortlisted':
        return { background: '#2563EB', color: '#FFFFFF' };
      case 'Rejected':
        return { background: '#DC2626', color: '#FFFFFF' };
      default:
        return { background: '#000000', color: '#FFFFFF' };
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="container" style={{ padding: '40px 32px 80px', flex: 1, maxWidth: '1000px' }}>
        {profileMsg && (
          <div style={{ background: '#000000', color: '#FFFFFF', padding: '12px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '13.5px', fontWeight: 700 }}>
            {profileMsg}
          </div>
        )}

        {/* USER INFO HEADER CARD */}
        <div
          style={{
            background: '#fff',
            borderRadius: '24px',
            border: '1px solid #E4E4E7',
            padding: '32px',
            marginBottom: '32px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#000000',
              color: '#fff',
              fontWeight: 800,
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #E4E4E7',
            }}
          >
            {user.avatar || user.name.slice(0, 2).toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#000000', letterSpacing: '-0.02em' }}>{user.name}</h1>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  background: user.role === 'recruiter' ? '#000000' : '#27272A',
                  color: '#fff',
                  padding: '3px 12px',
                  borderRadius: '100px',
                  textTransform: 'capitalize',
                }}
              >
                {user.role === 'recruiter' ? '🏢 Recruiter / Hiring Lead' : '👤 Candidate Account'}
              </span>
            </div>
            <p style={{ fontSize: '14.5px', color: '#71717A', marginTop: '2px' }}>
              {user.title ? user.title : user.email} {user.company ? `· ${user.company}` : ''}
            </p>
            {user.bio && (
              <p style={{ fontSize: '13.5px', color: '#27272A', marginTop: '6px', lineHeight: 1.5 }}>
                {user.bio}
              </p>
            )}
            {user.skills && user.skills.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                {(Array.isArray(user.skills) ? user.skills : [user.skills]).map((s: string, idx: number) => (
                  <span key={idx} style={{ fontSize: '11.5px', background: '#F4F4F5', color: '#3F3F46', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-outline"
              style={{ borderRadius: '100px', padding: '8px 18px', fontSize: '13px', fontWeight: 700 }}
            >
              {isEditing ? 'Cancel Edit' : '✏️ Edit Profile'}
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-outline"
              style={{ borderRadius: '100px', padding: '8px 18px', fontSize: '13px', color: '#DC2626', borderColor: '#FECACA' }}
            >
              Log Out
            </button>
          </div>
        </div>

        {/* EDIT PROFILE COLLAPSIBLE FORM */}
        {isEditing && (
          <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #E4E4E7', padding: '32px', marginBottom: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Edit Your Profile Details</h2>
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#18181B' }}>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#18181B' }}>Target Role / Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Full Stack Engineer"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#18181B' }}>Company / Organization</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Worklance / Open to Work"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#18181B' }}>Key Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. React, Next.js, Node.js, TypeScript"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#18181B' }}>Resume Link (Google Drive / URL)</label>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/your-resume.pdf"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#18181B' }}>Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short professional summary..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', outline: 'none', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline" style={{ borderRadius: '100px' }}>Cancel</button>
                <button type="submit" disabled={savingProfile} className="btn btn-primary" style={{ borderRadius: '100px', fontWeight: 700 }}>
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* WORKSPACE NAVIGATION TABS */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E4E4E7', paddingBottom: '12px', marginBottom: '24px' }}>
          {user.role === 'recruiter' ? (
            <>
              <button
                onClick={() => setActiveTab('posted_jobs')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '100px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  background: activeTab === 'posted_jobs' ? '#000000' : 'transparent',
                  color: activeTab === 'posted_jobs' ? '#FFFFFF' : '#71717A',
                  cursor: 'pointer',
                }}
              >
                🏢 My Posted Jobs ({myPostedJobs.length})
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '100px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  background: activeTab === 'applications' ? '#000000' : 'transparent',
                  color: activeTab === 'applications' ? '#FFFFFF' : '#71717A',
                  cursor: 'pointer',
                }}
              >
                🎯 Candidate ATS Pipeline ({applications.length})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('applications')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '100px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  background: activeTab === 'applications' ? '#000000' : 'transparent',
                  color: activeTab === 'applications' ? '#FFFFFF' : '#71717A',
                  cursor: 'pointer',
                }}
              >
                📑 My Applications ({applications.length})
              </button>
              <button
                onClick={() => setActiveTab('saved_jobs')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '100px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  background: activeTab === 'saved_jobs' ? '#000000' : 'transparent',
                  color: activeTab === 'saved_jobs' ? '#FFFFFF' : '#71717A',
                  cursor: 'pointer',
                }}
              >
                ⭐ Saved Jobs ({savedJobs.length})
              </button>
            </>
          )}
        </div>

        {/* TAB 1: RECRUITER POSTED JOBS */}
        {activeTab === 'posted_jobs' && user.role === 'recruiter' && (
          <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #E4E4E7', padding: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#000000' }}>Active Job Postings</h2>
                <p style={{ fontSize: '13.5px', color: '#71717A' }}>Manage published roles and monitor applicant volume in real time.</p>
              </div>
              <Link href="/jobs/post" className="btn btn-primary" style={{ borderRadius: '100px', padding: '9px 20px', fontWeight: 700 }}>
                + Post a New Role
              </Link>
            </div>

            {loadingJobs ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#71717A' }}>Loading posted roles...</div>
            ) : myPostedJobs.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#F4F4F5', borderRadius: '16px' }}>
                <p style={{ fontSize: '14.5px', color: '#71717A', marginBottom: '14px' }}>
                  You haven't posted any job listings yet.
                </p>
                <Link href="/jobs/post" className="btn btn-primary" style={{ borderRadius: '100px' }}>
                  Create Your First Job Posting
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {myPostedJobs.map((job) => (
                  <div
                    key={job._id}
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      border: '1px solid #E4E4E7',
                      background: '#FFFFFF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '2px', color: '#000000' }}>
                        {job.title}
                      </h3>
                      <div style={{ fontSize: '13px', color: '#71717A' }}>
                        {job.company} · {job.location} · {job.type} · {job.salary}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={() => {
                          setCandidateFilterJobId(job._id);
                          setActiveTab('applications');
                        }}
                        className="btn btn-outline"
                        style={{ padding: '7px 14px', fontSize: '12.5px', borderRadius: '100px', fontWeight: 700 }}
                      >
                        👥 {job.applicantCount || 0} Applicants
                      </button>
                      <Link
                        href={`/jobs?id=${job._id}`}
                        className="btn btn-primary"
                        style={{ padding: '7px 16px', fontSize: '12.5px', borderRadius: '100px', fontWeight: 700 }}
                      >
                        View Live Job
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RECRUITER CANDIDATE ATS PIPELINE */}
        {activeTab === 'applications' && user.role === 'recruiter' && (
          <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #E4E4E7', padding: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#000000' }}>Candidate ATS Pipeline</h2>
                  <p style={{ fontSize: '13.5px', color: '#71717A' }}>Review applications, inspect resumes, and update hiring stages.</p>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#18181B' }}>
                  {filteredCandidates.length} Total Applicants
                </div>
              </div>

              {/* FILTERS FOR PIPELINE */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search candidate name, email, or role..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  style={{ flex: 1, minWidth: '220px', padding: '9px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', outline: 'none' }}
                />
                <select
                  value={candidateFilterJobId}
                  onChange={(e) => setCandidateFilterJobId(e.target.value)}
                  style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13px', fontWeight: 600, background: '#fff', outline: 'none' }}
                >
                  <option value="All">All Job Roles</option>
                  {myPostedJobs.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadingApps ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#71717A' }}>Loading candidate applications...</div>
            ) : filteredCandidates.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#F4F4F5', borderRadius: '16px' }}>
                <p style={{ fontSize: '14.5px', color: '#71717A' }}>
                  No candidate applications found for the selected filter.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredCandidates.map((app) => (
                  <div
                    key={app._id}
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      border: '1px solid #E4E4E7',
                      background: '#FFFFFF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '14px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#000000' }}>
                          {app.applicantName}
                        </h3>
                        <span style={{ fontSize: '12px', color: '#71717A' }}>({app.applicantEmail})</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#3F3F46' }}>
                        Applied for: <strong>{app.jobId?.title || 'Open Position'}</strong> · {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                      {app.coverLetter && (
                        <p style={{ fontSize: '12.5px', color: '#52525B', marginTop: '6px', fontStyle: 'italic', maxWidth: '520px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          "{app.coverLetter}"
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {/* STAGE SELECTOR */}
                      <select
                        value={app.status}
                        disabled={updatingStatusId === app._id}
                        onChange={(e) => handleUpdateApplicantStatus(app._id, e.target.value)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '100px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          outline: 'none',
                          border: 'none',
                          ...getStatusBadgeStyle(app.status),
                        }}
                      >
                        <option value="Applied" style={{ background: '#fff', color: '#000' }}>Applied</option>
                        <option value="Shortlisted" style={{ background: '#fff', color: '#000' }}>Shortlisted</option>
                        <option value="Interviewing" style={{ background: '#fff', color: '#000' }}>Interviewing</option>
                        <option value="Offered" style={{ background: '#fff', color: '#000' }}>Offered</option>
                        <option value="Rejected" style={{ background: '#fff', color: '#000' }}>Rejected</option>
                      </select>

                      <button
                        onClick={() => setSelectedCandidateApp(app)}
                        className="btn btn-outline"
                        style={{ padding: '7px 14px', fontSize: '12px', borderRadius: '100px', fontWeight: 700 }}
                      >
                        Inspect Application
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SEEKER APPLICATIONS */}
        {activeTab === 'applications' && user.role !== 'recruiter' && (
          <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #E4E4E7', padding: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#000000', letterSpacing: '-0.02em' }}>Application Tracker</h2>
              <span style={{ fontSize: '13px', color: '#71717A' }}>{applications.length} Applications</span>
            </div>

            {loadingApps ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#71717A' }}>Loading applications...</div>
            ) : applications.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#F4F4F5', borderRadius: '16px' }}>
                <p style={{ fontSize: '14.5px', color: '#71717A', marginBottom: '14px' }}>
                  You haven't submitted any job applications yet.
                </p>
                <Link href="/jobs" className="btn btn-primary" style={{ borderRadius: '100px' }}>
                  Explore & Apply to Open Roles
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {applications.map((app) => (
                  <div
                    key={app._id}
                    style={{
                      padding: '18px 20px',
                      borderRadius: '16px',
                      border: '1px solid #E4E4E7',
                      background: '#FFFFFF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '2px', color: '#000000' }}>
                        {app.jobId?.title || 'Applied Role'}
                      </h3>
                      <div style={{ fontSize: '13px', color: '#71717A' }}>
                        {app.jobId?.company} · {app.jobId?.location} · Applied on {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '5px 14px',
                          borderRadius: '100px',
                          ...getStatusBadgeStyle(app.status),
                        }}
                      >
                        ● {app.status}
                      </span>
                      <button
                        onClick={() => handleWithdrawApp(app._id)}
                        style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SAVED JOBS */}
        {activeTab === 'saved_jobs' && user.role !== 'recruiter' && (
          <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #E4E4E7', padding: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#000000' }}>Saved & Bookmarked Roles</h2>
                <p style={{ fontSize: '13.5px', color: '#71717A' }}>Quick access to opportunities you flagged for review.</p>
              </div>
              <span style={{ fontSize: '13px', color: '#71717A' }}>{savedJobs.length} Saved</span>
            </div>

            {savedJobs.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#F4F4F5', borderRadius: '16px' }}>
                <p style={{ fontSize: '14.5px', color: '#71717A', marginBottom: '14px' }}>
                  You haven't bookmarked any jobs yet.
                </p>
                <Link href="/jobs" className="btn btn-primary" style={{ borderRadius: '100px' }}>
                  Browse Job Hub
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {savedJobs.map((job) => (
                  <div
                    key={job._id}
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      border: '1px solid #E4E4E7',
                      background: '#FFFFFF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '2px', color: '#000000' }}>
                        {job.title}
                      </h3>
                      <div style={{ fontSize: '13px', color: '#71717A' }}>
                        {job.company} · {job.location} · {job.type} · {job.salary}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={() => handleRemoveSavedJob(job._id)}
                        style={{ background: 'none', border: 'none', color: '#71717A', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                      <Link
                        href={`/jobs?id=${job._id}`}
                        className="btn btn-primary"
                        style={{ padding: '7px 16px', fontSize: '12.5px', borderRadius: '100px', fontWeight: 700 }}
                      >
                        Inspect & Apply
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CANDIDATE INSPECTION MODAL */}
      {selectedCandidateApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedCandidateApp(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              padding: '36px',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCandidateApp(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '18px', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', color: '#71717A' }}
            >
              ✕
            </button>

            <span className="eyebrow" style={{ marginBottom: '8px' }}>Candidate Application Dossier</span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#000000', marginBottom: '4px' }}>
              {selectedCandidateApp.applicantName}
            </h2>
            <div style={{ fontSize: '13px', color: '#71717A', marginBottom: '20px' }}>
              {selectedCandidateApp.applicantEmail} · Applied on {new Date(selectedCandidateApp.createdAt).toLocaleDateString()}
            </div>

            <div style={{ background: '#F4F4F5', padding: '16px', borderRadius: '14px', marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#71717A', textTransform: 'uppercase', marginBottom: '6px' }}>Target Role</div>
              <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#000000' }}>{selectedCandidateApp.jobId?.title}</div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#71717A', textTransform: 'uppercase', marginBottom: '6px' }}>Cover Letter & Intro</div>
              <p style={{ fontSize: '13.5px', color: '#27272A', lineHeight: 1.6, background: '#FAFAFA', padding: '12px', borderRadius: '10px', border: '1px solid #E4E4E7' }}>
                {selectedCandidateApp.coverLetter || 'No cover letter submitted.'}
              </p>
            </div>

            {selectedCandidateApp.resumeUrl && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#71717A', textTransform: 'uppercase', marginBottom: '6px' }}>Resume Link</div>
                <a
                  href={selectedCandidateApp.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ display: 'inline-flex', padding: '8px 16px', fontSize: '13px', borderRadius: '100px', fontWeight: 700 }}
                >
                  📄 Open Candidate Resume ↗
                </a>
              </div>
            )}

            <div style={{ borderTop: '1px solid #E4E4E7', paddingTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>Hiring Stage:</div>
              <select
                value={selectedCandidateApp.status}
                onChange={(e) => handleUpdateApplicantStatus(selectedCandidateApp._id, e.target.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '100px',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  ...getStatusBadgeStyle(selectedCandidateApp.status),
                }}
              >
                <option value="Applied" style={{ background: '#fff', color: '#000' }}>Applied</option>
                <option value="Shortlisted" style={{ background: '#fff', color: '#000' }}>Shortlisted</option>
                <option value="Interviewing" style={{ background: '#fff', color: '#000' }}>Interviewing</option>
                <option value="Offered" style={{ background: '#fff', color: '#000' }}>Offered</option>
                <option value="Rejected" style={{ background: '#fff', color: '#000' }}>Rejected</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
