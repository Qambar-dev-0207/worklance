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
  status: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
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
        setSkills(Array.isArray(u.skills) ? u.skills.join(', ') : u.skills || '');
      } catch (e) {}
    }

    fetchMyApplications();
    fetchFreshProfile();
  }, []);

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
        setApplications(data.applications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingApps(false);
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

  const handleWithdrawApp = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    try {
      const res = await fetch(`/api/applications?id=${appId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setApplications(applications.filter((a) => a._id !== appId));
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
              Log in to view your profile, applications, and saved jobs.
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

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="container" style={{ padding: '40px 32px 80px', flex: 1, maxWidth: '960px' }}>
        {profileMsg && (
          <div style={{ background: '#000000', color: '#FFFFFF', padding: '12px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '13.5px', fontWeight: 700 }}>
            {profileMsg}
          </div>
        )}

        {/* USER INFO HEADER CARD (MONOTONE) */}
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
                  background: '#000000',
                  color: '#fff',
                  padding: '3px 10px',
                  borderRadius: '100px',
                  textTransform: 'capitalize',
                }}
              >
                {user.role} Account
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

        {/* EDIT PROFILE FORM COLLAPSIBLE */}
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

        {/* APPLICATION TRACKER SECTION (MONOTONE) */}
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
                        background: '#000000',
                        color: '#FFFFFF',
                      }}
                    >
                      {app.status}
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
      </div>
      <Footer />
    </div>
  );
}
