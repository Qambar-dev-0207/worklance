'use client';

import { useState, useEffect, useRef } from 'react';
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

interface ExperienceItem {
  id?: string;
  company: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

interface EducationItem {
  id?: string;
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startYear?: string;
  endYear?: string;
  grade?: string;
}

interface ProjectItem {
  id?: string;
  title: string;
  description: string;
  liveUrl?: string;
  githubUrl?: string;
  techStack?: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [myPostedJobs, setMyPostedJobs] = useState<JobItem[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobItem[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'posted_jobs' | 'saved_jobs'>('overview');

  // Candidate Inspection & Status Update Modal for Recruiters
  const [selectedCandidateApp, setSelectedCandidateApp] = useState<ApplicationItem | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [candidateFilterJobId, setCandidateFilterJobId] = useState<string>('All');
  const [candidateSearch, setCandidateSearch] = useState('');

  // Edit / Builder Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editorTab, setEditorTab] = useState<'basics' | 'experience' | 'education' | 'projects' | 'preferences'>('basics');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [availability, setAvailability] = useState('Immediately');
  const [workPreference, setWorkPreference] = useState<'Remote' | 'Hybrid' | 'On-site' | 'Any'>('Any');

  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([]);
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [projectList, setProjectList] = useState<ProjectItem[]>([]);

  const [savingProfile, setSavingProfile] = useState(false);
  const [autoFillingResume, setAutoFillingResume] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const syncStateFromUser = (u: any) => {
    setUser(u);
    setName(u.name || '');
    setTitle(u.title || '');
    setCompany(u.company || '');
    setBio(u.bio || '');
    setResumeUrl(u.resumeUrl || '');
    setSkills(Array.isArray(u.skills) ? u.skills.join(', ') : u.skills || '');
    setPhone(u.phone || '');
    setLocation(u.location || '');
    setGithubUrl(u.githubUrl || '');
    setLinkedinUrl(u.linkedinUrl || '');
    setPortfolioUrl(u.portfolioUrl || '');
    setTwitterUrl(u.twitterUrl || '');
    setTargetRole(u.targetRole || '');
    setExpectedSalary(u.expectedSalary || '');
    setExperienceYears(u.experienceYears || '');
    setAvailability(u.availability || 'Immediately');
    setWorkPreference(u.workPreference || 'Any');
    setExperienceList(u.experience || []);
    setEducationList(u.education || []);
    setProjectList(u.projects || []);
  };

  useEffect(() => {
    const uStr = localStorage.getItem('worklance_user');
    if (!uStr) {
      window.location.href = '/login?redirect=/profile';
      return;
    }
    try {
      const u = JSON.parse(uStr);
      syncStateFromUser(u);
      if (u.role === 'recruiter') {
        setActiveTab('posted_jobs');
      }
    } catch (e) {}

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
      if (res.status === 401) {
        localStorage.removeItem('worklance_user');
        window.location.href = '/login?redirect=/profile';
        return;
      }
      const data = await res.json();
      if (data.success && data.user) {
        syncStateFromUser(data.user);
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
          phone,
          location,
          githubUrl,
          linkedinUrl,
          portfolioUrl,
          twitterUrl,
          targetRole,
          expectedSalary,
          experienceYears,
          availability,
          workPreference,
          experience: experienceList,
          education: educationList,
          projects: projectList,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      syncStateFromUser(data.user);
      localStorage.setItem('worklance_user', JSON.stringify(data.user));
      setProfileMsg('✓ Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setProfileMsg(''), 3500);
    } catch (err: any) {
      setProfileMsg(`Error: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  // 1-Click Auto-Fill from Resume Upload
  const handleAutoFillFromResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAutoFillingResume(true);
    setProfileMsg('⏳ Parsing resume and auto-generating profile fields...');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to parse resume');
      }

      const p = data.data;
      if (p.name && !name) setName(p.name);
      if (p.email && user && !user.email) user.email = p.email;
      if (p.phone) setPhone(p.phone);
      if (p.location) setLocation(p.location);
      if (p.summary) setBio(p.summary);
      if (p.skills && p.skills.length > 0) {
        setSkills(p.skills.join(', '));
      }

      if (p.experience && p.experience.length > 0) {
        const newExp = p.experience.map((exp: any) => ({
          id: 'exp_' + Math.random().toString(36).substring(2, 7),
          company: exp.company || 'Tech Company',
          role: exp.role || 'Software Engineer',
          location: exp.location || location || '',
          startDate: exp.duration?.split('-')?.[0]?.trim() || '2022',
          endDate: exp.duration?.split('-')?.[1]?.trim() || 'Present',
          current: exp.duration?.toLowerCase().includes('present') || false,
          description: Array.isArray(exp.bulletPoints) ? exp.bulletPoints.join(' ') : exp.bulletPoints || '',
        }));
        setExperienceList(newExp);
      }

      if (p.education && p.education.length > 0) {
        const newEdu = p.education.map((edu: any) => ({
          id: 'edu_' + Math.random().toString(36).substring(2, 7),
          school: edu.institution || edu.school || 'University',
          degree: edu.degree || 'Bachelor of Technology',
          fieldOfStudy: edu.fieldOfStudy || 'Computer Science',
          startYear: '2018',
          endYear: edu.year || '2022',
          grade: edu.gpa || '',
        }));
        setEducationList(newEdu);
      }

      setIsEditing(true);
      setProfileMsg('✓ Success! Your profile has been auto-filled from your resume. Review and click Save Profile.');
    } catch (err: any) {
      setProfileMsg('Notice: Could not fully parse resume automatically. ' + err.message);
    } finally {
      setAutoFillingResume(false);
    }
  };

  // Helper dynamic experience management
  const handleAddExperience = () => {
    setExperienceList([
      ...experienceList,
      {
        id: 'exp_' + Date.now(),
        company: '',
        role: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      },
    ]);
  };

  const handleUpdateExperience = (idx: number, field: string, val: any) => {
    const updated = [...experienceList];
    updated[idx] = { ...updated[idx], [field]: val };
    setExperienceList(updated);
  };

  const handleRemoveExperience = (idx: number) => {
    setExperienceList(experienceList.filter((_, i) => i !== idx));
  };

  // Helper dynamic education management
  const handleAddEducation = () => {
    setEducationList([
      ...educationList,
      {
        id: 'edu_' + Date.now(),
        school: '',
        degree: '',
        fieldOfStudy: '',
        startYear: '',
        endYear: '',
        grade: '',
      },
    ]);
  };

  const handleUpdateEducation = (idx: number, field: string, val: any) => {
    const updated = [...educationList];
    updated[idx] = { ...updated[idx], [field]: val };
    setEducationList(updated);
  };

  const handleRemoveEducation = (idx: number) => {
    setEducationList(educationList.filter((_, i) => i !== idx));
  };

  // Helper dynamic project management
  const handleAddProject = () => {
    setProjectList([
      ...projectList,
      {
        id: 'proj_' + Date.now(),
        title: '',
        description: '',
        liveUrl: '',
        githubUrl: '',
        techStack: [],
      },
    ]);
  };

  const handleUpdateProject = (idx: number, field: string, val: any) => {
    const updated = [...projectList];
    if (field === 'techStack' && typeof val === 'string') {
      updated[idx] = { ...updated[idx], techStack: val.split(',').map((s) => s.trim()).filter(Boolean) };
    } else {
      updated[idx] = { ...updated[idx], [field]: val };
    }
    setProjectList(updated);
  };

  const handleRemoveProject = (idx: number) => {
    setProjectList(projectList.filter((_, i) => i !== idx));
  };

  // Profile Completion Calculation
  const calculateProfileScore = () => {
    let score = 0;
    if (name && user?.email) score += 20;
    if (title || bio) score += 15;
    if (location || phone) score += 15;
    if (githubUrl || linkedinUrl || portfolioUrl) score += 15;
    if (experienceList && experienceList.length > 0) score += 15;
    if (educationList && educationList.length > 0) score += 10;
    if (projectList && projectList.length > 0) score += 10;
    return Math.min(100, score);
  };

  const profileScore = calculateProfileScore();

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
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('worklance_user');
    setUser(null);
    router.push('/login');
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

  // Filter candidates for recruiters
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

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="container" style={{ padding: '40px 32px 80px', flex: 1, maxWidth: '1040px' }}>
        {profileMsg && (
          <div style={{ background: '#000000', color: '#FFFFFF', padding: '14px 20px', borderRadius: '14px', marginBottom: '24px', fontSize: '14px', fontWeight: 700 }}>
            {profileMsg}
          </div>
        )}

        {/* PROFILE COMPLETION BANNER */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E4E4E7',
            borderRadius: '20px',
            padding: '20px 24px',
            marginBottom: '28px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#18181B' }}>
                Profile Strength: {profileScore}%
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: profileScore >= 80 ? '#166534' : '#B45309' }}>
                {profileScore >= 80 ? '🌟 Highly Competitive Profile' : '⚡ Complete details to rank higher for recruiters'}
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#F4F4F5', borderRadius: '100px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${profileScore}%`,
                  height: '100%',
                  background: '#000000',
                  borderRadius: '100px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAutoFillFromResume}
              accept=".pdf,.docx,.txt"
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={autoFillingResume}
              className="btn btn-outline"
              style={{ borderRadius: '100px', padding: '8px 16px', fontSize: '12.5px', fontWeight: 700 }}
              title="Upload existing resume to auto-populate all profile fields"
            >
              {autoFillingResume ? '⏳ Parsing...' : '📄 1-Click Auto-Fill from Resume'}
            </button>
            <Link
              href={`/profile/${user._id || user.id || 'usr_2'}`}
              className="btn btn-outline"
              style={{ borderRadius: '100px', padding: '8px 16px', fontSize: '12.5px', fontWeight: 700 }}
            >
              🔗 Public View
            </Link>
          </div>
        </div>

        {/* HERO PROFILE CARD */}
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
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: '#000000',
              color: '#fff',
              fontWeight: 900,
              fontSize: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #E4E4E7',
              flexShrink: 0,
            }}
          >
            {user.avatar || user.name?.slice(0, 2).toUpperCase() || 'WL'}
          </div>

          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#000000', letterSpacing: '-0.02em', margin: 0 }}>
                {user.name}
              </h1>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 800,
                  background: user.role === 'recruiter' ? '#000000' : '#27272A',
                  color: '#fff',
                  padding: '3px 12px',
                  borderRadius: '100px',
                  textTransform: 'capitalize',
                }}
              >
                {user.role === 'recruiter' ? '🏢 Recruiter / Hiring Lead' : '👤 Candidate Profile'}
              </span>
            </div>

            <p style={{ fontSize: '14.5px', color: '#52525B', marginTop: '4px', fontWeight: 600 }}>
              {user.title || user.email} {user.company ? `· ${user.company}` : ''}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '13px', color: '#71717A', marginTop: '6px' }}>
              {user.location && <span>📍 {user.location}</span>}
              {user.phone && <span>📞 {user.phone}</span>}
              {user.targetRole && <span>🎯 Target: {user.targetRole}</span>}
              {user.workPreference && <span>💼 Style: {user.workPreference}</span>}
            </div>

            {user.bio && (
              <p style={{ fontSize: '13.5px', color: '#3F3F46', marginTop: '8px', lineHeight: 1.5 }}>
                {user.bio}
              </p>
            )}

            {user.skills && user.skills.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                {(Array.isArray(user.skills) ? user.skills : [user.skills]).map((s: string, idx: number) => (
                  <span key={idx} style={{ fontSize: '11.5px', background: '#F4F4F5', color: '#3F3F46', padding: '3px 10px', borderRadius: '100px', fontWeight: 700 }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-primary"
              style={{ borderRadius: '100px', padding: '9px 20px', fontSize: '13px', fontWeight: 700 }}
            >
              {isEditing ? 'Close Editor' : '✏️ Build / Edit Profile'}
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-outline"
              style={{ borderRadius: '100px', padding: '9px 18px', fontSize: '13px', color: '#DC2626', borderColor: '#FECACA' }}
            >
              Log Out
            </button>
          </div>
        </div>

        {/* FULL PROFILE BUILDER / EDITOR MODAL/CARD */}
        {isEditing && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              border: '2px solid #000000',
              padding: '32px',
              marginBottom: '36px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#000000' }}>Candidate Profile Builder</h2>
                <p style={{ fontSize: '13px', color: '#71717A' }}>
                  Update your credentials, experience, education, and portfolio to maximize ATS ranking.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-outline"
                  style={{ borderRadius: '100px', padding: '6px 14px', fontSize: '12px' }}
                >
                  ⚡ Auto-Fill From Resume
                </button>
              </div>
            </div>

            {/* EDITOR TABS */}
            <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #E4E4E7', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
              {[
                { id: 'basics', label: '1. Basics & Socials' },
                { id: 'experience', label: `2. Experience (${experienceList.length})` },
                { id: 'education', label: `3. Education (${educationList.length})` },
                { id: 'projects', label: `4. Projects (${projectList.length})` },
                { id: 'preferences', label: '5. Career Preferences' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEditorTab(t.id as any)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '100px',
                    fontSize: '13px',
                    fontWeight: editorTab === t.id ? 800 : 500,
                    background: editorTab === t.id ? '#000000' : '#F4F4F5',
                    color: editorTab === t.id ? '#FFFFFF' : '#52525B',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* TAB 1: BASICS & SOCIALS */}
              {editorTab === 'basics' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Full Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Headline / Current Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer | React & Next.js"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Location / City</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Bengaluru, India"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Company</label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. NextGen Labs"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Bio / Executive Summary</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="High-impact 2-3 sentence overview highlighting technical strengths, years of experience, and key accomplishments."
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', lineHeight: 1.5 }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Portfolio Website</label>
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://yourname.dev"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>GitHub Profile</label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>LinkedIn Profile</label>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WORK EXPERIENCE */}
              {editorTab === 'experience' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700 }}>Career History</span>
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="btn btn-outline"
                      style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '100px' }}
                    >
                      + Add Position
                    </button>
                  </div>

                  {experienceList.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', background: '#FAFAFA', borderRadius: '14px', color: '#71717A', fontSize: '13.5px' }}>
                      No work experience added yet. Click <strong>+ Add Position</strong> above to list your career achievements.
                    </div>
                  ) : (
                    experienceList.map((exp, idx) => (
                      <div key={idx} style={{ padding: '18px', background: '#FAFAFA', borderRadius: '14px', border: '1px solid #E4E4E7', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800 }}>Role #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(idx)}
                            style={{ color: '#DC2626', background: 'none', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}
                          >
                            Remove
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <input
                            type="text"
                            placeholder="Company Name *"
                            value={exp.company}
                            onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px' }}
                          />
                          <input
                            type="text"
                            placeholder="Job Title / Role *"
                            value={exp.role}
                            onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                          <input
                            type="text"
                            placeholder="Start Date (e.g. 2022-04)"
                            value={exp.startDate}
                            onChange={(e) => handleUpdateExperience(idx, 'startDate', e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px' }}
                          />
                          <input
                            type="text"
                            placeholder="End Date (e.g. Present)"
                            value={exp.endDate}
                            onChange={(e) => handleUpdateExperience(idx, 'endDate', e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px' }}
                          />
                          <input
                            type="text"
                            placeholder="Location (e.g. Bengaluru)"
                            value={exp.location}
                            onChange={(e) => handleUpdateExperience(idx, 'location', e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px' }}
                          />
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Key responsibilities, metrics, and achievements..."
                          value={exp.description}
                          onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px' }}
                        />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: EDUCATION */}
              {editorTab === 'education' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700 }}>Education & Qualifications</span>
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className="btn btn-outline"
                      style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '100px' }}
                    >
                      + Add Education
                    </button>
                  </div>

                  {educationList.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', background: '#FAFAFA', borderRadius: '14px', color: '#71717A', fontSize: '13.5px' }}>
                      No education entries added yet.
                    </div>
                  ) : (
                    educationList.map((edu, idx) => (
                      <div key={idx} style={{ padding: '18px', background: '#FAFAFA', borderRadius: '14px', border: '1px solid #E4E4E7', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800 }}>Qualification #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(idx)}
                            style={{ color: '#DC2626', background: 'none', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}
                          >
                            Remove
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <input
                            type="text"
                            placeholder="University / College / School *"
                            value={edu.school}
                            onChange={(e) => handleUpdateEducation(idx, 'school', e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px' }}
                          />
                          <input
                            type="text"
                            placeholder="Degree (e.g. B.Tech, M.S., B.Sc) *"
                            value={edu.degree}
                            onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                          <input
                            type="text"
                            placeholder="Field of Study (e.g. Computer Science)"
                            value={edu.fieldOfStudy}
                            onChange={(e) => handleUpdateEducation(idx, 'fieldOfStudy', e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px' }}
                          />
                          <input
                            type="text"
                            placeholder="Graduation Year (e.g. 2024)"
                            value={edu.endYear}
                            onChange={(e) => handleUpdateEducation(idx, 'endYear', e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px' }}
                          />
                          <input
                            type="text"
                            placeholder="Grade / CGPA (e.g. 8.5 CGPA)"
                            value={edu.grade}
                            onChange={(e) => handleUpdateEducation(idx, 'grade', e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: PROJECTS SHOWCASE */}
              {editorTab === 'projects' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700 }}>Featured Projects & Repositories</span>
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="btn btn-outline"
                      style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '100px' }}
                    >
                      + Add Project
                    </button>
                  </div>

                  {projectList.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', background: '#FAFAFA', borderRadius: '14px', color: '#71717A', fontSize: '13.5px' }}>
                      No projects added yet. Showcasing 1-3 projects increases candidate shortlisting by 3x!
                    </div>
                  ) : (
                    projectList.map((proj, idx) => (
                      <div key={idx} style={{ padding: '18px', background: '#FAFAFA', borderRadius: '14px', border: '1px solid #E4E4E7', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800 }}>Project #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveProject(idx)}
                            style={{ color: '#DC2626', background: 'none', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Project Title *"
                          value={proj.title}
                          onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px' }}
                        />
                        <textarea
                          rows={2}
                          placeholder="Project description and key technical highlights..."
                          value={proj.description}
                          onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <input
                            type="url"
                            placeholder="Live Demo URL (https://...)"
                            value={proj.liveUrl}
                            onChange={(e) => handleUpdateProject(idx, 'liveUrl', e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px' }}
                          />
                          <input
                            type="url"
                            placeholder="GitHub Repository URL (https://...)"
                            value={proj.githubUrl}
                            onChange={(e) => handleUpdateProject(idx, 'githubUrl', e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px' }}
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Tech Stack (comma-separated, e.g. React, Next.js, Redis, Tailwind)"
                          value={proj.techStack?.join(', ') || ''}
                          onChange={(e) => handleUpdateProject(idx, 'techStack', e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '13px' }}
                        />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: PREFERENCES & SKILLS */}
              {editorTab === 'preferences' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Key Technical Skills (Comma-separated) *</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. React, Next.js, Node.js, TypeScript, Docker, GraphQL"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Desired Target Role</label>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Senior Full Stack Engineer"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Expected Annual CTC / Salary</label>
                      <input
                        type="text"
                        value={expectedSalary}
                        onChange={(e) => setExpectedSalary(e.target.value)}
                        placeholder="e.g. ₹24,00,000 - ₹32,00,000"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Experience Level</label>
                      <input
                        type="text"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        placeholder="e.g. 4.5 Years"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Notice / Availability</label>
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px' }}
                      >
                        <option value="Immediately">Immediately (Serving Notice / Open)</option>
                        <option value="15 Days">15 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="60-90 Days">60 - 90 Days</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Work Style</label>
                      <select
                        value={workPreference}
                        onChange={(e: any) => setWorkPreference(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px' }}
                      >
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                        <option value="Any">Flexible / Any</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>ATS Resume Link (PDF / Cloud)</label>
                    <input
                      type="url"
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="https://drive.google.com/your-resume.pdf"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid #E4E4E7', paddingTop: '16px' }}>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline" style={{ borderRadius: '100px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={savingProfile} className="btn btn-primary" style={{ borderRadius: '100px', fontWeight: 700, padding: '10px 24px' }}>
                  {savingProfile ? 'Saving Changes...' : 'Save Complete Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* WORKSPACE NAVIGATION TABS */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E4E4E7', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
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
                  border: 'none',
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
                  border: 'none',
                }}
              >
                🎯 Candidate ATS Pipeline ({applications.length})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '100px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  background: activeTab === 'overview' ? '#000000' : 'transparent',
                  color: activeTab === 'overview' ? '#FFFFFF' : '#71717A',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                👤 Full Profile & Portfolio
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
                  border: 'none',
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
                  border: 'none',
                }}
              >
                ⭐ Saved Jobs ({savedJobs.length})
              </button>
            </>
          )}
        </div>

        {/* TAB: FULL PROFILE & PORTFOLIO OVERVIEW */}
        {activeTab === 'overview' && user.role !== 'recruiter' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* WORK EXPERIENCE */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E4E4E7', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Work Experience</h3>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditorTab('experience');
                  }}
                  className="btn btn-outline"
                  style={{ padding: '5px 14px', fontSize: '12px', borderRadius: '100px' }}
                >
                  + Add / Edit
                </button>
              </div>

              {experienceList.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', background: '#FAFAFA', borderRadius: '14px', color: '#71717A', fontSize: '13.5px' }}>
                  No experience records added yet. Click <strong>+ Add / Edit</strong> to highlight your career history.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {experienceList.map((exp, idx) => (
                    <div key={idx} style={{ borderLeft: '3px solid #000000', paddingLeft: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: '#18181B' }}>{exp.role}</div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#52525B' }}>
                            {exp.company} {exp.location ? `• ${exp.location}` : ''}
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, background: exp.current ? '#000000' : '#F4F4F5', color: exp.current ? '#FFFFFF' : '#71717A', padding: '3px 10px', borderRadius: '100px' }}>
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
              )}
            </div>

            {/* PROJECTS */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E4E4E7', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Featured Projects</h3>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditorTab('projects');
                  }}
                  className="btn btn-outline"
                  style={{ padding: '5px 14px', fontSize: '12px', borderRadius: '100px' }}
                >
                  + Add / Edit
                </button>
              </div>

              {projectList.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', background: '#FAFAFA', borderRadius: '14px', color: '#71717A', fontSize: '13.5px' }}>
                  No featured projects yet. Adding projects showcases your practical engineering capability.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {projectList.map((proj, idx) => (
                    <div key={idx} style={{ background: '#FAFAFA', border: '1px solid #E4E4E7', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '15.5px', fontWeight: 800, marginBottom: '6px' }}>{proj.title}</div>
                        <p style={{ color: '#71717A', fontSize: '13px', lineHeight: 1.5, marginBottom: '12px' }}>
                          {proj.description}
                        </p>
                        {proj.techStack && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                            {proj.techStack.map((tech, tIdx) => (
                              <span key={tIdx} style={{ fontSize: '11px', fontWeight: 700, background: '#E4E4E7', color: '#18181B', padding: '2px 8px', borderRadius: '6px' }}>
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {proj.liveUrl && (
                          <a href={proj.liveUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', fontWeight: 700, color: '#000000', textDecoration: 'underline' }}>
                            Live Demo ↗
                          </a>
                        )}
                        {proj.githubUrl && (
                          <a href={proj.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', fontWeight: 700, color: '#71717A', textDecoration: 'underline' }}>
                            GitHub ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* EDUCATION */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E4E4E7', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Education</h3>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditorTab('education');
                  }}
                  className="btn btn-outline"
                  style={{ padding: '5px 14px', fontSize: '12px', borderRadius: '100px' }}
                >
                  + Add / Edit
                </button>
              </div>

              {educationList.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', background: '#FAFAFA', borderRadius: '14px', color: '#71717A', fontSize: '13.5px' }}>
                  No education entries yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {educationList.map((edu, idx) => (
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
              )}
            </div>
          </div>
        )}

        {/* TAB: RECRUITER POSTED JOBS */}
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
                        👥 Inspect Applicants ({job.applicantCount || 0})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: APPLICATIONS / CANDIDATE ATS PIPELINE */}
        {activeTab === 'applications' && (
          <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #E4E4E7', padding: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#000000' }}>
                {user.role === 'recruiter' ? 'Candidate Review Pipeline' : 'My Job Applications'}
              </h2>
              <p style={{ fontSize: '13.5px', color: '#71717A' }}>
                {user.role === 'recruiter'
                  ? 'Review applicant submissions, match scores, and move candidates through hiring stages.'
                  : 'Track status changes and interview invitations for your submitted applications.'}
              </p>
            </div>

            {loadingApps ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#71717A' }}>Loading application pipeline...</div>
            ) : filteredCandidates.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#F4F4F5', borderRadius: '16px' }}>
                <p style={{ fontSize: '14.5px', color: '#71717A', marginBottom: '14px' }}>
                  {user.role === 'recruiter' ? 'No candidate applications received yet.' : 'You have not submitted any applications yet.'}
                </p>
                <Link href="/jobs" className="btn btn-primary" style={{ borderRadius: '100px' }}>
                  Explore Opportunities in Job Hub
                </Link>
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
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15.5px', fontWeight: 800, color: '#000000' }}>
                          {user.role === 'recruiter' ? app.applicantName : app.jobId?.title || 'Job Application'}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '100px',
                            background: app.status === 'Offered' ? '#166534' : app.status === 'Interviewing' ? '#1D4ED8' : '#27272A',
                            color: '#FFFFFF',
                          }}
                        >
                          {app.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#71717A' }}>
                        {user.role === 'recruiter' ? `${app.applicantEmail} • Applied for: ${app.jobId?.title}` : `${app.jobId?.company} • Applied on ${new Date(app.createdAt).toLocaleDateString()}`}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {user.role === 'recruiter' && (
                        <select
                          value={app.status}
                          disabled={updatingStatusId === app._id}
                          onChange={(e) => handleUpdateApplicantStatus(app._id, e.target.value)}
                          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '12.5px', fontWeight: 700 }}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Offered">Offered</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      )}
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '100px' }}
                        >
                          📄 Resume
                        </a>
                      )}
                      {user.role !== 'recruiter' && (
                        <button
                          onClick={() => handleWithdrawApp(app._id)}
                          style={{ color: '#DC2626', background: 'none', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: SAVED JOBS */}
        {activeTab === 'saved_jobs' && (
          <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #E4E4E7', padding: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#000000', marginBottom: '6px' }}>Bookmarked Opportunities</h2>
            <p style={{ fontSize: '13.5px', color: '#71717A', marginBottom: '20px' }}>Your shortlisted roles ready for ATS application.</p>

            {savedJobs.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#F4F4F5', borderRadius: '16px' }}>
                <p style={{ fontSize: '14.5px', color: '#71717A', marginBottom: '14px' }}>You have not saved any jobs yet.</p>
                <Link href="/jobs" className="btn btn-primary" style={{ borderRadius: '100px' }}>
                  Explore Opportunities in Job Hub
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
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#000000', marginBottom: '2px' }}>{job.title}</h3>
                      <div style={{ fontSize: '13px', color: '#71717A' }}>
                        {job.company} · {job.location} · {job.salary}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Link href="/jobs" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '12.5px', borderRadius: '100px' }}>
                        Apply Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
