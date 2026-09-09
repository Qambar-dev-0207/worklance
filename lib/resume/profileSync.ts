// Helper to synchronize ATS Resume data into the user profile in MongoDB Atlas & localStorage
import { ResumeData } from '@/types/resume';

export async function syncResumeToUserProfile(resume: ResumeData, atsScoreNum?: number) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('worklance_token') : null;
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('worklance_user') : null;
  const currentUser = userStr ? JSON.parse(userStr) : null;

  if (!currentUser && !token) {
    throw new Error('Please log in to synchronize your resume with your Worklance profile.');
  }

  // 1. Format Skills
  const allSkills = (resume.skills || [])
    .map((s) => s.skillsList)
    .join(', ')
    .split(/[,|•]/)
    .map((s) => s.trim())
    .filter(Boolean);

  // 2. Format Experience
  const expList = (resume.experience || []).map((e) => ({
    company: e.company || '',
    role: e.role || '',
    location: e.location || '',
    startDate: e.startDate || '',
    endDate: e.endDate || '',
    current: e.current || false,
    description: (e.bullets || []).map((b) => b.text).join(' '),
  }));

  // 3. Format Education
  const eduList = (resume.education || []).map((e) => {
    const parts = (e.graduationDate || '').split(/[-–—]/);
    return {
      school: e.institution || '',
      degree: e.degree || '',
      grade: e.gpa || '',
      fieldOfStudy: e.coursework || '',
      startYear: parts[0]?.trim() || '',
      endYear: parts[1]?.trim() || e.graduationDate || '',
    };
  });

  // 4. Format Projects
  const projList = (resume.projects || []).map((p) => ({
    title: p.name || '',
    description: (p.bullets || []).map((b) => b.text).join(' '),
    liveUrl: p.link || '',
    techStack: p.tech ? p.tech.split(',').map((t) => t.trim()).filter(Boolean) : [],
  }));

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const payload: any = {
    name: resume.personal?.fullName || currentUser?.name,
    title: resume.personal?.targetTitle || currentUser?.title,
    bio: resume.summary || currentUser?.bio,
    phone: resume.personal?.phone || currentUser?.phone,
    location: resume.personal?.location || currentUser?.location,
    githubUrl: resume.personal?.github || currentUser?.githubUrl,
    linkedinUrl: resume.personal?.linkedIn || currentUser?.linkedinUrl,
    portfolioUrl: resume.personal?.portfolio || currentUser?.portfolioUrl,
    skills: allSkills,
    experience: expList,
    education: eduList,
    projects: projList,
  };

  if (typeof atsScoreNum === 'number') {
    payload.atsScore = atsScoreNum;
  }

  const res = await fetch('/api/profile', {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update profile from resume');
  }

  // Update local user state & broadcast event
  if (typeof window !== 'undefined') {
    localStorage.setItem('worklance_user', JSON.stringify(data.user));
    window.dispatchEvent(new Event('worklance-user-updated'));
  }

  return data.user;
}

export function getCachedResumeStore(): ResumeData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('worklance_ats_resume_store_v2');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.resume || null;
  } catch (e) {
    return null;
  }
}
