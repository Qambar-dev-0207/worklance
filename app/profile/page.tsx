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

  useEffect(() => {
    const uStr = localStorage.getItem('worklance_user');
    if (uStr) {
      try {
        const u = JSON.parse(uStr);
        setUser(u);
      } catch (e) {}
    }

    fetchMyApplications();
  }, []);

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

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE' });
    localStorage.removeItem('worklance_user');
    setUser(null);
    router.push('/');
    router.refresh();
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-soft)', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '12px' }}>Please Log In</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
              Log in to view your profile, applications, and saved jobs.
            </p>
            <Link href="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Log In
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-soft)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="container" style={{ padding: '40px 32px 80px', flex: 1, maxWidth: '960px' }}>
        {/* USER INFO HEADER CARD */}
        <div
          style={{
            background: '#fff',
            borderRadius: '24px',
            border: '1px solid var(--line)',
            padding: '32px',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-sm)',
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
              background: 'linear-gradient(135deg, var(--navy-deep), var(--navy-2))',
              color: '#fff',
              fontWeight: 800,
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user.avatar || user.name.slice(0, 2).toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{user.name}</h1>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  background: user.role === 'recruiter' ? 'var(--navy-deep)' : 'var(--bg-soft-2)',
                  color: user.role === 'recruiter' ? '#fff' : 'var(--navy)',
                  padding: '3px 10px',
                  borderRadius: '100px',
                  textTransform: 'capitalize',
                }}
              >
                {user.role} Account
              </span>
            </div>
            <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {user.title || user.email} {user.company ? `at ${user.company}` : ''}
            </p>
          </div>

          <div>
            {user.role === 'recruiter' ? (
              <Link href="/jobs/post" className="btn btn-primary">
                + Post Job
              </Link>
            ) : (
              <Link href="/jobs" className="btn btn-primary">
                Browse Jobs
              </Link>
            )}
          </div>
        </div>

        {/* APPLICATION TRACKER SECTION */}
        <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid var(--line)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Application Tracker</h2>

          {loadingApps ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading applications...</div>
          ) : applications.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-soft)', borderRadius: '16px' }}>
              <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                You haven't submitted any job applications yet.
              </p>
              <Link href="/jobs" className="btn btn-primary">
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
                    border: '1px solid var(--line)',
                    background: 'var(--bg-soft)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '2px' }}>
                      {app.jobId?.title || 'Applied Position'}
                    </h3>
                    <div style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                      {app.jobId?.company} · {app.jobId?.location} · Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      padding: '6px 14px',
                      borderRadius: '100px',
                      background:
                        app.status === 'Shortlisted'
                          ? '#DCFCE7'
                          : app.status === 'Interviewing'
                          ? '#FEF08A'
                          : 'var(--bg-soft-2)',
                      color:
                        app.status === 'Shortlisted'
                          ? '#166534'
                          : app.status === 'Interviewing'
                          ? '#854D0E'
                          : 'var(--navy)',
                    }}
                  >
                    Status: {app.status}
                  </span>
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
